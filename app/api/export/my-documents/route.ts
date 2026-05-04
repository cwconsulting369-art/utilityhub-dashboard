import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildCsv, csvHeaders } from "@/lib/export/csv"

/**
 * GET /api/export/my-documents
 * Customer-facing. Returns only the logged-in customer's visible documents.
 * RLS on customer_documents enforces: customer_id = get_my_customer_id() AND visible_to_customer = true
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role, customer_id").eq("id", user.id).single()
  if (!profile || profile.role !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!profile.customer_id) {
    return NextResponse.json({ error: "Kein Kundenkonto verknüpft" }, { status: 403 })
  }

  // RLS automatically filters to own visible documents — server client uses session cookie
  const { data: docs, error } = await supabase
    .from("customer_documents")
    .select("name, title, doc_type, mime_type, size_bytes, created_at")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!docs?.length) {
    return new NextResponse("Keine Dokumente vorhanden", { status: 404 })
  }

  const headers = ["Titel", "Dateiname", "Dokumenttyp", "Größe (KB)", "Hochgeladen am"]

  const rows = docs.map(d => [
    d.title ?? d.name,
    d.name,
    d.doc_type ?? "—",
    d.size_bytes ? Math.round(d.size_bytes / 1024) : null,
    new Date(d.created_at).toLocaleDateString("de-DE"),
  ])

  const date     = new Date().toISOString().slice(0, 10)
  const filename = `meine-dokumente-${date}.csv`

  return new NextResponse(buildCsv(headers, rows), { headers: csvHeaders(filename) })
}
