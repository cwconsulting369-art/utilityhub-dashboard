import { createClient } from "@/lib/supabase/server"
import { UploadForm } from "./UploadForm"
import { AirtableImportButton } from "./AirtableImportButton"
import { DeleteAllButton } from "./DeleteAllButton"

export const dynamic = "force-dynamic"

export const metadata = { title: "Imports | UtilityHub" }

interface BatchErrorLogSummary {
  imported:           number
  skipped_metadata:   number
  skipped_incomplete: number
  errors:             number
}

interface BatchRow {
  id:             string
  source:         string
  filename:       string | null
  total_rows:     number
  processed_rows: number | null
  error_rows:     number | null
  status:         string
  created_at:     string
  completed_at:   string | null
  error_log:      { summary?: BatchErrorLogSummary } | null
}

function parseSummary(b: BatchRow) {
  const s = b.error_log?.summary
  if (s) {
    return {
      imported: s.imported,
      skipped:  (s.skipped_metadata ?? 0) + (s.skipped_incomplete ?? 0),
      errors:   s.errors,
    }
  }
  return {
    imported: b.processed_rows ?? 0,
    skipped:  null as number | null,
    errors:   b.error_rows ?? 0,
  }
}

function isNotion(filename: string | null) {
  return filename?.startsWith("Notion:") ?? false
}

function statusInfo(status: string): { color: string; label: string } {
  switch (status) {
    case "done":       return { color: "#3fb950", label: "Fertig"     }
    case "failed":     return { color: "#f85149", label: "Fehler"     }
    case "processing": return { color: "#d4a017", label: "Läuft"      }
    case "pending":    return { color: "#8b949e", label: "Ausstehend" }
    default:           return { color: "#8b949e", label: status       }
  }
}

function fmtDuration(start: string, end: string | null): string {
  if (!end) return "—"
  const secs = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

export default async function ImportsPage() {
  const supabase = await createClient()

  const [batchesRes, orgsRes] = await Promise.all([
    supabase
      .from("import_batches")
      .select(
        "id, source, filename, total_rows, processed_rows, error_rows, status, created_at, completed_at, error_log",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .limit(25),
    supabase.from("organizations").select("id, name").order("name"),
  ])

  const { data: batches, count } = batchesRes
  const orgs = (orgsRes.data ?? []) as { id: string; name: string }[]

  const lastBatch = batches?.[0] as BatchRow | undefined
  const lastImportDate = lastBatch
    ? new Date(lastBatch.created_at).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })
    : null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
          Imports
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          {count ?? 0} Import-Batches gesamt
          {lastImportDate && (
            <span> · Letzter Import: {lastImportDate}</span>
          )}
        </p>
      </div>

      {/* ── Import actions ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>

        {/* Airtable */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
            <span style={{
              background: "rgba(255,166,0,0.12)", color: "#ffa600",
              border: "1px solid rgba(255,166,0,0.25)", borderRadius: "var(--radius-sm)",
              padding: "1px 7px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em",
            }}>AIRTABLE</span>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600, margin: 0 }}>
              Airtable-Sync
            </h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: "0 0 var(--space-4)" }}>
            Liest direkt aus einer Airtable-Base. Bestehende Objekte (KNR / MALO / WEG) werden nicht dupliziert.
          </p>
          <AirtableImportButton orgs={orgs} />
        </div>

        {/* File upload */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
            <span style={{
              background: "rgba(139,148,158,0.12)", color: "var(--text-muted)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
              padding: "1px 7px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em",
            }}>DATEI</span>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600, margin: 0 }}>
              Datei-Import
            </h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: "0 0 var(--space-4)" }}>
            CSV oder JSON manuell hochladen. Quelle wählen — Format-Hinweise werden entsprechend angepasst.
          </p>
          <UploadForm orgs={orgs} />
        </div>

      </div>

      {/* ── Danger Zone ────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)", border: "1px solid rgba(248,81,73,0.25)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-6)",
      }}>
        <div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#f85149", marginBottom: "var(--space-1)" }}>
            Danger Zone
          </div>
          <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            Löscht alle Kunden, Teleson-Daten, Import-Batches und Portal-Accounts (Hausverwaltungs-Logins). Organisationen bleiben erhalten.
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <DeleteAllButton />
        </div>
      </div>

      {/* ── Import history ─────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
      }}>
        <div style={{
          padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Import-Verlauf</h2>
          {(count ?? 0) > 25 && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Letzte 25 von {count}
            </span>
          )}
        </div>

        {batches && batches.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {/* narrow stripe column */}
                  <th style={{ width: "4px", padding: 0 }} />
                  {["Quelle / Datei", "Gesamt", "Importiert", "Übersprungen", "Fehler", "Erfolg", "Status", "Dauer", "Gestartet"].map(h => (
                    <th key={h} style={{
                      padding: "var(--space-3) var(--space-4)",
                      textAlign: h === "Quelle / Datei" ? "left" : "right",
                      color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(batches as BatchRow[]).map((b) => {
                  const { imported, skipped, errors } = parseSummary(b)
                  const notion   = isNotion(b.filename)
                  const info     = statusInfo(b.status)
                  const successPct = b.total_rows > 0
                    ? Math.round(imported / b.total_rows * 100)
                    : 0
                  const pctColor = successPct >= 95 ? "#3fb950" : successPct >= 70 ? "#d4a017" : "#f85149"

                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}>

                      {/* Status stripe */}
                      <td style={{ width: "4px", padding: 0, background: info.color }} />

                      {/* Quelle / Datei */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", maxWidth: "240px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <span style={{
                            background:    notion ? "rgba(139,99,255,0.12)" : "rgba(139,148,158,0.12)",
                            color:         notion ? "#a78bfa" : "var(--text-muted)",
                            border:        `1px solid ${notion ? "rgba(139,99,255,0.25)" : "var(--border)"}`,
                            borderRadius:  "var(--radius-sm)",
                            padding:       "1px 6px",
                            fontSize:      "10px",
                            fontWeight:    600,
                            letterSpacing: "0.05em",
                            whiteSpace:    "nowrap",
                            flexShrink:    0,
                          }}>
                            {notion ? "NOTION" : "DATEI"}
                          </span>
                          <span
                            title={b.filename ?? undefined}
                            style={{
                              color:        "var(--text-muted)",
                              overflow:     "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace:   "nowrap",
                              display:      "inline-block",
                            }}
                          >
                            {notion
                              ? (b.filename?.replace(/^Notion:\s*/, "") ?? "—")
                              : (b.filename ?? "—")}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right" }}>
                        {b.total_rows}
                      </td>

                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: imported > 0 ? "#3fb950" : "inherit" }}>
                        {imported}
                      </td>

                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text-muted)" }}>
                        {skipped === null ? (
                          <span title="Vor strukturiertem Log — Gesamt-Fehleranzahl in nächster Spalte">—</span>
                        ) : skipped}
                      </td>

                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: errors > 0 ? "#f85149" : "inherit" }}>
                        {errors}
                      </td>

                      {/* Erfolg % */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right" }}>
                        {b.status === "done" ? (
                          <span style={{
                            color:      pctColor,
                            fontWeight: 600,
                            fontSize:   "var(--text-xs)",
                          }}>
                            {successPct}%
                          </span>
                        ) : "—"}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right" }}>
                        <span style={{
                          background:   `${info.color}1a`,
                          color:        info.color,
                          borderRadius: "999px",
                          padding:      "2px 10px",
                          fontSize:     "var(--text-xs)",
                          fontWeight:   600,
                          whiteSpace:   "nowrap",
                          display:      "inline-block",
                        }}>
                          {info.label}
                        </span>
                      </td>

                      {/* Dauer */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {fmtDuration(b.created_at, b.completed_at)}
                      </td>

                      {/* Gestartet */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(b.created_at).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
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
            Noch kein Import gestartet.
          </div>
        )}
      </div>

    </div>
  )
}
