import { NextResponse } from "next/server"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildCsv, csvHeaders } from "@/lib/export/csv"

/**
 * GET /api/export/documents
 * Staff/admin only. Returns a CSV of all uploaded documents with customer info.
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
  const { data: docs, error } = await admin
    .from("customer_documents")
    .select(`
      id, name, title, doc_type, mime_type, size_bytes,
      visible_to_customer, source, created_at,
      customers!customer_id(full_name),
      uploaded_by:profiles!uploaded_by(full_name)
    `)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!docs?.length) {
    return new NextResponse("Keine Dokumente vorhanden", { status: 404 })
  }

  const headers = [
    "Objekt", "Titel", "Dateiname", "Dokumenttyp",
    "Für Kunden sichtbar", "Größe (KB)", "Quelle",
    "Hochgeladen von", "Hochgeladen am",
  ]

  const rows = docs.map(d => {
    const customer  = (d.customers  as { full_name?: string } | null)?.full_name ?? "—"
    const uploader  = (d.uploaded_by as { full_name?: string } | null)?.full_name ?? "—"
    const sizeKb    = d.size_bytes ? Math.round(d.size_bytes / 1024) : null
    return [
      customer,
      d.title ?? d.name,
      d.name,
      d.doc_type ?? "—",
      d.visible_to_customer ? "Ja" : "Nein",
      sizeKb,
      d.source,
      uploader,
      new Date(d.created_at).toLocaleDateString("de-DE"),
    ]
  })

  const date     = new Date().toISOString().slice(0, 10)
  const filename = `dokumente-${date}.csv`

  return new NextResponse(buildCsv(headers, rows), { headers: csvHeaders(filename) })
}
