import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PrintButton } from "./PrintButton"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("customers").select("full_name").eq("id", id).single()
  return { title: data?.full_name ? `${data.full_name} – Druckansicht` : "Druckansicht" }
}

const ENERGIE_COLORS: Record<string, string> = {
  strom: "#1d6fa4", gas: "#b35a00", wärme: "#b01c1c", wasser: "#1a6b2d",
}

function energieText(e: string | null) {
  if (!e) return "—"
  const color = ENERGIE_COLORS[e.toLowerCase()] ?? "#555"
  return <strong style={{ color }}>{e}</strong>
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString("de-DE") : "—"
}

export default async function PrintPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: customer },
    { data: identities },
    { data: records },
    { data: documents },
  ] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("customer_identities").select("*").eq("customer_id", id).order("created_at"),
    supabase.from("teleson_records").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("customer_documents").select("id, name, mime_type, size_bytes, created_at").eq("customer_id", id).order("created_at", { ascending: false }),
  ])

  if (!customer) notFound()

  const isWeg    = identities?.some(i => i.system === "weg") ?? false
  const knrList  = identities?.filter(i => i.system === "teleson").map(i => i.external_id) ?? []
  const maloList = identities?.filter(i => i.system === "malo").map(i => i.external_id)   ?? []

  const statusLabels: Record<string, string> = {
    active: "Aktiv", inactive: "Inaktiv", blocked: "Gesperrt", pending: "Ausstehend",
  }

  const contact: [string, string | null][] = [
    ["E-Mail",   customer.email],
    ["Telefon",  customer.phone],
    ["Adresse",  customer.address],
    ["Stadt",    customer.city],
    ["PLZ",      customer.postal_code],
    ["Land",     customer.country !== "DE" ? customer.country : null],
  ]

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          table { page-break-inside: auto; }
          tr    { page-break-inside: avoid; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
          font-size: 13px; color: #1a1a1a; background: #fff; margin: 0; padding: 0;
        }
        .page { max-width: 900px; margin: 0 auto; padding: 32px 40px; }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
        h2 { font-size: 13px; font-weight: 700; text-transform: uppercase;
             letter-spacing: 0.06em; color: #666; margin: 24px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { text-align: left; padding: 6px 10px; background: #f5f5f5;
             font-weight: 600; border: 1px solid #e0e0e0; white-space: nowrap; }
        td { padding: 5px 10px; border: 1px solid #e0e0e0; vertical-align: top; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .field label { display: block; font-size: 11px; color: #888; margin-bottom: 2px; }
        .field span  { font-weight: 500; }
        .badge { display: inline-block; padding: 1px 8px; border-radius: 4px;
                 font-size: 11px; font-weight: 600; border: 1px solid currentColor; }
        .header { display: flex; justify-content: space-between; align-items: flex-start;
                  margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #1a1a1a; }
        .branding { font-size: 11px; color: #999; text-align: right; }
        .mono { font-family: "Courier New", monospace; }
        .muted { color: #888; }
      `}</style>

      <div className="page">

        {/* Page header */}
        <div className="header">
          <div>
            <h1>{customer.full_name}{isWeg && <span className="badge" style={{ marginLeft: 10, color: "#888", fontSize: 11 }}>WEG</span>}</h1>
            <div style={{ marginTop: 4, display: "flex", gap: 12, alignItems: "center" }}>
              <span className="badge" style={{
                color: customer.status === "active" ? "#1a6b2d" : customer.status === "blocked" ? "#b01c1c" : "#666",
              }}>
                {statusLabels[customer.status] ?? customer.status}
              </span>
              {knrList.length > 0 && <span className="muted">KNR: <span className="mono">{knrList.join(", ")}</span></span>}
              {maloList.length > 0 && <span className="muted">MALO: <span className="mono">{maloList.join(", ")}</span></span>}
            </div>
          </div>
          <div className="branding">
            <div style={{ fontWeight: 700, fontSize: 14 }}>UtilityHub</div>
            <div>Erstellt: {new Date().toLocaleDateString("de-DE")}</div>
            <div className="no-print" style={{ marginTop: 8 }}>
              <PrintButton />
            </div>
          </div>
        </div>

        {/* Stammdaten */}
        {(!isWeg || contact.some(([, v]) => v)) && (
          <>
            <h2>Stammdaten</h2>
            <div className="grid">
              {contact.map(([label, value]) => (
                <div className="field" key={label}>
                  <label>{label}</label>
                  <span>{value ?? <span className="muted">—</span>}</span>
                </div>
              ))}
              <div className="field">
                <label>Quelle</label>
                <span>{customer.source ?? <span className="muted">—</span>}</span>
              </div>
              <div className="field">
                <label>Angelegt</label>
                <span>{fmt(customer.created_at)}</span>
              </div>
              <div className="field">
                <label>Aktualisiert</label>
                <span>{fmt(customer.updated_at)}</span>
              </div>
            </div>
          </>
        )}

        {/* Teleson records */}
        {records && records.length > 0 && (
          <>
            <h2>Teleson-Datensätze ({records.length})</h2>
            <table>
              <thead>
                <tr>
                  {!isWeg && <th>WEG</th>}
                  <th>Energie</th>
                  <th>Status</th>
                  <th>KNR</th>
                  <th>Lieferstatus</th>
                  <th>Vorversorger</th>
                  <th>Neuer Versorger</th>
                  <th>Belieferung</th>
                  <th>Zählernr.</th>
                  <th>Alt AP</th>
                  <th>Neu AP</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const neuAp = r.neu_ap != null ? parseFloat(String(r.neu_ap)) : null
                  return (
                    <tr key={r.id}>
                      {!isWeg && <td className="muted">{r.weg ?? "—"}</td>}
                      <td>{energieText(r.energie)}</td>
                      <td>{r.status ?? "—"}</td>
                      <td className="mono">{r.knr ?? "—"}</td>
                      <td>{r.lieferstatus ?? "—"}</td>
                      <td>{r.vorversorger ?? "—"}</td>
                      <td>{r.neuer_versorger ?? "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{r.belieferungsdatum ? fmt(r.belieferungsdatum) : "—"}</td>
                      <td className="mono">{r.zaehlernummer ?? "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {r.alt_ap_ct_kwh != null
                          ? `${Number(r.alt_ap_ct_kwh).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ct/kWh`
                          : "—"}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {neuAp != null && !isNaN(neuAp)
                          ? `${neuAp.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ct/kWh`
                          : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {records.some(r => r.grund_info) && (
              <div style={{ marginTop: 8, fontSize: 12 }}>
                {records.filter(r => r.grund_info).map(r => (
                  <div key={r.id} style={{ marginBottom: 4 }}>
                    <span className="muted">{r.knr ?? r.energie ?? "Record"}: </span>
                    {r.grund_info}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Documents */}
        {documents && documents.length > 0 && (
          <>
            <h2>Dokumente ({documents.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Typ</th>
                  <th>Größe</th>
                  <th>Hochgeladen</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td className="muted">{d.mime_type ?? "—"}</td>
                    <td className="muted">
                      {d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB` : "—"}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{fmt(d.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 12, borderTop: "1px solid #ddd", fontSize: 11, color: "#aaa", display: "flex", justifyContent: "space-between" }}>
          <span>UtilityHub — Internes Dokument — Nicht zur Weitergabe bestimmt</span>
          <span>Druckdatum: {new Date().toLocaleDateString("de-DE")}</span>
        </div>

      </div>
    </>
  )
}
