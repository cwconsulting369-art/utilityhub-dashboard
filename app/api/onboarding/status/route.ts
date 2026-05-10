import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export interface OnboardingStep {
  id:    string
  label: string
  href:  string
  done:  boolean
}

export interface OnboardingStatusResponse {
  show:  boolean
  steps: OnboardingStep[]
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role === "customer") {
    return NextResponse.json({ show: false, steps: [] } satisfies OnboardingStatusResponse)
  }

  const admin = createAdminClient()

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

  const steps: OnboardingStep[] = [
    {
      id:    "profile",
      label: "Profil vervollständigen",
      href:  "/admin/settings",
      done:  !!profile.full_name?.trim(),
    },
    {
      id:    "first_object",
      label: "Erste Immobilie erfassen",
      href:  "/admin/customers",
      done:  (customerCount ?? 0) > 0,
    },
    {
      id:    "first_document",
      label: "Dokument hochladen",
      href:  "/admin/documents",
      done:  (documentCount ?? 0) > 0,
    },
    {
      id:    "first_import",
      label: "Import durchführen",
      href:  "/admin/imports",
      done:  (importCount ?? 0) > 0,
    },
    {
      id:    "invite_team",
      label: "Team-Mitglied einladen",
      href:  "/admin/settings",
      done:  (staffCount ?? 0) > 1,
    },
  ]

  const allDone = steps.every(s => s.done)

  return NextResponse.json({ show: !allDone, steps } satisfies OnboardingStatusResponse)
}
