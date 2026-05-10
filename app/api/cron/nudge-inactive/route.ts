import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"

// Called daily by Vercel Cron (see vercel.json).
// Sends a single nudge-email to admin/staff users who:
//   1. Registered more than 48h ago
//   2. Have not logged in within the last 48h  OR have never logged in after signup
//   3. Have not yet received a nudge email (onboarding_nudge_sent_at IS NULL)
//   4. Still have incomplete onboarding steps
//
// Secured by a shared CRON_SECRET header to prevent public triggering.

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const admin  = createAdminClient()

  // Find staff/admin profiles that haven't been nudged yet
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, full_name, onboarding_nudge_sent_at")
    .in("role", ["admin", "staff"])
    .eq("is_active", true)
    .is("onboarding_nudge_sent_at", null)

  if (profilesError) {
    console.error("[nudge-inactive] profiles fetch error:", profilesError)
    return NextResponse.json({ error: "db_error" }, { status: 500 })
  }

  if (!profiles?.length) {
    return NextResponse.json({ sent: 0, message: "No candidates" })
  }

  const cutoff = new Date(Date.now() - FORTY_EIGHT_HOURS_MS).toISOString()

  // Fetch auth.users for these profiles to check last_sign_in_at and email
  const { data: authUsers, error: authError } = await admin.auth.admin.listUsers({
    perPage: 1000,
  })

  if (authError) {
    console.error("[nudge-inactive] auth.users fetch error:", authError)
    return NextResponse.json({ error: "auth_error" }, { status: 500 })
  }

  const profileIds = new Set(profiles.map(p => p.id))
  const eligibleAuthUsers = (authUsers?.users ?? []).filter(u => {
    if (!profileIds.has(u.id)) return false
    // Must have been created >48h ago
    if (new Date(u.created_at).getTime() > Date.now() - FORTY_EIGHT_HOURS_MS) return false
    // Must not have logged in within last 48h
    const lastLogin = u.last_sign_in_at
    if (lastLogin && new Date(lastLogin).getTime() > Date.now() - FORTY_EIGHT_HOURS_MS) return false
    return true
  })

  if (!eligibleAuthUsers.length) {
    return NextResponse.json({ sent: 0, message: "No inactive users past cutoff" })
  }

  // Check onboarding completion for eligibles
  const [
    { count: customerCount },
    { count: documentCount },
    { count: importCount },
    { count: staffCount },
  ] = await Promise.all([
    admin.from("customers").select("*", { count: "exact", head: true }),
    admin.from("customer_documents").select("*", { count: "exact", head: true }),
    admin.from("import_batches").select("*", { count: "exact", head: true }).eq("status", "completed"),
    admin.from("profiles").select("*", { count: "exact", head: true }).in("role", ["admin", "staff"]),
  ])

  const steps = [
    { label: "Profil vervollständigen",  href: "/admin/settings",   done: false },
    { label: "Erste Immobilie erfassen", href: "/admin/customers",  done: (customerCount ?? 0) > 0 },
    { label: "Dokument hochladen",       href: "/admin/documents",  done: (documentCount ?? 0) > 0 },
    { label: "Import durchführen",       href: "/admin/imports",    done: (importCount ?? 0) > 0 },
    { label: "Team-Mitglied einladen",   href: "/admin/settings",   done: (staffCount ?? 0) > 1 },
  ]

  const openSteps = steps.filter(s => !s.done)

  // If everything is already done, no email needed
  if (!openSteps.length) {
    return NextResponse.json({ sent: 0, message: "All onboarding steps already complete" })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://utility-hub.one"
  let sent = 0

  for (const authUser of eligibleAuthUsers) {
    const profile = profiles.find(p => p.id === authUser.id)
    if (!authUser.email) continue

    // Step 1 (profile complete) is user-specific — check this user's full_name
    const profileStepDone = !!profile?.full_name?.trim()
    const userOpenSteps = steps.map((s, i) =>
      i === 0 ? { ...s, done: profileStepDone } : s
    ).filter(s => !s.done)

    if (!userOpenSteps.length) continue

    const firstName = profile?.full_name?.split(" ")[0] ?? "dort"
    const stepList  = userOpenSteps
      .map(s => `• <a href="${appUrl}${s.href}" style="color:#58a6ff">${s.label}</a>`)
      .join("<br>")

    const { error: emailError } = await resend.emails.send({
      from:    `UtilityHub <noreply@utility-hub.one>`,
      to:      authUser.email,
      subject: `Du hast noch ${userOpenSteps.length} Setup-Schritt${userOpenSteps.length > 1 ? "e" : ""} offen`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#e6edf3;background:#0d1117;padding:32px;border-radius:12px">
          <div style="margin-bottom:24px">
            <span style="font-weight:700;font-size:18px">UtilityHub</span>
          </div>
          <h1 style="font-size:20px;margin:0 0 12px">Hallo${firstName !== "dort" ? ` ${firstName}` : ""},</h1>
          <p style="color:#8b949e;line-height:1.6;margin:0 0 20px">
            Du hast dich vor einer Weile bei UtilityHub registriert — großartig!
            Damit du das volle Potenzial nutzen kannst, fehlen noch ein paar Schritte:
          </p>
          <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px 20px;margin-bottom:24px;line-height:2">
            ${stepList}
          </div>
          <a href="${appUrl}/admin/dashboard"
             style="display:inline-block;background:#1f6feb;color:#fff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600">
            Jetzt Setup abschließen →
          </a>
          <p style="margin-top:32px;font-size:12px;color:#8b949e">
            Du erhältst diese Email einmalig. Falls du Fragen hast, antworte einfach auf diese Nachricht.
          </p>
        </div>
      `,
    })

    if (emailError) {
      console.error(`[nudge-inactive] email error for ${authUser.email}:`, emailError)
      continue
    }

    // Mark as nudged
    await admin
      .from("profiles")
      .update({ onboarding_nudge_sent_at: new Date().toISOString() })
      .eq("id", authUser.id)

    sent++
  }

  console.log(`[nudge-inactive] sent ${sent} nudge emails (cutoff: ${cutoff})`)
  return NextResponse.json({ sent })
}
