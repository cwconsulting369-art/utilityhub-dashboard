import { NextRequest, NextResponse } from "next/server"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buildCsv, csvHeaders } from "@/lib/export/csv"

/**
 * GET /api/export/teleson
 * Optional query params: ?energie=Strom|Gas|… &status=beliefert|…
 *
 * Returns a UTF-8 CSV of all teleson_records with the associated customer name.
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

  const energie      = req.nextUrl.searchParams.get("energie") ?? ""
  const telesonStatus = req.nextUrl.searchParams.get("status")  ?? ""

  const admin = createAdminClient()
  let query = admin
    .from("teleson_records")
    .select(`
      id, knr, malo, weg, energie, status, lieferstatus,
      vorversorger, neuer_versorger, belieferungsdatum,
      alt_ap_ct_kwh, neu_ap, zaehlernummer, laufzeit, gebunden_bis,
      grund_info, created_at,
      customers!customer_id(full_name, city, postal_code)
    `)
    .order("created_at", { ascending: false })

  if (energie)       query = query.ilike("energie", energie)
  if (telesonStatus) query = query.eq("status", telesonStatus)

  const { data: records, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!records?.length) {
    return new NextResponse("Keine Teleson-Datensätze vorhanden", { status: 404 })
  }

  const headers = [
    "Kunde", "Stadt", "PLZ",
    "KNR", "MALO", "WEG",
    "Energie", "Status", "Lieferstatus",
    "Vorversorger", "Neuer Versorger",
    "Belieferungsdatum", "Alt AP ct/kWh", "Neu AP ct/kWh",
    "Zählernummer", "Laufzeit", "Gebunden bis", "Grund / Info",
    "Erfasst am",
  ]

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString("de-DE") : null

  const rows = records.map(r => {
    const c = r.customers as { full_name?: string; city?: string; postal_code?: string } | null
    return [
      c?.full_name, c?.city, c?.postal_code,
      r.knr, r.malo, r.weg,
      r.energie, r.status, r.lieferstatus,
      r.vorversorger, r.neuer_versorger,
      fmt(r.belieferungsdatum), r.alt_ap_ct_kwh, r.neu_ap,
      r.zaehlernummer, r.laufzeit, fmt(r.gebunden_bis), r.grund_info,
      fmt(r.created_at),
    ]
  })

  const date         = new Date().toISOString().slice(0, 10)
  const suffix       = [energie, telesonStatus].filter(Boolean).join("-")
  const filename     = `teleson${suffix ? `-${suffix}` : ""}-${date}.csv`

  return new NextResponse(buildCsv(headers, rows), { headers: csvHeaders(filename) })
}
