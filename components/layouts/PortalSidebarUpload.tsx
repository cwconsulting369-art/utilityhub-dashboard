"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

export function PortalSidebarUpload() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file,      setFile]      = useState<File | null>(null)
  const [dragOver,  setDragOver]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState("")

  function pickFile(f: File) { setFile(f); setSuccess(false); setError("") }
  function clearFile() {
    setFile(null); setError("")
    if (fileRef.current) fileRef.current.value = ""
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragOver(true) }
  function onDragLeave() { setDragOver(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) pickFile(f)
  }

  async function handleUpload() {
    if (!file || uploading) return
    setUploading(true); setError("")
    const fd = new FormData()
    fd.set("file",  file)
    fd.set("title", "")
    try {
      const res  = await fetch("/api/portal/upload", { method: "POST", body: fd })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) { setError(json.error ?? "Upload fehlgeschlagen"); return }
      setSuccess(true)
      clearFile()
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--primary-bright)" : "rgba(88,166,255,0.4)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-8) var(--space-4)",
            textAlign: "center",
            cursor: "pointer",
            color: dragOver ? "var(--primary-bright)" : "var(--text-muted)",
            background: dragOver ? "rgba(56,139,253,0.06)" : "rgba(88,166,255,0.04)",
            transition: "all 0.15s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)",
          }}
        >
          {/* Cloud-Upload-Icon */}
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "var(--primary-bright)" : "#58a6ff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, lineHeight: 1.5 }}>
            Dateien hierher ziehen
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "#58a6ff", fontWeight: 600 }}>
            oder klicken
          </div>
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: "8px 10px",
          fontSize: "12px",
        }}>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text)" }}>
            📄 {file.name}
          </span>
          <button
            onClick={clearFile}
            disabled={uploading}
            title="Entfernen"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", padding: 0, fontSize: "14px",
              lineHeight: 1, flexShrink: 0, opacity: uploading ? 0.4 : 0.7,
            }}
          >✕</button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
      />

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            background: uploading ? "var(--surface-2)" : "#58a6ff",
            color:      uploading ? "var(--text-muted)" : "#fff",
            border: "none", borderRadius: "var(--radius-md)",
            padding: "8px 10px", fontSize: "12px", fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            width: "100%", textAlign: "center",
          }}
        >
          {uploading ? "Lädt…" : "Hochladen"}
        </button>
      )}

      {error && (
        <div style={{ fontSize: "11px", color: "#f85149", padding: "2px 0" }}>{error}</div>
      )}
      {success && (
        <div style={{ fontSize: "12px", color: "#58a6ff", padding: "2px 0", fontWeight: 500 }}>
          ✓ Hochgeladen
        </div>
      )}
    </div>
  )
}
