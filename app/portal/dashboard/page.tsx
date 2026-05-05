import { createClient } from "@/lib/supabase/server"
import { redirect }     from "next/navigation"
import { getStreet }    from "@/lib/customers/format"

export const metadata = { title: "Dashboard | UtilityHub" }

type ObjRow = {
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
    created_at:      string | null
  }[] | null
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

  // ── Org-Modus ─────────────────────────────────────────────────────────────
  let orgName: string | null = null
  let orgObjectCount   = 0
  let orgStromCount    = 0
  let orgGasCount      = 0
  let orgFgFinanzCount = 0
  let orgObjects: ObjRow[] = []

  if (organizationId) {
    const [{ data: org }, { data: custs }] = await Promise.all([
      supabase.from("organizations").select("name").eq("id", organizationId).single(),
      supabase.from("customers").select("id").eq("organization_id", organizationId),
    ])
    orgName        = org?.name ?? null
    const ids      = (custs ?? []).map(c => c.id)
    orgObjectCount = ids.length

    if (ids.length > 0) {
      const [{ data: tel }, { data: recent }, { count: fgCount }] = await Promise.all([
        supabase.from("teleson_records").select("energie, malo, customer_id").in("customer_id", ids),
        supabase.from("customers")
          .select(
            "id, full_name, status, object_type, city, postal_code, " +
            "teleson_records(energie, neuer_versorger, neu_ap, status, malo, created_at)"
          )
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("fg_finanz_records")
          .select("id", { count: "exact", head: true })
          .in("customer_id", ids),
      ])
      const teleson   = (tel ?? []) as { energie: string | null; customer_id: string }[]
      orgStromCount   = teleson.filter(r => r.energie?.toLowerCase() === "strom").length
      orgGasCount     = teleson.filter(r => r.energie?.toLowerCase() === "gas").length
      orgFgFinanzCount = fgCount ?? 0
      orgObjects      = (recent ?? []) as unknown as ObjRow[]
    }
  }

  // ── Single-Customer-Fallback ───────────────────────────────────────────────
  let singleName       = ""
  let singleStromCount = 0
  let singleGasCount   = 0
  let singleObjects: ObjRow[] = []

  if (!organizationId && customerId) {
    const [customerRes, telesonRes, objRes] = await Promise.all([
      supabase.from("customers").select("full_name").eq("id", customerId).single(),
      supabase.from("teleson_records").select("energie").eq("customer_id", customerId),
      supabase.from("customers")
        .select("id, full_name, status, object_type, city, postal_code, teleson_records(energie, neuer_versorger, neu_ap, status, malo, created_at)")
        .eq("id", customerId)
        .limit(1),
    ])
    singleName        = customerRes.data?.full_name ?? ""
    const tel         = (telesonRes.data ?? []) as { energie: string | null }[]
    singleStromCount  = tel.filter(r => r.energie?.toLowerCase() === "strom").length
    singleGasCount    = tel.filter(r => r.energie?.toLowerCase() === "gas").length
    singleObjects     = (objRes.data ?? []) as unknown as ObjRow[]
  }

  const isOrg         = !!organizationId
  const stromCount    = isOrg ? orgStromCount    : singleStromCount
  const gasCount      = isOrg ? orgGasCount      : singleGasCount
  const totalObjects  = isOrg ? orgObjectCount   : (singleObjects.length > 0 ? 1 : 0)
  const totalLiefer   = stromCount + gasCount
  const objects       = isOrg ? orgObjects       : singleObjects
  const orgLabel      = isOrg ? (orgName ?? "Ihre Hausverwaltung") : (singleName ? getStreet(singleName) : "Ihr Objekt")

  const allOptimized  = totalLiefer > 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Begrüßung */}
      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
          Willkommen{displayName ? `, ${displayName}` : ""}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          {orgLabel}
        </p>
      </div>

      {/* ── 4 KPI-Cards ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: "var(--space-4)" }}>

        {/* Strom */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "var(--radius-md)",
              background: "rgba(88,166,255,0.15)", border: "1px solid rgba(88,166,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#58a6ff">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500 }}>Strom</span>
          </div>
          <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "#58a6ff", lineHeight: 1 }}>
            {stromCount.toLocaleString("de-DE")}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Lieferstellen</div>
        </div>

        {/* Gas */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "var(--radius-md)",
              background: "rgba(255,166,0,0.15)", border: "1px solid rgba(255,166,0,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffa600">
                <path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z" />
              </svg>
            </div>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500 }}>Gas</span>
          </div>
          <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "#ffa600", lineHeight: 1 }}>
            {gasCount.toLocaleString("de-DE")}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Lieferstellen</div>
        </div>

        {/* Versicherung (FG Finanz) */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "var(--radius-md)",
              background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500 }}>Versicherung</span>
          </div>
          <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "#a78bfa", lineHeight: 1 }}>
            {orgFgFinanzCount.toLocaleString("de-DE")}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Objekte</div>
        </div>

        {/* Großes Übersichts-Card */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
          display: "flex", flexDirection: "column", gap: "var(--space-4)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--text-3xl)", fontWeight: 800, lineHeight: 1 }}>
              {totalObjects.toLocaleString("de-DE")}
            </span>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Objekte</span>
            <span style={{ color: "var(--border)" }}>|</span>
            <span style={{ fontSize: "var(--text-3xl)", fontWeight: 800, lineHeight: 1 }}>
              {totalLiefer.toLocaleString("de-DE")}
            </span>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Lieferstellen</span>
          </div>
          <div style={{ fontSize: "var(--text-sm)", color: "#3fb950", fontWeight: 600 }}>
            Alle koordiniert
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                Alle Verträge optimiert {allOptimized ? "✓" : ""}
              </span>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: allOptimized ? "#3fb950" : "var(--text-muted)" }}>
                {allOptimized ? "100%" : "0%"}
              </span>
            </div>
            <div style={{ height: "6px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: allOptimized ? "100%" : "0%",
                background: "linear-gradient(90deg, #3fb950, #58a6ff)",
                borderRadius: "999px", transition: "width 0.8s ease",
              }} />
            </div>
          </div>
        </div>

      </div>

      {/* ── Objekte Übersicht ─────────────────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{
          padding: "var(--space-4) var(--space-6)",
          borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Objekte Übersicht</h2>
          <a href="/portal/objects" style={{ fontSize: "var(--text-sm)", color: "var(--primary-bright)", textDecoration: "none" }}>
            Alle anzeigen →
          </a>
        </div>

        {objects.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Objekt", "Adresse", "Strom-Tarif", "Gas-Tarif", "Status", "Lieferstelle", ""].map(h => (
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
                {objects.map((row, idx) => {
                  const recs     = row.teleson_records ?? []
                  const stromRec = recs.find(r => r.energie?.toLowerCase() === "strom") ?? null
                  const gasRec   = recs.find(r => r.energie?.toLowerCase() === "gas")   ?? null
                  const malo     = recs.map(r => r.malo).find(Boolean) ?? null
                  const addr     = [row.postal_code, row.city].filter(Boolean).join(" ") || null
                  const href     = `/portal/objects/${row.id}`
                  const isActive = row.status === "active"

                  return (
                    <tr key={row.id} style={{
                      borderBottom: idx < objects.length - 1 ? "1px solid var(--border)" : undefined,
                      cursor: "pointer",
                    }}>
                      {/* Objekt + Thumbnail-Placeholder */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        <a href={href} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none", color: "inherit" }}>
                          <div style={{
                            width: "40px", height: "40px", borderRadius: "var(--radius-md)",
                            background: "rgba(88,166,255,0.08)", border: "1px solid var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, fontSize: "18px",
                          }}>🏢</div>
                          <span style={{ fontWeight: 600, color: "var(--primary-bright)" }}>
                            {getStreet(row.full_name)}
                          </span>
                        </a>
                      </td>

                      {/* Adresse */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}>
                        {addr ? (
                          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.4 }}>
                            {row.postal_code && <span>{row.postal_code}</span>}
                            {row.city        && <span>{row.city}</span>}
                          </div>
                        ) : <span style={{ opacity: 0.4 }}>—</span>}
                      </td>

                      {/* Strom-Tarif */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {stromRec?.neuer_versorger ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#58a6ff" }}>{stromRec.neuer_versorger}</span>
                            {stromRec.neu_ap != null && (
                              <span style={{ fontSize: "10px", color: "#58a6ff", opacity: 0.8 }}>
                                {stromRec.neu_ap.toLocaleString("de-DE")} ct/kWh
                              </span>
                            )}
                          </div>
                        ) : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>}
                      </td>

                      {/* Gas-Tarif */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {gasRec?.neuer_versorger ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#ffa600" }}>{gasRec.neuer_versorger}</span>
                            {gasRec.neu_ap != null && (
                              <span style={{ fontSize: "10px", color: "#ffa600", opacity: 0.8 }}>
                                {gasRec.neu_ap.toLocaleString("de-DE")} ct/kWh
                              </span>
                            )}
                          </div>
                        ) : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          background: isActive ? "rgba(63,185,80,0.12)" : "rgba(139,148,158,0.12)",
                          color:      isActive ? "#3fb950" : "var(--text-muted)",
                          border: `1px solid ${isActive ? "rgba(63,185,80,0.3)" : "var(--border)"}`,
                          borderRadius: "999px", padding: "2px 10px",
                          fontSize: "var(--text-xs)", fontWeight: 600,
                        }}>
                          {isActive && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3fb950", flexShrink: 0 }} />}
                          {isActive ? "Aktiv" : row.status}
                        </span>
                      </td>

                      {/* Lieferstelle (Malo / DE-Code) */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {malo ? (
                          <span style={{ fontFamily: "monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            {malo}
                          </span>
                        ) : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>}
                      </td>

                      {/* Chevron */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right" }}>
                        <a href={href} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "var(--text-base)" }}>
                          ›
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "var(--space-10)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Keine Objekte vorhanden.
          </div>
        )}

        {/* Pagination */}
        {objects.length >= 10 && (
          <div style={{
            padding: "var(--space-4)",
            borderTop: "1px solid var(--border)",
            display: "flex", justifyContent: "center", alignItems: "center", gap: "var(--space-2)",
          }}>
            <button style={{
              width: "32px", height: "32px", borderRadius: "var(--radius-md)",
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-muted)", cursor: "pointer", fontSize: "var(--text-sm)",
            }}>‹</button>
            <button style={{
              width: "32px", height: "32px", borderRadius: "var(--radius-md)",
              background: "var(--primary-bright)", border: "none",
              color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "var(--text-sm)",
            }}>1</button>
            <button style={{
              width: "32px", height: "32px", borderRadius: "var(--radius-md)",
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-muted)", cursor: "pointer", fontSize: "var(--text-sm)",
            }}>2</button>
            <button style={{
              width: "32px", height: "32px", borderRadius: "var(--radius-md)",
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-muted)", cursor: "pointer", fontSize: "var(--text-sm)",
            }}>›</button>
          </div>
        )}
      </div>

    </div>
  )
}
