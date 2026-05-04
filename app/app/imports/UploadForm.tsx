"use client"

import { useState, useRef } from "react"
import { OrgPicker, type Org } from "./OrgPicker"

interface ImportResult {
  batch_id:  string
  total:     number
  processed: number
  skipped:   number
  errors:    number
  error_log: { row: number; knr?: string; name?: string; error: string }[]
  skip_log:  { row: number; reason: string; weg?: string; name?: string }[]
}

type ImportSource = "teleson" | "fg_finanz"

const SOURCE_OPTIONS: {
  value:    ImportSource
  label:    string
  hint:     string
  disabled?: boolean
}[] = [
  {
    value: "teleson",
    label: "Teleson",
    hint:  "CSV (Semikolon oder Komma, UTF-8) · Spalten: Name, KNR, MALO, Weg, Energie, Status, Neuer Versorger, Belieferungsdatum, Gebunden bis, Alt AP ct/kWh",
  },
  {
    value:    "fg_finanz",
    label:    "FG Finanz",
    hint:     "CSV-Export aus FG Finanz · Spalten: Objekt, KNR, Produkt, Provision, Status",
    disabled: true,
  },
]

export function UploadForm({ orgs }: { orgs: Org[] }) {
  const [source,   setSource]   = useState<ImportSource>("teleson")
  const [status,   setStatus]   = useState<"idle" | "loading" | "done" | "error">("idle")
  const [result,   setResult]   = useState<ImportResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [filename, setFilename] = useState<string>("")
  const [orgName,  setOrgName]  = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function resetState() {
    setStatus("idle")
    setResult(null)
    setErrorMsg("")
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setErrorMsg("Bitte eine Datei auswählen."); return }
    if (!orgName) { setErrorMsg("Bitte eine Hausverwaltung auswählen."); return }

    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["csv", "json"].includes(ext ?? "")) {
      setErrorMsg("Nur .csv oder .json Dateien werden unterstützt.")
      setStatus("error")
      return
    }

    setStatus("loading")
    setResult(null)
    setErrorMsg("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("organization_name", orgName)

    try {
      const endpoint = source === "teleson" ? "/api/import/teleson" : "/api/import/fg-finanz"
      const res  = await fetch(endpoint, { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error ?? "Unbekannter Fehler"); setStatus("error"); return }
      setResult(data)
      setStatus("done")
    } catch (e) {
      setErrorMsg("Netzwerkfehler: " + String(e))
      setStatus("error")
    }
  }

  const currentSource = SOURCE_OPTIONS.find(o => o.value === source)!

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

      {/* Hausverwaltung */}
      <OrgPicker orgs={orgs} onChange={setOrgName} disabled={status === "loading"} />

      {/* Source selector */}
      <div>
        <div style={{
          fontSize: "var(--text-xs)", color: "var(--text-muted)",
          fontWeight: 500, marginBottom: "var(--space-2)",
        }}>
          Datenquelle
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {SOURCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { if (!opt.disabled) { setSource(opt.value); resetState() } }}
              disabled={opt.disabled}
              title={opt.disabled ? "Noch nicht verfügbar" : undefined}
              style={{
                background:   source === opt.value ? "var(--primary-bright)" : "var(--surface-2)",
                color:        source === opt.value ? "#fff" : "var(--text-muted)",
                border:       `1px solid ${source === opt.value ? "var(--primary-bright)" : "var(--border)"}`,
                borderRadius: "var(--radius-md)",
                padding:      "var(--space-2) var(--space-4)",
                fontSize:     "var(--text-sm)",
                fontWeight:   source === opt.value ? 600 : 400,
                cursor:       opt.disabled ? "not-allowed" : "pointer",
                opacity:      opt.disabled ? 0.45 : 1,
                whiteSpace:   "nowrap",
                transition:   "all 0.15s",
              }}
            >
              {opt.label}
              {opt.disabled && (
                <span style={{ fontSize: "10px", marginLeft: "6px", fontWeight: 400 }}>bald</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* File picker + action */}
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{
          background:   "var(--surface-2)",
          border:       "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding:      "var(--space-2) var(--space-3)",
          color:        filename ? "var(--text)" : "var(--text-muted)",
          fontSize:     "var(--text-sm)",
          cursor:       "pointer",
          whiteSpace:   "nowrap",
        }}>
          {filename || "Datei wählen…"}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            style={{ display: "none" }}
            onChange={e => {
              setFilename(e.target.files?.[0]?.name ?? "")
              resetState()
            }}
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={status === "loading" || !filename || !orgName}
          style={{
            background:   status === "loading" || !filename || !orgName ? "var(--surface-2)" : "var(--primary-bright)",
            color:        status === "loading" || !filename || !orgName ? "var(--text-muted)" : "#fff",
            border:       "none",
            borderRadius: "var(--radius-md)",
            padding:      "var(--space-2) var(--space-5)",
            fontWeight:   600,
            fontSize:     "var(--text-sm)",
            cursor:       status === "loading" || !filename || !orgName ? "not-allowed" : "pointer",
            whiteSpace:   "nowrap",
          }}
        >
          {status === "loading" ? "Importiere…" : "Import starten"}
        </button>
      </div>

      {/* Format hint */}
      <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", margin: 0 }}>
        {currentSource.hint}
      </p>

      {/* Error */}
      {errorMsg && (
        <div style={{
          background:   "rgba(248,81,73,0.1)",
          border:       "1px solid rgba(248,81,73,0.3)",
          borderRadius: "var(--radius-md)",
          padding:      "var(--space-3) var(--space-4)",
          color:        "#f85149",
          fontSize:     "var(--text-sm)",
        }}>
          {errorMsg}
        </div>
      )}

      {/* Success result */}
      {result && status === "done" && (
        <div style={{
          background:   "rgba(46,160,67,0.08)",
          border:       "1px solid rgba(46,160,67,0.3)",
          borderRadius: "var(--radius-md)",
          padding:      "var(--space-4)",
          fontSize:     "var(--text-sm)",
        }}>
          <div style={{ fontWeight: 600, color: "#3fb950", marginBottom: "var(--space-3)" }}>
            Import abgeschlossen
          </div>

          <div style={{
            display:               "grid",
            gridTemplateColumns:   "repeat(4, auto)",
            gap:                   "var(--space-2) var(--space-6)",
            justifyContent:        "start",
          }}>
            <span style={{ color: "var(--text-muted)" }}>Gesamt</span>
            <span style={{ color: "var(--text-muted)" }}>Importiert</span>
            <span style={{ color: "var(--text-muted)" }}>Übersprungen</span>
            <span style={{ color: "var(--text-muted)" }}>Fehler</span>
            <strong>{result.total}</strong>
            <strong style={{ color: "#3fb950" }}>{result.processed}</strong>
            <strong style={{ color: result.skipped > 0 ? "var(--text-muted)" : "inherit" }}>{result.skipped}</strong>
            <strong style={{ color: result.errors > 0 ? "#f85149" : "inherit" }}>{result.errors}</strong>
          </div>

          {result.skip_log.length > 0 && (
            <details style={{ marginTop: "var(--space-3)" }}>
              <summary style={{ cursor: "pointer", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                Übersprungene Zeilen ({result.skip_log.length})
              </summary>
              <pre style={{ marginTop: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-muted)", overflowX: "auto" }}>
                {result.skip_log.map((e) =>
                  `Zeile ${e.row} [${e.reason}]: ${e.weg ?? e.name ?? "—"}`
                ).join("\n")}
              </pre>
            </details>
          )}

          {result.error_log.length > 0 && (
            <details style={{ marginTop: "var(--space-3)" }}>
              <summary style={{ cursor: "pointer", color: "#f85149", fontSize: "var(--text-xs)" }}>
                Fehlerdetails ({result.error_log.length})
              </summary>
              <pre style={{ marginTop: "var(--space-2)", fontSize: "var(--text-xs)", color: "#f85149", overflowX: "auto" }}>
                {result.error_log.map((e) => {
                  const ctx = [e.knr && `KNR ${e.knr}`, e.name].filter(Boolean).join(", ")
                  return `Zeile ${e.row}${ctx ? ` (${ctx})` : ""}: ${e.error}`
                }).join("\n")}
              </pre>
            </details>
          )}
        </div>
      )}

    </div>
  )
}
