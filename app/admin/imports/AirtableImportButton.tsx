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
  error_log: { recordId: string; knr?: string; error: string }[]
}

export function AirtableImportButton({ orgs }: { orgs: Org[] }) {
  const [dbInfo,   setDbInfo]   = useState<DbInfo | null>(null)
  const [status,   setStatus]   = useState<"idle" | "loading" | "done" | "error">("idle")
  const [result,   setResult]   = useState<ImportResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [orgName,  setOrgName]  = useState<string | null>(null)

  const [showCustom, setShowCustom] = useState(false)
  const [pat,        setPat]        = useState("")
  const [baseId,     setBaseId]     = useState("")
  const [tableId,    setTableId]    = useState("")
  const [testStatus, setTestStatus] = useState<"idle" | "loading">("idle")
  const [customTest, setCustomTest] = useState<DbInfo | null>(null)

  const usingCustom = showCustom && pat.trim() && baseId.trim()

  useEffect(() => {
    fetch("/api/airtable/import")
      .then(r => r.json())
      .then((d: DbInfo) => setDbInfo(d))
      .catch(() => setDbInfo({ ok: false, error: "Keine Standard-Verbindung konfiguriert" }))
  }, [])

  async function handleTest() {
    if (!pat || !baseId) return
    setTestStatus("loading")
    setCustomTest(null)
    const params = new URLSearchParams({ pat, base_id: baseId })
    if (tableId) params.set("table_id", tableId)
    try {
      const res  = await fetch(`/api/airtable/import?${params}`)
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
    setStatus("loading"); setResult(null); setErrorMsg("")
    try {
      const payload: Record<string, string> = { organization_name: orgName }
      if (usingCustom) {
        payload.pat     = pat
        payload.base_id = baseId
        if (tableId) payload.table_id = tableId
      }
      const res  = await fetch("/api/airtable/import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const inputStyle: React.CSSProperties = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", padding: "var(--space-2) var(--space-3)",
    fontSize: "var(--text-sm)", color: "var(--text)", width: "100%",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

      <OrgPicker orgs={orgs} onChange={setOrgName} disabled={status === "loading"} />

      <button type="button" onClick={() => { setShowCustom(v => !v); setCustomTest(null) }}
        style={{ alignSelf: "flex-start", background: "transparent", border: "none",
          color: "var(--text-muted)", fontSize: "var(--text-xs)", cursor: "pointer",
          padding: 0, display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "10px" }}>{showCustom ? "▼" : "▶"}</span>
        Eigene Airtable-Datenbank verwenden
      </button>

      {showCustom && (
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: "var(--space-4)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>

          <div style={{ background: "rgba(255,166,0,0.06)", border: "1px solid rgba(255,166,0,0.2)",
            borderRadius: "var(--radius-sm)", padding: "var(--space-3)",
            fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--text)", display: "block", marginBottom: "4px" }}>
              Einmalige Einrichtung (2 Min.)
            </strong>
            1. <strong>airtable.com/create/tokens</strong> → Token erstellen → Berechtigung: <em>data.records:read</em> auf deine Base<br />
            2. Base-ID aus der URL kopieren: <em>airtable.com/<strong>appXXXXXX</strong>/...</em><br />
            3. Tabellen-ID oder -Name eingeben (Standard: <em>Teleson</em>)
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
              Personal Access Token (PAT)
            </label>
            <input type="password" placeholder="patXXXXXXXXXXXXXX"
              value={pat} onChange={e => { setPat(e.target.value); setCustomTest(null) }}
              disabled={status === "loading"} style={{ ...inputStyle, fontFamily: "monospace" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <label style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
                Base-ID
              </label>
              <input type="text" placeholder="appXXXXXXXXXXXXXX"
                value={baseId} onChange={e => { setBaseId(e.target.value); setCustomTest(null) }}
                disabled={status === "loading"} style={{ ...inputStyle, fontFamily: "monospace" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <label style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
                Tabellen-Name / ID
              </label>
              <input type="text" placeholder="Teleson"
                value={tableId} onChange={e => { setTableId(e.target.value); setCustomTest(null) }}
                disabled={status === "loading"} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <button type="button" onClick={handleTest}
              disabled={!pat || !baseId || testStatus === "loading" || status === "loading"}
              style={{ background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", padding: "var(--space-1) var(--space-3)",
                fontSize: "var(--text-xs)", fontWeight: 500,
                cursor: !pat || !baseId || testStatus === "loading" ? "not-allowed" : "pointer",
                color: !pat || !baseId ? "var(--text-muted)" : "var(--text)" }}>
              {testStatus === "loading" ? "Teste…" : "Verbindung testen"}
            </button>
            {customTest && (
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 500,
                color: customTest.ok ? "#3fb950" : "#f85149" }}>
                {customTest.ok
                  ? `✓ ${customTest.title} · ${customTest.propertyCount} Spalten`
                  : `✗ ${customTest.error}`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Default connection status */}
      {!usingCustom && dbInfo === null && (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Airtable-Verbindung wird geprüft…
        </p>
      )}
      {!usingCustom && dbInfo && !dbInfo.ok && (
        <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)",
          borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
          color: "#f85149", fontSize: "var(--text-sm)" }}>
          Airtable nicht konfiguriert: {dbInfo.error}
        </div>
      )}

      {((!usingCustom && dbInfo?.ok) || usingCustom) && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
          {!usingCustom && (
            <div style={{ background: "rgba(46,160,67,0.08)", border: "1px solid rgba(46,160,67,0.2)",
              borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              <span style={{ color: "#3fb950", fontWeight: 600 }}>✓ Verbunden</span>
              {" · "}{dbInfo?.title}{dbInfo?.propertyCount ? ` · ${dbInfo.propertyCount} Spalten` : ""}
            </div>
          )}
          <button onClick={handleImport} disabled={status === "loading" || !orgName}
            style={{ background: status === "loading" || !orgName ? "var(--surface-2)" : "#ffa600",
              color: status === "loading" || !orgName ? "var(--text-muted)" : "#fff",
              border: "none", borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-5)",
              fontWeight: 600, fontSize: "var(--text-sm)", whiteSpace: "nowrap",
              cursor: status === "loading" || !orgName ? "not-allowed" : "pointer" }}>
            {status === "loading" ? "Wird importiert…" : "Jetzt aus Airtable importieren"}
          </button>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)",
          borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
          color: "#f85149", fontSize: "var(--text-sm)" }}>
          {errorMsg}
        </div>
      )}

      {result && status === "done" && (
        <div style={{ background: "rgba(46,160,67,0.08)", border: "1px solid rgba(46,160,67,0.3)",
          borderRadius: "var(--radius-md)", padding: "var(--space-4)", fontSize: "var(--text-sm)" }}>
          <div style={{ fontWeight: 600, color: "#3fb950", marginBottom: "var(--space-3)" }}>
            Import abgeschlossen · {result.total} Datensätze verarbeitet
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "var(--space-3)" }}>
            {[
              { label: "Neu importiert",         value: result.imported,  color: "#3fb950" },
              { label: "Aktualisiert",            value: result.updated,   color: "#58a6ff" },
              { label: "Zur Prüfung vorgemerkt",  value: result.queued,    color: "#ffa600" },
              { label: "Konflikte erkannt",        value: result.conflicts, color: "#f85149" },
              { label: "Unverändert übersprungen", value: result.skipped,   color: "var(--text-muted)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>
          {result.error_log.length > 0 && (
            <details style={{ marginTop: "var(--space-3)" }}>
              <summary style={{ cursor: "pointer", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                Fehlerdetails ({result.error_log.length})
              </summary>
              <pre style={{ marginTop: "var(--space-2)", fontSize: "var(--text-xs)", color: "#f85149", overflowX: "auto" }}>
                {result.error_log.map(e =>
                  `${e.recordId}${e.knr ? ` (KNR ${e.knr})` : ""}: ${e.error}`
                ).join("\n")}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
