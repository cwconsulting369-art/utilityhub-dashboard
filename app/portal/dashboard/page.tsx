import { createClient } from "@/lib/supabase/server"
import { redirect }     from "next/navigation"
import { StatusBadge }  from "@/components/ui/StatusBadge"
import { getStreet }    from "@/lib/customers/format"

export const metadata = { title: "Mein Portal | UtilityHub" }

type RecentRow = {
  id:          string
  full_name:   string
  status:      string
  object_type: string | null
  city:        string | null
  postal_code: string | null
  teleson_records: {
    energie:         string | null
    neuer_versorger: string | null
    neu_ap:          number | null
    status:          string | null
    malo:            string | null
    zaehlernummer:   string | null
    knr:             string | null
    created_at:      string | null
  }[] | null
  customer_identities: { system: string; external_id: string }[] | null
}

export default async function PortalDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, customer_id, organization_id")
    .eq("id", user.id)
    .single()

  const organizationId = profile?.organization_id ?? null
  const customerId     = profile?.customer_id     ?? null
  const displayName    = profile?.full_name ?? user.email ?? ""

  // ── Org-Modus: ALLE Objekte der Hausverwaltung ─────────────────────────
  let orgName: string | null = null
  let orgObjectCount   = 0
  let orgStromCount    = 0
  let orgGasCount      = 0
  let orgFgFinanzCount = 0
  let orgOpenPotCount  = 0
  let objectsWithTeleson = 0
  let objectsWithDocs    = 0
  let orgRecent: RecentRow[] = []

  if (organizationId) {
    const [{ data: org }, { data: custs }] = await Promise.all([
      supabase.from("organizations").select("name").eq("id", organizationId).single(),
      supabase.from("customers").select("id").eq("organization_id", organizationId),
    ])
    orgName        = org?.name ?? null
    const ids      = (custs ?? []).map(c => c.id)
    orgObjectCount = ids.length

    if (ids.length > 0) {
      const [
        { data: tel },
        { data: docs },
        { data: recent },
        { count: fgCount },
        { count: openPotCount },
      ] = await Promise.all([
        supabase.from("teleson_records").select("energie, customer_id").in("customer_id", ids),
        supabase.from("customer_documents")
          .select("customer_id")
          .in("customer_id", ids)
          .eq("visible_to_customer", true),
        supabase.from("customers")
          .select(
            "id, full_name, status, object_type, city, postal_code, " +
            "teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, knr, created_at), " +
            "customer_identities(system, external_id)"
          )
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.from("fg_finanz_records")
          .select("id", { count: "exact", head: true })
          .in("customer_id", ids),
        supabase.from("upsell_opportunities")
          .select("id", { count: "exact", head: true })
          .in("customer_id", ids)
          .eq("status", "open"),
      ])
      const teleson = (tel  ?? []) as { energie: string | null; customer_id: string }[]
      const docList = (docs ?? []) as { customer_id: string }[]
      orgStromCount      = teleson.filter(r => r.energie?.toLowerCase() === "strom").length
      orgGasCount        = teleson.filter(r => r.energie?.toLowerCase() === "gas").length
      objectsWithTeleson = new Set(teleson.map(r => r.customer_id)).size
      objectsWithDocs    = new Set(docList.map(d => d.customer_id)).size
      orgRecent          = (recent ?? []) as unknown as RecentRow[]
      orgFgFinanzCount   = fgCount      ?? 0
      orgOpenPotCount    = openPotCount ?? 0
    }
  }

  const telesonCovPct = orgObjectCount > 0 ? Math.round(objectsWithTeleson / orgObjectCount * 100) : 0
  const docsCovPct    = orgObjectCount > 0 ? Math.round(objectsWithDocs    / orgObjectCount * 100) : 0

  const coverageRows = [
    { label: "Objekte mit Energiedaten (Teleson)", count: objectsWithTeleson, pct: telesonCovPct, color: "#58a6ff" },
    { label: "Objekte mit Dokumenten",             count: objectsWithDocs,    pct: docsCovPct,    color: "#3fb950" },
  ]

  // ── Single-Customer-Fallback (wenn keine organization_id) ──────────────
  let customer: { full_name: string; address_display: string | null; city: string | null; postal_code: string | null; object_type: string | null } | null = null
  let singleStromCount = 0
  let singleGasCount   = 0

  if (!organizationId && customerId) {
    const [customerRes, telesonRes] = await Promise.all([
      supabase.from("customers")
        .select("full_name, address_display, city, postal_code, object_type")
        .eq("id", customerId)
        .single(),
      supabase.from("teleson_records").select("energie").eq("customer_id", customerId),
    ])
    customer         = customerRes.data
    const teleson    = (telesonRes.data ?? []) as { energie: string | null }[]
    singleStromCount = teleson.filter(r => r.energie?.toLowerCase() === "strom").length
    singleGasCount   = teleson.filter(r => r.energie?.toLowerCase() === "gas").length
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* ── Begrüßung ─────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
          Willkommen{displayName ? `, ${displayName}` : ""}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Ihr persönliches UtilityHub-Portal
        </p>
      </div>

      {/* ── Hauptkarte (Org-Modus oder Single-Modus) ──────────────────────── */}
      {organizationId ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
        }}>
          <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-4)" }}>
            Ihre Hausverwaltung
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>
              {orgName ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-4)" }}>
              <Stat icon="🏢" value={orgObjectCount}   label="Objekte"             color="var(--text)" href="/portal/objects" />
              <Stat icon="⚡" value={orgStromCount}    label="Strom-Lieferstellen" color="#58a6ff" />
              <Stat icon="🔥" value={orgGasCount}      label="Gas-Lieferstellen"   color="#ffa600" />
              <Stat icon="💼" value={orgFgFinanzCount} label="FG-Finanz-Verträge"  color="#a78bfa" />
              <Stat icon="🎯" value={orgOpenPotCount}  label="Offene Potenziale"
                    color={orgOpenPotCount > 0 ? "#ffa600" : "#3fb950"} />
            </div>
          </div>
        </div>
      ) : customer ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
        }}>
          <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-4)" }}>
            Ihr Objekt
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>{getStreet(customer.full_name)}</span>
              <span style={{
                background: "rgba(139,148,158,0.1)", color: "var(--text-muted)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                padding: "1px 8px", fontSize: "11px", fontWeight: 600,
              }}>
                {customer.object_type === "weg" ? "WEG" : "Privat"}
              </span>
            </div>
            {(customer.address_display || customer.city || customer.postal_code) && (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                {customer.address_display ?? [customer.postal_code, customer.city].filter(Boolean).join(" ")}
              </div>
            )}
            {(singleStromCount > 0 || singleGasCount > 0) && (
              <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-1)" }}>
                {singleStromCount > 0 && (
                  <span style={{
                    background: "rgba(56,139,253,0.1)", color: "#58a6ff",
                    border: "1px solid rgba(56,139,253,0.25)", borderRadius: "var(--radius-sm)",
                    padding: "2px 10px", fontSize: "var(--text-xs)", fontWeight: 600,
                  }}>
                    ⚡ {singleStromCount} Strom{singleStromCount > 1 ? "-Lieferstellen" : "-Lieferstelle"}
                  </span>
                )}
                {singleGasCount > 0 && (
                  <span style={{
                    background: "rgba(255,166,0,0.1)", color: "#ffa600",
                    border: "1px solid rgba(255,166,0,0.25)", borderRadius: "var(--radius-sm)",
                    padding: "2px 10px", fontSize: "var(--text-xs)", fontWeight: 600,
                  }}>
                    🔥 {singleGasCount} Gas{singleGasCount > 1 ? "-Lieferstellen" : "-Lieferstelle"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
          color: "var(--text-muted)", fontSize: "var(--text-sm)",
        }}>
          Kein Objekt und keine Hausverwaltung mit Ihrem Konto verknüpft. Bitte wenden Sie sich an den Support.
        </div>
      )}

      {/* ── Daten-Abdeckung (nur Org-Modus, mit Daten) ────────────────────── */}
      {organizationId && orgObjectCount > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", marginBottom: "var(--space-4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Daten-Abdeckung
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {coverageRows.map(row => (
              <div key={row.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{row.label}</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: row.pct > 0 ? row.color : "var(--text-muted)" }}>
                    {row.count.toLocaleString("de-DE")}
                    <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: "6px" }}>
                      / {orgObjectCount.toLocaleString("de-DE")} ({row.pct}%)
                    </span>
                  </span>
                </div>
                <div style={{ height: "5px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${row.pct}%`, background: row.pct > 0 ? row.color : "transparent", borderRadius: "3px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Zuletzt hinzugefügte Objekte (nur Org-Modus, mit Daten) ───────── */}
      {organizationId && orgRecent.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Zuletzt hinzugefügte Objekte</h2>
            <a href="/portal/objects" style={{ fontSize: "var(--text-sm)", color: "var(--primary-bright)", textDecoration: "none" }}>Alle anzeigen →</a>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Objekt", "Adresse", "Malo", "Zählernummer", "KNR", "⚡ Strom", "🔥 Gas", "Typ", "Status"].map(h => (
                    <th key={h} style={{
                      padding: "var(--space-3) var(--space-4)",
                      textAlign: "left", fontWeight: 500,
                      color: "var(--text-muted)", fontSize: "var(--text-xs)",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orgRecent.map((row, idx) => {
                  const recs       = row.teleson_records ?? []
                  const stromRec   = recs.find(r => r.energie?.toLowerCase() === "strom") ?? null
                  const gasRec     = recs.find(r => r.energie?.toLowerCase() === "gas")   ?? null
                  const addrText   = [row.postal_code, row.city].filter(Boolean).join(" ") || null
                  const malo       = recs.map(r => r.malo).find(Boolean) ?? null
                  const latestRec  = [...recs].sort((a, b) =>
                    String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
                  )[0]
                  const zNrRaw     = latestRec?.zaehlernummer ?? null
                  const zNr        = zNrRaw ? ((zNrRaw.split(":").pop() ?? zNrRaw).trim() || null) : null
                  const knr        = (row.customer_identities ?? [])
                                       .find(i => i.system === "knr" || i.system === "teleson")
                                       ?.external_id ?? null
                  const dash       = <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
                  const detailHref = `/portal/objects/${row.id}`

                  const cellLinkBase: React.CSSProperties = {
                    display: "block",
                    padding: "var(--space-3) var(--space-4)",
                    color: "inherit", textDecoration: "none",
                    whiteSpace: "nowrap",
                  }
                  const monoMuted: React.CSSProperties = {
                    fontFamily: "monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)",
                  }

                  return (
                    <tr key={row.id} style={{ borderBottom: idx < orgRecent.length - 1 ? "1px solid var(--border)" : undefined, cursor: "pointer" }}>
                      {/* Objekt */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}>
                          <span style={{ fontWeight: 500, color: "var(--primary-bright)" }}>{getStreet(row.full_name)}</span>
                        </a>
                      </td>

                      {/* Adresse */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={{ ...cellLinkBase, color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                          {addrText ?? dash}
                        </a>
                      </td>

                      {/* Malo */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}>
                          {malo ? <span style={monoMuted}>{malo}</span> : dash}
                        </a>
                      </td>

                      {/* Zählernummer */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}>
                          {zNr ? <span style={monoMuted}>{zNr}</span> : dash}
                        </a>
                      </td>

                      {/* KNR */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}>
                          {knr ? <span style={monoMuted}>{knr}</span> : dash}
                        </a>
                      </td>

                      {/* Strom (blue) */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}>
                          {stromRec?.neuer_versorger ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                              <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "#58a6ff" }}>{stromRec.neuer_versorger}</span>
                              {stromRec.neu_ap != null && (
                                <span style={{ fontSize: "var(--text-xs)", color: "#58a6ff" }}>
                                  {stromRec.neu_ap.toLocaleString("de-DE")} ct/kWh
                                </span>
                              )}
                            </div>
                          ) : dash}
                        </a>
                      </td>

                      {/* Gas (orange) */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}>
                          {gasRec?.neuer_versorger ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                              <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "#ffa600" }}>{gasRec.neuer_versorger}</span>
                              {gasRec.neu_ap != null && (
                                <span style={{ fontSize: "var(--text-xs)", color: "#ffa600" }}>
                                  {gasRec.neu_ap.toLocaleString("de-DE")} ct/kWh
                                </span>
                              )}
                            </div>
                          ) : dash}
                        </a>
                      </td>

                      {/* Typ */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}>
                          <span style={{
                            background: "rgba(139,148,158,0.1)", color: "var(--text-muted)",
                            border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                            padding: "1px 7px", fontSize: "10px", fontWeight: 600,
                          }}>{row.object_type === "weg" ? "WEG" : "Privat"}</span>
                        </a>
                      </td>

                      {/* Status */}
                      <td style={{ padding: 0 }}>
                        <a href={detailHref} style={cellLinkBase}>
                          <StatusBadge status={row.status} />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}

function Stat({ icon, value, label, color, href }: {
  icon:  string
  value: number
  label: string
  color: string
  href?: string
}) {
  const inner = (
    <>
      <div style={{ fontSize: "1.2rem", lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, lineHeight: 1, color }}>
        {value.toLocaleString("de-DE")}
      </div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{label}</div>
    </>
  )
  const style: React.CSSProperties = {
    background: "var(--surface-2)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "var(--space-4) var(--space-5)",
    display: "flex", flexDirection: "column", gap: "var(--space-2)",
    textDecoration: "none", color: "inherit",
  }
  return href
    ? <a href={href} style={style}>{inner}</a>
    : <div style={style}>{inner}</div>
}
