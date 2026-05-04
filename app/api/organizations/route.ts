import { NextRequest, NextResponse } from "next/server"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Stopwords for fuzzy org-name matching: ignore generic suffixes/qualifiers.
const STOPWORDS = new Set([
  "hausverwaltung", "verwaltung", "immobilien", "immobilienverwaltung",
  "gmbh", "mbh", "ug", "ag", "kg", "ohg", "gbr", "ev",
  "co", "und", "and", "the",
])

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[.,()\\/]/g, " ")
    .split(/\s+/)
    .filter(w => w && !STOPWORDS.has(w))
    .join(" ")
    .trim()
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1
    }
  }
  return dp[m][n]
}

function firstWordSlug(name: string): string {
  // Pick first non-stopword word, lowercase, ASCII-only.
  // "Hausverwaltung Müller"   → "muller"
  // "Pfafflinger Hausverwaltung" → "pfafflinger"
  // Falls back to first word if all are stopwords.
  const words = name.trim().split(/\s+/)
  const slug = (w: string) => w
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "")
  for (const w of words) {
    const s = slug(w)
    if (s && !STOPWORDS.has(s)) return s
  }
  return slug(words[0] ?? "")
}

export async function POST(request: NextRequest) {
  // Auth — admin or staff only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as { name?: string; force_new?: boolean } | null
  const name = body?.name?.trim() ?? ""
  const forceNew = !!body?.force_new
  if (!name) return NextResponse.json({ error: "Name fehlt" }, { status: 400 })

  const admin = createAdminClient()
  const norm  = normalize(name)
  if (!norm) return NextResponse.json({ error: "Name enthält keine signifikanten Wörter" }, { status: 400 })

  // ── Match against existing orgs ────────────────────────────────────────────
  const { data: orgs } = await admin.from("organizations").select("id, name")
  const all = (orgs ?? []) as { id: string; name: string }[]

  let exactMatch: { id: string; name: string } | null = null
  const fuzzyMatches: { id: string; name: string }[] = []
  for (const o of all) {
    const n = normalize(o.name)
    if (!n) continue
    if (n === norm) { exactMatch = o; break }
    if (n.includes(norm) || norm.includes(n) || levenshtein(n, norm) <= 2) {
      fuzzyMatches.push(o)
    }
  }

  if (exactMatch) {
    return NextResponse.json({ mode: "existing", org: exactMatch })
  }
  if (fuzzyMatches.length > 0 && !forceNew) {
    return NextResponse.json({ mode: "fuzzy", candidates: fuzzyMatches.slice(0, 3) })
  }

  // ── Create new org + auth user + profile ──────────────────────────────────
  const slug = firstWordSlug(name)
  if (!slug) {
    return NextResponse.json(
      { error: "Erstes Wort des Namens enthält keine validen Zeichen für Email" },
      { status: 400 }
    )
  }

  const email    = `${slug}@utilityhub.de`
  const password = `${slug}2026!`
  const warnings: string[] = []

  // Step 1: create organization (must succeed; everything else degrades gracefully)
  const { data: newOrg, error: orgErr } = await admin
    .from("organizations")
    .insert({ name, org_type: "hausverwaltung", status: "active" })
    .select("id, name")
    .single()
  if (orgErr || !newOrg) {
    return NextResponse.json(
      { error: "Org-Anlage fehlgeschlagen: " + (orgErr?.message ?? "unbekannt") },
      { status: 500 }
    )
  }

  const errMsg = (e: unknown): string => {
    if (e instanceof Error) return e.message
    if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message)
    return JSON.stringify(e)
  }

  // Step 1b: create Hauptordner customer for this org (default upload target).
  // Failure → warning, continue (profile.customer_id will remain null).
  let hauptordnerId: string | null = null
  try {
    const { data: ho, error: hoErr } = await admin
      .from("customers")
      .insert({
        organization_id: newOrg.id,
        full_name:       `${name} (Allgemein)`,
        source:          "manual",
        status:          "active",
        country:         "DE",
      })
      .select("id")
      .single()
    if (hoErr) throw hoErr
    hauptordnerId = ho?.id ?? null
  } catch (e) {
    warnings.push("Hauptordner-Anlage fehlgeschlagen: " + errMsg(e))
  }

  // Step 2: create auth user (failure → log warning, continue)
  // The handle_new_user() trigger on auth.users will auto-create a profile row
  // (id, full_name from user_metadata.full_name, role='customer') with ON CONFLICT DO NOTHING.
  let userId: string | null = null
  try {
    const { data: created, error: ue } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })
    if (ue) throw ue
    userId = created.user?.id ?? null
    if (!userId) throw new Error("Auth-User erstellt, aber keine ID zurückgegeben")
  } catch (e) {
    warnings.push("Auth-User-Anlage fehlgeschlagen: " + errMsg(e))
  }

  // Step 3: link profile (auto-created by trigger) to the new organization.
  // We UPDATE rather than INSERT to avoid PK conflict with the trigger-created row.
  let profileCreated = false
  if (userId) {
    try {
      const { error: pe } = await admin
        .from("profiles")
        .update({
          organization_id:  newOrg.id,
          customer_id:      hauptordnerId,
          full_name:        name,
          password_changed: false,
        })
        .eq("id", userId)
      if (pe) throw pe
      profileCreated = true
    } catch (e) {
      warnings.push("Profile-Verknüpfung fehlgeschlagen: " + errMsg(e))
    }
  }

  return NextResponse.json({
    mode: "created",
    org: newOrg,
    credentials: profileCreated ? { email, password } : null,
    warnings: warnings.length > 0 ? warnings : undefined,
  })
}
