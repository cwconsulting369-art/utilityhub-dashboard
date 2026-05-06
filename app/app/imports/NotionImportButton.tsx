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

/** Extract Notion DB ID from a URL or raw ID string.
 *  Notion DB URLs look like: https://notion.so/workspace/Title-{32hexchars}?v=...
 *  or https://www.notion.so/{32hexchars}
 *  Raw ID: 32 hex chars or UUID with dashes.
 */
function extractNotionDbId(input: string): string {
  const clean = input.trim()
  // UUID format already (with dashes)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) return clean
  // Raw 32-char hex
  if (/^[0-9a-f]{32}$/i.test(clean)) return clean
  // Extract from URL: last path segment before query, strip trailing slug
  try {
    const url  = new URL(clean)
    const segs = url.pathname.split("/").filter(Boolean)
    const last = segs[segs.length - 1] ?? ""
    // Notion slugs end with -<32hex> or are bare <32hex>
    const match = last.match(/([0-9a-f]{32})$/i)
    if (match) return match[1]
  } catch {
    // not a valid URL — try regex on raw string
    const match = clean.match(/([0-9a-f]{32})/i)
    if (match) return match[1]
  }
  return clean // return as-is, server will error with a clear message
}

export function NotionImportButton({ orgs }: { orgs: Org[] }) {
  const [dbInfo,        setDbInfo]        = useState<DbInfo | null>(null)
  const [status,        setStatus]        = useState<"idle" | "loading" | "done" | "error">("idle")
  const [result,        setResult]        = useState<ImportResult | null>(null)
  const [errorMsg,      setErrorMsg]      = useState<string>("")
  const [orgName,       setOrgName]       = useState<string | null>(null)

  // Miguel / own Notion DB fields
  const [showCustom,    setShowCustom]    = useState(false)
  const [customUrlRaw,  setCustomUrlRaw]  = useState("")   // raw input (URL or ID)
  const [customToken,   setCustomToken]   = useState("")
  const [customTest,    setCustomTest]    = useState<DbInfo | null>(null)
  const [testStatus,    setTestStatus]    = useState<"idle" | "loading">("idle")

  const parsedDbId  = customUrlRaw.trim() ? extractNotionDbId(customUrlRaw) : ""
  const usingCustom = showCustom && parsedDbId.length > 0

  useEffect(() => {
    fetch("/api/notion/import")
      .then(r => r.json())
      .then((d: DbInfo) => setDbInfo(d))
      .catch(() => setDbInfo({ ok: false, error: "Verbindung fehlgeschlagen" }))
  }, [])

  async function handleTestCustom() {
    if (!parsedDbId) return
    setTestStatus("loading")
    setCustomTest(null)
    try {
      const res  = await fetch("/api/notion/test", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ db_id: parsedDbId, token: customToken.trim() || undefined }),
      })
      const data = await res.json() as DbInfo
      setCustomTest(data)
    } catch {
      setCustomTest({ ok: false, error: "Netzwerkfehler" })
    } finally {
      setTestStatus("idle")
    }
  }

  async function handleImport() {
    if (!orgName) { setErrorMsg("Bitte eine Hausverwaltung auswählen."); return }
    setStatus("loading")
    setResult(null)
    setErrorMsg("")
    try {
      const payload: Record<string, string> = { organization_name: orgName }
      if (usingCustom) {
        payload.custom_db_id = parsedDbId
        if (customToken.trim()) payload.custom_token = customToken.trim()
      }
      const res  = await fetch("/api/notion/import", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
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

      {/* Custom Notion DB toggle */}
      <button
        type="button"
        onClick={() => { setShowCustom(v => !v); setCustomTest(null) }}
        style={{
          alignSelf:    "flex-start",
          background:   "transparent",
          border:       "none",
          color:        "var(--text-muted)",
          fontSize:     "var(--text-xs)",
          cursor:       "pointer",
          padding:      0,
          display:      "flex",
          alignItems:   "center",
          gap:          "4px",
        }}
      >
        <span style={{ fontSize: "10px" }}>{showCustom ? "▼" : "▶"}</span>
        Eigene Notion-Datenbank verwenden
      </button>

      {showCustom && (
        <div style={{
          background:    "var(--surface-2)",
          border:        "1px solid var(--border)",
          borderRadius:  "var(--radius-md)",
          padding:       "var(--space-4)",
          display:       "flex",
          flexDirection: "column",
          gap:           "var(--space-3)",
        }}>

          {/* Setup hint */}
          <div style={{
            background:   "rgba(139,99,255,0.06)",
            border:       "1px solid rgba(139,99,255,0.2)",
            borderRadius: "var(--radius-sm)",
            padding:      "var(--space-3)",
            fontSize:     "var(--text-xs)",
            color:        "var(--text-muted)",
            lineHeight:   1.6,
          }}>
            <strong style={{ color: "var(--text)", display: "block", marginBottom: "4px" }}>
              Einmalige Einrichtung (2 Min.)
            </strong>
            1. Notion öffnen → <strong>notion.so/my-integrations</strong> → „New integration" → Token kopieren<br />
            2. Deine Datenbank in Notion öffnen → rechts oben „···" → „Connections" → Integration hinzufügen<br />
            3. Datenbanklink kopieren und unten einfügen
          </div>

          {/* DB Link / URL field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
              Notion-Datenbanklink oder ID
            </label>
            <input
              type="text"
              placeholder="https://notion.so/meinbereich/MeineDB-abc123… oder rohe DB-ID"
              value={customUrlRaw}
              onChange={e => { setCustomUrlRaw(e.target.value); setCustomTest(null) }}
              disabled={status === "loading"}
              style={{
                background:   "var(--surface)",
                border:       `1px solid ${parsedDbId && customUrlRaw.trim() ? "rgba(139,99,255,0.4)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
                padding:      "var(--space-2) var(--space-3)",
                fontSize:     "var(--text-sm)",
                color:        "var(--text)",
                width:        "100%",
              }}
            />
            {/* Show extracted ID as feedback */}
            {customUrlRaw.trim() && parsedDbId && (
              <span style={{ fontSize: "var(--text-xs)", color: "rgba(139,99,255,0.8)", fontFamily: "monospace" }}>
                DB-ID: {parsedDbId}
              </span>
            )}
          </div>

          {/* Token field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
              Notion Integration Token
            </label>
            <input
              type="password"
              placeholder="secret_…"
              value={customToken}
              onChange={e => { setCustomToken(e.target.value); setCustomTest(null) }}
              disabled={status === "loading"}
              style={{
                background:   "var(--surface)",
                border:       "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding:      "var(--space-2) var(--space-3)",
                fontSize:     "var(--text-sm)",
                color:        "var(--text)",
                fontFamily:   "monospace",
                width:        "100%",
              }}
            />
          </div>

          {/* Test button + result */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleTestCustom}
              disabled={!parsedDbId || testStatus === "loading" || status === "loading"}
              style={{
                background:   "var(--surface)",
                border:       "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding:      "var(--space-1) var(--space-3)",
                fontSize:     "var(--text-xs)",
                fontWeight:   500,
                cursor:       !parsedDbId || testStatus === "loading" ? "not-allowed" : "pointer",
                color:        !parsedDbId ? "var(--text-muted)" : "var(--text)",
              }}
            >
              {testStatus === "loading" ? "Teste…" : "Verbindung testen"}
            </button>

            {customTest && (
              <span style={{
                fontSize:   "var(--text-xs)",
                color:      customTest.ok ? "#3fb950" : "#f85149",
                fontWeight: 500,
              }}>
                {customTest.ok
                  ? `✓ ${customTest.title} · ${customTest.propertyCount} Spalten`
                  : `✗ ${customTest.error}`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Connection status — default DB (only when not using custom) */}
      {!usingCustom && dbInfo === null && (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Notion-Verbindung wird geprüft…
        </p>
      )}

      {!usingCustom && dbInfo && !dbInfo.ok && (
        <div style={{
          background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)",
          borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
          color: "#f85149", fontSize: "var(--text-sm)",
        }}>
          Notion nicht erreichbar: {dbInfo.error}
        </div>
      )}

      {/* Import button — shown when default DB connected OR custom DB entered */}
      {(!usingCustom && dbInfo?.ok) || usingCustom ? (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
          {!usingCustom && (
            <div style={{
              background: "rgba(46,160,67,0.08)", border: "1px solid rgba(46,160,67,0.2)",
              borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--text-xs)", color: "var(--text-muted)",
            }}>
              <span style={{ color: "#3fb950", fontWeight: 600 }}>✓ Verbunden</span>
              {" · "}
              <span>{dbInfo?.title}</span>
              {dbInfo?.propertyCount && <span> · {dbInfo.propertyCount} Spalten</span>}
            </div>
          )}
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
      ) : null}

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
