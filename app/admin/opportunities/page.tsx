import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "FG Finanz | UtilityHub" }

interface OppRow {
  id:          string
  title:       string
  description: string | null
  status:      string
  priority:    string
  source:      string
  due_date:    string | null
  created_at:  string
  customer:    { id: string; full_name: string | null } | null
}

function statusInfo(status: string): { color: string; label: string } {
  switch (status) {
    case "open":        return { color: "#58a6ff", label: "Offen"          }
    case "in_progress": return { color: "#d4a017", label: "In Bearbeitung" }
    case "won":         return { color: "#3fb950", label: "Gewonnen"       }
    case "lost":        return { color: "#8b949e", label: "Verloren"       }
    default:            return { color: "#8b949e", label: status           }
  }
}

function priorityInfo(priority: string): { color: string; label: string } {
  switch (priority) {
    case "high":   return { color: "#f85149", label: "Hoch"    }
    case "medium": return { color: "#d4a017", label: "Mittel"  }
    case "low":    return { color: "#8b949e", label: "Niedrig" }
    default:       return { color: "#8b949e", label: priority  }
  }
}

export default async function OpportunitiesPage() {
  const supabase = await createClient()

  const { data: opportunities, count } = await supabase
    .from("upsell_opportunities")
    .select(
      "id, title, description, status, priority, source, due_date, created_at, customer:customers(id, full_name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })

  const opp = (opportunities ?? []) as unknown as OppRow[]

  const stats = {
    open:        opp.filter(o => o.status === "open").length,
    in_progress: opp.filter(o => o.status === "in_progress").length,
    won:         opp.filter(o => o.status === "won").length,
    lost:        opp.filter(o => o.status === "lost").length,
  }

  const autoCount   = opp.filter(o => o.source === "auto_rule").length
  const manualCount = opp.filter(o => o.source === "manual").length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
            FG Finanz
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
            {count ?? 0} Potenziale
            {autoCount > 0 && (
              <span> · {autoCount} automatisch erkannt</span>
            )}
            {manualCount > 0 && (
              <span> · {manualCount} manuell angelegt</span>
            )}
          </p>
        </div>
        <a
          href="/api/export/opportunities"
          style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            padding: "var(--space-2) var(--space-4)", borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)", color: "var(--text-muted)",
            textDecoration: "none", whiteSpace: "nowrap",
          }}
        >
          ↓ Export CSV
        </a>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
        {[
          { label: "Offen",          value: stats.open,        color: "#58a6ff"   },
          { label: "In Bearbeitung", value: stats.in_progress, color: "#d4a017"   },
          { label: "Gewonnen",       value: stats.won,         color: "#3fb950"   },
          { label: "Verloren",       value: stats.lost,        color: "#8b949e"   },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
          }}>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, lineHeight: 1, color, marginBottom: "var(--space-1)" }}>
              {value}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Potenzial-Liste ────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
      }}>
        <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Potenziale</h2>
        </div>

        {opp.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Objekt", "Titel", "Priorität", "Quelle", "Fällig", "Status", "Erstellt"].map(h => (
                    <th key={h} style={{
                      padding: "var(--space-3) var(--space-4)",
                      textAlign: "left",
                      color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {opp.map(o => {
                  const sInfo = statusInfo(o.status)
                  const pInfo = priorityInfo(o.priority)
                  const isAuto = o.source === "auto_rule"

                  return (
                    <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>

                      {/* Objekt */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        {o.customer?.id ? (
                          <a
                            href={`/app/customers/${o.customer.id}`}
                            style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}
                          >
                            {o.customer.full_name ?? "—"}
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>

                      {/* Titel */}
                      <td style={{
                        padding: "var(--space-3) var(--space-4)",
                        maxWidth: "260px", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        <span title={o.title}>{o.title}</span>
                      </td>

                      {/* Priorität */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <span style={{
                          color:      pInfo.color,
                          fontWeight: 600,
                          fontSize:   "var(--text-xs)",
                        }}>
                          {pInfo.label}
                        </span>
                      </td>

                      {/* Quelle */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <span style={{
                          background:   isAuto ? "rgba(88,166,255,0.1)" : "rgba(139,148,158,0.1)",
                          color:        isAuto ? "#58a6ff" : "var(--text-muted)",
                          border:       `1px solid ${isAuto ? "rgba(88,166,255,0.25)" : "var(--border)"}`,
                          borderRadius: "var(--radius-sm)",
                          padding:      "1px 7px",
                          fontSize:     "10px",
                          fontWeight:   600,
                          letterSpacing: "0.04em",
                          whiteSpace:   "nowrap",
                        }}>
                          {isAuto ? "AUTO" : "MANUELL"}
                        </span>
                      </td>

                      {/* Fällig */}
                      <td style={{
                        padding:    "var(--space-3) var(--space-4)",
                        color:      o.due_date ? "var(--text)" : "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}>
                        {o.due_date
                          ? new Date(o.due_date).toLocaleDateString("de-DE")
                          : "—"}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <span style={{
                          background:   `${sInfo.color}1a`,
                          color:        sInfo.color,
                          borderRadius: "999px",
                          padding:      "2px 10px",
                          fontSize:     "var(--text-xs)",
                          fontWeight:   600,
                          whiteSpace:   "nowrap",
                          display:      "inline-block",
                        }}>
                          {sInfo.label}
                        </span>
                      </td>

                      {/* Erstellt */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(o.created_at).toLocaleDateString("de-DE")}
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            padding: "var(--space-12)", textAlign: "center",
            color: "var(--text-muted)", fontSize: "var(--text-sm)",
          }}>
            Noch keine Potenziale vorhanden.
          </div>
        )}
      </div>

    </div>
  )
}
