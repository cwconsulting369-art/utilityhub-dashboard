"use client"

import { useState, useEffect } from "react"
import { OrgPicker, type Org } from "./OrgPicker"

interface DbInfo {
  ok:             boolean
  title?:         string
  propertyCount?: number
  error?:         string
}

interface ImportResult {
  batch_id:  string
  total:     number
  imported:  number
  updated:   number
  skipped:   number
  queued:    number
  conflicts: number
  errors:    number
  error_log: { pageId: string; knr?: string; error: string }[]
}

export function NotionImportButton({ orgs }: { orgs: Org[] }) {
  const [dbInfo,   setDbInfo]   = useState<DbInfo | null>(null)
  const [status,   setStatus]   = useState<"idle" | "loading" | "done" | "error">("idle")
  const [result,   setResult]   = useState<ImportResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [orgName,  setOrgName]  = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/notion/import")
      .then(r => r.json())
      .then((d: DbInfo) => setDbInfo(d))
      .catch(() => setDbInfo({ ok: false, error: "Verbindung fehlgeschlagen" }))
  }, [])

  async function handleImport() {
    if (!orgName) { setErrorMsg("Bitte eine Hausverwaltung auswählen."); return }
    setStatus("loading")
    setResult(null)
    setErrorMsg("")
    try {
      const res  = await fetch("/api/notion/import", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ organization_name: orgName }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error ?? "Unbekannter Fehler"); setStatus("error"); return }
      setResult(data as ImportResult)
      setStatus("done")
    } catch (e) {
      setErrorMsg("Netzwerkfehler: " + String(e))
      setStatus("error")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

      {/* Hausverwaltung */}
      <OrgPicker orgs={orgs} onChange={setOrgName} disabled={status === "loading"} />

      {/* Connection status */}
      {dbInfo === null && (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Notion-Verbindung wird geprüft…
        </p>
      )}

      {dbInfo && !dbInfo.ok && (
        <div style={{
          background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)",
          borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
          color: "#f85149", fontSize: "var(--text-sm)",
        }}>
          Notion nicht erreichbar: {dbInfo.error}
        </div>
      )}

      {dbInfo?.ok && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <div style={{
            background: "rgba(46,160,67,0.08)", border: "1px solid rgba(46,160,67,0.2)",
            borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
            fontSize: "var(--text-xs)", color: "var(--text-muted)",
          }}>
            <span style={{ color: "#3fb950", fontWeight: 600 }}>✓ Verbunden</span>
            {" · "}
            <span>{dbInfo.title}</span>
            {dbInfo.propertyCount && <span> · {dbInfo.propertyCount} Spalten</span>}
          </div>
          <button
            onClick={handleImport}
            disabled={status === "loading" || !orgName}
            style={{
              background:   status === "loading" || !orgName ? "var(--surface-2)" : "var(--primary-bright)",
              color:        status === "loading" || !orgName ? "var(--text-muted)" : "#fff",
              border: "none",
              borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-5)",
              fontWeight:   600, fontSize: "var(--text-sm)",
              cursor:       status === "loading" || !orgName ? "not-allowed" : "pointer",
              whiteSpace:   "nowrap",
            }}
          >
            {status === "loading" ? "Wird importiert…" : "Jetzt aus Notion importieren"}
          </button>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div style={{
          background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)",
          borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
          color: "#f85149", fontSize: "var(--text-sm)",
        }}>
          {errorMsg}
        </div>
      )}

      {/* Success */}
      {result && status === "done" && (
        <div style={{
          background: "rgba(46,160,67,0.08)", border: "1px solid rgba(46,160,67,0.3)",
          borderRadius: "var(--radius-md)", padding: "var(--space-4)",
          fontSize: "var(--text-sm)",
        }}>
          <div style={{ fontWeight: 600, color: "#3fb950", marginBottom: "var(--space-3)" }}>
            Import abgeschlossen · {result.total} Datensätze verarbeitet
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "var(--space-3)",
          }}>
            {[
              { label: "Neu importiert",          value: result.imported,  color: "#3fb950" },
              { label: "Aktualisiert",             value: result.updated,   color: "#58a6ff" },
              { label: "Zur Prüfung vorgemerkt",   value: result.queued,    color: "#ffa600" },
              { label: "Konflikte erkannt",         value: result.conflicts, color: "#f85149" },
              { label: "Unverändert übersprungen",  value: result.skipped,   color: "var(--text-muted)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "var(--space-3)",
              }}>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color, lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {result.queued > 0 && (
            <p style={{ margin: "var(--space-3) 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Zur Prüfung vorgemerkte Datensätze konnten keinem bestehenden Objekt sicher zugeordnet werden und warten auf manuelle Überprüfung.
            </p>
          )}

          {result.conflicts > 0 && (
            <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--text-xs)", color: "#f85149" }}>
              Konflikte wurden nicht überschrieben und müssen manuell aufgelöst werden.
            </p>
          )}

          {result.error_log.length > 0 && (
            <details style={{ marginTop: "var(--space-3)" }}>
              <summary style={{ cursor: "pointer", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                Fehlerdetails ({result.error_log.length})
              </summary>
              <pre style={{
                marginTop: "var(--space-2)", fontSize: "var(--text-xs)",
                color: "#f85149", overflowX: "auto",
              }}>
                {result.error_log.map(e =>
                  `${e.pageId}${e.knr ? ` (KNR ${e.knr})` : ""}: ${e.error}`
                ).join("\n")}
              </pre>
            </details>
          )}
        </div>
      )}

    </div>
  )
}
