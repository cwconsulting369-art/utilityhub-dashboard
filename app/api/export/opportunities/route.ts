import { NextResponse } from "next/server"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildCsv, csvHeaders } from "@/lib/export/csv"

const STATUS_LABELS: Record<string, string> = {
  open: "Offen", in_progress: "In Bearbeitung", won: "Gewonnen", lost: "Verloren",
}
const PRIORITY_LABELS: Record<string, string> = {
  low: "Niedrig", medium: "Mittel", high: "Hoch",
}
const SOURCE_LABELS: Record<string, string> = {
  manual: "Manuell", auto_rule: "Automatisch",
}

/**
 * GET /api/export/opportunities
 * Staff/admin only. Returns a CSV of all upsell opportunities with customer info.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: opps, error } = await admin
    .from("upsell_opportunities")
    .select(`
      title, description, status, priority, source, due_date, created_at,
      customer:customers!customer_id(full_name),
      assignee:profiles!assigned_to(full_name)
    `)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!opps?.length) {
    return new NextResponse("Keine Opportunitäten vorhanden", { status: 404 })
  }

  const headers = [
    "Kunde", "Titel", "Beschreibung", "Status", "Priorität",
    "Quelle", "Zugewiesen an", "Fälligkeitsdatum", "Erstellt am",
  ]

  const rows = opps.map(o => {
    const customer  = (o.customer  as { full_name?: string } | null)?.full_name ?? "—"
    const assignee  = (o.assignee  as { full_name?: string } | null)?.full_name ?? "—"
    return [
      customer,
      o.title,
      o.description ?? null,
      STATUS_LABELS[o.status]   ?? o.status,
      PRIORITY_LABELS[o.priority] ?? o.priority,
      SOURCE_LABELS[o.source]   ?? o.source,
      assignee,
      o.due_date ? new Date(o.due_date).toLocaleDateString("de-DE") : null,
      new Date(o.created_at).toLocaleDateString("de-DE"),
    ]
  })

  const date     = new Date().toISOString().slice(0, 10)
  const filename = `upsell-${date}.csv`

  return new NextResponse(buildCsv(headers, rows), { headers: csvHeaders(filename) })
}
