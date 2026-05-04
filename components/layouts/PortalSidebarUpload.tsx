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
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{
        fontSize: "10px", fontWeight: 700, color: "var(--text-muted)",
        letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2px",
      }}>
        Schnell-Upload
      </div>

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--primary-bright)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            padding: "10px 8px",
            textAlign: "center",
            cursor: "pointer",
            fontSize: "11px",
            color: dragOver ? "var(--primary-bright)" : "var(--text-muted)",
            background: dragOver ? "rgba(56,139,253,0.06)" : "var(--surface-2)",
            transition: "all 0.15s",
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>📤</div>
          Dokument hochladen
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: "6px 8px",
          fontSize: "11px",
        }}>
          <span style={{
            flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            color: "var(--text)",
          }}>
            📄 {file.name}
          </span>
          <button
            onClick={clearFile}
            disabled={uploading}
            title="Entfernen"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", padding: 0, fontSize: "13px",
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
            background: uploading ? "var(--surface-2)" : "var(--primary-bright)",
            color:      uploading ? "var(--text-muted)" : "#fff",
            border: "none", borderRadius: "var(--radius-md)",
            padding: "7px 8px", fontSize: "11px", fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            width: "100%", textAlign: "center",
          }}
        >
          {uploading ? "Lädt…" : "Hochladen"}
        </button>
      )}

      {error && (
        <div style={{ fontSize: "10px", color: "#f85149", padding: "2px 0" }}>{error}</div>
      )}
      {success && (
        <div style={{ fontSize: "11px", color: "#3fb950", padding: "2px 0", fontWeight: 500 }}>
          ✓ Hochgeladen
        </div>
      )}
    </div>
  )
}
