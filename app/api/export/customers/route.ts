import { NextRequest, NextResponse } from "next/server"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildCsv, csvHeaders } from "@/lib/export/csv"

/**
 * GET /api/export/customers
 * Optional query params: ?status=active|inactive|blocked|pending
 *
 * Returns a UTF-8 CSV with all customer data including KNR, MALO and WEG identities.
 */
export async function GET(req: NextRequest) {
  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const status = req.nextUrl.searchParams.get("status") ?? ""
  const VALID  = ["active", "inactive", "blocked", "pending"]

  const admin = createAdminClient()
  let query = admin
    .from("customers")
    .select("id, full_name, email, phone, address, city, postal_code, country, status, source, created_at, customer_identities(system, external_id)")
    .order("full_name")

  if (status && VALID.includes(status)) query = query.eq("status", status)

  const { data: customers, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!customers?.length) {
    return new NextResponse("Keine Kundendaten vorhanden", { status: 404 })
  }

  const headers = [
    "ID", "Name", "E-Mail", "Telefon", "Adresse", "Stadt", "PLZ", "Land",
    "Status", "Quelle", "KNR", "MALO", "WEG", "Angelegt",
  ]

  const rows = customers.map(c => {
    const ids  = c.customer_identities ?? []
    const knr  = ids.find(i => i.system === "teleson")?.external_id ?? null
    const malo = ids.find(i => i.system === "malo")?.external_id    ?? null
    const weg  = ids.find(i => i.system === "weg")?.external_id     ?? null
    return [
      c.id, c.full_name, c.email, c.phone, c.address,
      c.city, c.postal_code, c.country, c.status, c.source,
      knr, malo, weg,
      new Date(c.created_at).toLocaleDateString("de-DE"),
    ]
  })

  const date     = new Date().toISOString().slice(0, 10)
  const suffix   = status ? `-${status}` : ""
  const filename = `kunden${suffix}-${date}.csv`

  return new NextResponse(buildCsv(headers, rows), { headers: csvHeaders(filename) })
}
