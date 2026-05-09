"use client"

import { useState, useRef, useEffect } from "react"

interface CustomerHit {
  id:              string
  full_name:       string
  city:            string | null
  address_display: string | null
}

export function SidebarUpload() {
  const [file,      setFile]      = useState<File | null>(null)
  const [dragging,  setDragging]  = useState(false)
  const [query,     setQuery]     = useState("")
  const [results,   setResults]   = useState<CustomerHit[]>([])
  const [searching, setSearching] = useState(false)
  const [customer,  setCustomer]  = useState<CustomerHit | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState("")
  const fileRef    = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    setSearching(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`)
        const data = await res.json() as CustomerHit[]
        setResults(Array.isArray(data) ? data : [])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  function pickFile(f: File) {
    setFile(f)
    setSuccess(false)
    setError("")
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }

  function selectCustomer(c: CustomerHit) {
    setCustomer(c)
    setQuery("")
    setResults([])
  }

  function reset() {
    setFile(null); setCustomer(null); setQuery(""); setResults([])
    setError(""); setSuccess(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleUpload() {
    if (!file || !customer) return
    setError(""); setUploading(true)
    const fd = new FormData()
    fd.set("file",               file)
    fd.set("customer_id",        customer.id)
    fd.set("visible_to_customer","false")
    try {
      const res  = await fetch("/api/documents/upload", { method: "POST", body: fd })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) { setError(json.error ?? "Upload fehlgeschlagen"); return }
      reset()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setUploading(false)
    }
  }

  const canUpload = !!file && !!customer && !uploading

  const BORDER_COLOR = dragging ? "var(--primary-bright)" : "rgba(88,166,255,0.45)"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#58a6ff", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2px" }}>
        Schnell-Upload
      </div>

      {/* Drop zone */}
      {!file && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${BORDER_COLOR}`,
            borderRadius: "var(--radius-md)",
            padding: "10px 8px",
            textAlign: "center",
            cursor: "pointer",
            fontSize: "11px",
            color: dragging ? "var(--primary-bright)" : "#58a6ff",
            background: dragging ? "rgba(56,139,253,0.08)" : "rgba(88,166,255,0.05)",
            transition: "all 0.15s",
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
              <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          Datei hierher ziehen<br />oder klicken
        </div>
      )}
      <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }} />

      {/* File selected state */}
      {file && (
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: "6px 8px",
          fontSize: "11px",
        }}>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text)" }}>
            📄 {file.name}
          </span>
          <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = "" }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, fontSize: "13px", lineHeight: 1, flexShrink: 0 }}
            title="Entfernen"
          >✕</button>
        </div>
      )}

      {/* Customer search — only shown when file is picked */}
      {file && !customer && (
        <>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Objekt / Kunde suchen…"
            style={{
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", padding: "6px 8px",
              color: "var(--text)", fontSize: "11px", outline: "none", width: "100%", boxSizing: "border-box",
            }}
          />

          {/* Results dropdown */}
          {results.length > 0 && (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", overflow: "hidden",
            }}>
              {results.map(c => (
                <button
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: "none", border: "none", cursor: "pointer",
                    padding: "7px 10px", fontSize: "11px", color: "var(--text)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.full_name}</div>
                  {(c.address_display || c.city) && (
                    <div style={{ color: "var(--text-muted)", fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.address_display ?? c.city}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          {query.length >= 2 && !searching && results.length === 0 && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", padding: "4px 0" }}>
              Kein Treffer
            </div>
          )}
        </>
      )}

      {/* Selected customer confirmation */}
      {file && customer && (
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(88,166,255,0.08)", border: "1px solid rgba(88,166,255,0.3)",
          borderRadius: "var(--radius-md)", padding: "6px 8px",
          fontSize: "11px",
        }}>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#58a6ff", fontWeight: 500 }}>
            → {customer.full_name}
          </span>
          <button onClick={() => setCustomer(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, fontSize: "12px", lineHeight: 1, flexShrink: 0 }}
            title="Anderes Objekt wählen"
          >✕</button>
        </div>
      )}

      {/* Upload button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={!canUpload}
          style={{
            background:   canUpload ? "var(--primary-bright)" : "var(--surface-2)",
            color:        canUpload ? "#fff" : "var(--text-muted)",
            border:       "none", borderRadius: "var(--radius-md)",
            padding:      "7px 8px", fontSize: "11px", fontWeight: 600,
            cursor:       canUpload ? "pointer" : "not-allowed",
            width:        "100%", textAlign: "center",
          }}
        >
          {uploading ? "Lädt…" : !customer ? "Erst Objekt wählen ↑" : "Hochladen"}
        </button>
      )}

      {error && (
        <div style={{ fontSize: "10px", color: "#f85149", padding: "2px 0" }}>{error}</div>
      )}
      {success && (
        <div style={{ fontSize: "11px", color: "#58a6ff", padding: "2px 0", fontWeight: 500 }}>✓ Hochgeladen</div>
      )}
    </div>
  )
}
