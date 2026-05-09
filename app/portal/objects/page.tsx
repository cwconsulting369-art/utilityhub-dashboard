import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { getStreet } from "@/lib/customers/format"

export const metadata = { title: "Meine Objekte | UtilityHub" }

interface Identity { system: string; external_id: string }

interface TelesonRec {
  energie:         string | null
  neuer_versorger: string | null
  neu_ap:          number | null
  status:          string | null
  malo:            string | null
  zaehlernummer:   string | null
  knr:             string | null
  created_at:      string | null
}

interface ObjectRow {
  id:                   string
  full_name:            string
  status:               string
  object_type:          string | null
  city:                 string | null
  postal_code:          string | null
  customer_identities:  Identity[] | null
  teleson_records:      TelesonRec[] | null
  upsell_opportunities: { id: string; status: string }[] | null
}

function fmtAp(val: number | null): string {
  if (val === null || val === undefined) return ""
  return val.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " ct"
}

function MonoCell({ value }: { value: string | null }) {
  if (!value) return <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
  return <span style={{ fontFamily: "monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{value}</span>
}

function TarifCell({ rec, color }: { rec: TelesonRec | null; color: string }) {
  if (!rec) return <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
  const ap = fmtAp(rec.neu_ap)
  if (!rec.neuer_versorger && !ap) return <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
  return (
    <div style={{ fontSize: "var(--text-xs)", lineHeight: 1.4 }}>
      {rec.neuer_versorger && <div style={{ fontWeight: 600, color: "#ffffff" }}>{rec.neuer_versorger}</div>}
      {ap && <div style={{ color }}>{ap}</div>}
    </div>
  )
}

export default async function PortalObjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const organizationId = profile?.organization_id ?? null

  if (!organizationId) {
    return (
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-8)",
        textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)",
      }}>
        Keine Hausverwaltung mit Ihrem Konto verknüpft.<br />
        Bitte wenden Sie sich an den Support.
      </div>
    )
  }

  const [{ data: org }, { data: customers }] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", organizationId).single(),
    supabase.from("customers")
      .select(
        "id, full_name, status, object_type, city, postal_code, " +
        "customer_identities(system, external_id), " +
        "teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, knr, created_at), " +
        "upsell_opportunities(id, status)"
      )
      .eq("organization_id", organizationId)
      .order("full_name"),
  ])

  const rows = (customers ?? []) as unknown as ObjectRow[]

  const TH: React.CSSProperties = {
    padding: "var(--space-3) var(--space-4)",
    textAlign: "left", color: "var(--text-muted)",
    fontWeight: 500, whiteSpace: "nowrap",
  }
  const TD: React.CSSProperties = { padding: "var(--space-3) var(--space-4)" }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
          Objekte
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          {rows.length} {rows.length === 1 ? "Objekt" : "Objekte"} Ihrer Hausverwaltung
        </p>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {rows.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Objekt", "Adresse", "Malo", "Zählernummer", "KNR", "Strom", "Gas", "Potenzial", "Typ", "Status"].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(c => {
                  const recs       = c.teleson_records ?? []
                  const stromRec   = recs.find(r => r.energie?.toLowerCase() === "strom") ?? null
                  const gasRec     = recs.find(r => r.energie?.toLowerCase() === "gas")   ?? null
                  const addr       = [c.postal_code, c.city].filter(Boolean).join(" ") || null
                  const malo       = recs.map(r => r.malo).find(Boolean) ?? null
                  const latestRec  = [...recs].sort((a, b) =>
                    String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
                  )[0]
                  const zNrRaw     = latestRec?.zaehlernummer ?? null
                  const zNr        = zNrRaw ? ((zNrRaw.split(":").pop() ?? zNrRaw).trim() || null) : null
                  const knr        = (c.customer_identities ?? [])
                                       .find(i => i.system === "knr" || i.system === "teleson")
                                       ?.external_id ?? null
                  const openPot    = (c.upsell_opportunities ?? []).filter(p => p.status === "open").length

                  const detailHref = `/portal/objects/${c.id}`
                  const cellLinkBase: React.CSSProperties = {
                    display: "block",
                    padding: "var(--space-3) var(--space-4)",
                    color: "inherit", textDecoration: "none",
                  }
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}>

                      {/* Objekt */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={{ ...cellLinkBase, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/building-placeholder.jpg" alt="Gebäude" style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
                          <span style={{ fontWeight: 600, color: "#ffffff" }}>{getStreet(c.full_name)}</span>
                        </a>
                      </td>

                      {/* Adresse */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={{ ...cellLinkBase, color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}>
                          {addr ?? <span style={{ opacity: 0.4 }}>—</span>}
                        </a>
                      </td>

                      {/* Malo */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}><MonoCell value={malo} /></a>
                      </td>

                      {/* Zählernummer */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}><MonoCell value={zNr} /></a>
                      </td>

                      {/* KNR */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}><MonoCell value={knr} /></a>
                      </td>

                      {/* Strom */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}><TarifCell rec={stromRec} color="#58a6ff" /></a>
                      </td>

                      {/* Gas */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}><TarifCell rec={gasRec} color="#ffa600" /></a>
                      </td>

                      {/* Potenzial */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}>
                          {openPot > 0
                            ? <span style={{ fontSize: "10px", fontWeight: 700, color: "#ffa600" }}>{openPot} offen</span>
                            : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>}
                        </a>
                      </td>

                      {/* Typ */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={{ ...cellLinkBase, whiteSpace: "nowrap" }}>
                          <span style={{
                            background: "rgba(139,148,158,0.1)", color: "var(--text-muted)",
                            border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                            padding: "1px 7px", fontSize: "10px", fontWeight: 600,
                          }}>
                            {c.object_type === "weg" ? "WEG" : "Privat"}
                          </span>
                        </a>
                      </td>

                      {/* Status */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}><StatusBadge status={c.status} /></a>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "var(--space-12)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Noch keine Objekte vorhanden.
          </div>
        )}
      </div>

    </div>
  )
}
