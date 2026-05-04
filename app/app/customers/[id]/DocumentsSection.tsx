"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { formatBytes } from "@/lib/documents/storage"

export interface DocumentRow {
  id:                  string
  name:                string
  title:               string | null
  doc_type:            string | null
  mime_type:           string | null
  size_bytes:          number | null
  created_at:          string
  source:              string
  visible_to_customer: boolean
  uploaded_by:         { full_name: string | null } | null
}

const DOC_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "vertrag",   label: "Vertrag"   },
  { value: "rechnung",  label: "Rechnung"  },
  { value: "vollmacht", label: "Vollmacht" },
  { value: "protokoll", label: "Protokoll" },
  { value: "sonstiges", label: "Sonstiges" },
]

function mimeLabel(mime: string | null): { label: string; color: string } {
  if (!mime) return { label: "FILE", color: "var(--text-muted)" }
  if (mime === "application/pdf")         return { label: "PDF",  color: "#f85149" }
  if (mime.startsWith("image/"))          return { label: "BILD", color: "#58a6ff" }
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime === "text/csv")
    return { label: "CSV",  color: "#3fb950" }
  if (mime.includes("word"))              return { label: "WORD", color: "#58a6ff" }
  return { label: "FILE", color: "var(--text-muted)" }
}

const INPUT_STYLE: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-3)",
  color: "var(--text)", fontSize: "var(--text-sm)", outline: "none",
}

interface Props {
  customerId: string
  documents:  DocumentRow[]
}

export function DocumentsSection({ customerId, documents }: Props) {
  const router               = useRouter()
  const fileRef              = useRef<HTMLInputElement>(null)
  const formRef              = useRef<HTMLFormElement>(null)
  const [uploading, startUpload] = useTransition()
  const [deleting,  setDeleting] = useState<string | null>(null)
  const [toggling,  setToggling] = useState<string | null>(null)
  const [error,     setError]    = useState("")
  const [filename,  setFilename] = useState("")
  const [dragOver,  setDragOver] = useState(false)

  const visibleCount = documents.filter(d => d.visible_to_customer).length
  const internCount  = documents.length - visibleCount

  async function doUpload(file: File, title: string) {
    setError("")
    const fd = new FormData()
    fd.set("file",        file)
    fd.set("customer_id", customerId)
    fd.set("title",       title)

    startUpload(async () => {
      const res  = await fetch("/api/documents/upload", { method: "POST", body: fd })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) { setError(json.error ?? "Upload fehlgeschlagen"); return }
      formRef.current?.reset()
      setFilename("")
      router.refresh()
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    const titleEl = e.currentTarget.elements.namedItem("title") as HTMLInputElement | null
    await doUpload(file, titleEl?.value?.trim() ?? "")
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.relatedTarget || !(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
      setDragOver(false)
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setFilename(file.name)
    await doUpload(file, "")
  }

  async function handleDelete(docId: string, docName: string) {
    if (!confirm(`Dokument „${docName}" unwiderruflich löschen?`)) return
    setDeleting(docId)
    await fetch(`/api/documents/${docId}`, { method: "DELETE" })
    setDeleting(null)
    router.refresh()
  }

  async function handleToggleVisibility(docId: string, current: boolean) {
    setToggling(docId)
    await fetch(`/api/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible_to_customer: !current }),
    })
    setToggling(null)
    router.refresh()
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background:    "var(--surface)",
        border:        dragOver ? "1px solid var(--primary-bright)" : "1px solid var(--border)",
        borderRadius:  "var(--radius-lg)",
        overflow:      "hidden",
        transition:    "border-color 0.15s",
      }}
    >
      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div style={{
        padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>
          Dokumente
          {documents.length > 0 && (
            <span style={{ fontWeight: 400, fontSize: "var(--text-sm)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
              ({documents.length})
            </span>
          )}
        </h2>
        {documents.length > 0 && (
          <div style={{ display: "flex", gap: "var(--space-3)", fontSize: "var(--text-xs)" }}>
            {visibleCount > 0 && (
              <span style={{ color: "#3fb950", fontWeight: 600 }}>{visibleCount} sichtbar</span>
            )}
            {internCount > 0 && (
              <span style={{ color: "var(--text-muted)" }}>{internCount} intern</span>
            )}
          </div>
        )}
      </div>

      {/* ── Document list ──────────────────────────────────────────────────── */}
      {documents.length > 0 ? (
        <div style={{ padding: "var(--space-4) var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {documents.map(doc => {
            const { label, color } = mimeLabel(doc.mime_type)
            const author           = doc.uploaded_by?.full_name?.trim() || "Unbekannt"
            const displayName      = doc.title?.trim() || doc.name
            const docTypeLabel     = DOC_TYPE_OPTIONS.find(o => o.value === doc.doc_type)?.label
            return (
              <div key={doc.id} style={{
                display: "flex", alignItems: "center", gap: "var(--space-3)",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
                fontSize: "var(--text-sm)",
              }}>
                {/* MIME badge */}
                <span style={{
                  background: `${color}20`, color, border: `1px solid ${color}44`,
                  borderRadius: "var(--radius-sm)", padding: "1px 6px",
                  fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                }}>{label}</span>

                {/* Doc-type badge */}
                {docTypeLabel && (
                  <span style={{
                    background: "rgba(139,148,158,0.1)", color: "var(--text-muted)",
                    border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                    padding: "1px 6px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                  }}>{docTypeLabel}</span>
                )}

                {/* Name */}
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </span>

                {/* Visibility toggle — clickable */}
                <button
                  onClick={() => handleToggleVisibility(doc.id, doc.visible_to_customer)}
                  disabled={toggling === doc.id}
                  title={doc.visible_to_customer ? "Auf intern setzen" : "Für Kunden sichtbar machen"}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                    color:   doc.visible_to_customer ? "#3fb950" : "var(--text-muted)",
                    opacity: toggling === doc.id ? 0.4 : 1,
                    padding: "2px 6px", borderRadius: "var(--radius-sm)",
                  }}
                >
                  {doc.visible_to_customer ? "Sichtbar" : "Intern"}
                </button>

                {/* Meta */}
                <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {formatBytes(doc.size_bytes)} · {author} · {new Date(doc.created_at).toLocaleDateString("de-DE")}
                </span>

                {/* Open */}
                <a href={`/api/documents/${doc.id}`} target="_blank" rel="noreferrer" style={{
                  color: "var(--primary-bright)", textDecoration: "none", fontSize: "var(--text-xs)",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  Öffnen ↗
                </a>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(doc.id, displayName)}
                  disabled={deleting === doc.id}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", fontSize: "var(--text-xs)",
                    padding: "0 var(--space-1)", flexShrink: 0,
                    opacity: deleting === doc.id ? 0.4 : 1,
                  }}
                  title="Löschen"
                >✕</button>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{
          padding: "var(--space-8)", textAlign: "center",
          color: dragOver ? "var(--primary-bright)" : "var(--text-muted)",
          fontSize: "var(--text-sm)", fontWeight: dragOver ? 500 : undefined,
          transition: "color 0.15s",
        }}>
          {dragOver
            ? "Datei hier ablegen zum Hochladen"
            : "Noch keine Dokumente vorhanden. Datei auswählen oder per Drag & Drop hier ablegen."
          }
        </div>
      )}

      {/* ── Upload form ────────────────────────────────────────────────────── */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        style={{
          padding:    "var(--space-4) var(--space-6)",
          borderTop:  "1px solid var(--border)",
          background: dragOver ? "rgba(56,139,253,0.04)" : undefined,
          transition: "background 0.15s",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" }}>
          <label style={{
            ...INPUT_STYLE, cursor: "pointer",
            color: filename ? "var(--text)" : "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {filename || "Datei wählen…"}
            <input
              ref={fileRef}
              type="file"
              name="file"
              required
              style={{ display: "none" }}
              onChange={e => setFilename(e.target.files?.[0]?.name ?? "")}
            />
          </label>

          <input
            type="text"
            name="title"
            placeholder="Titel (optional)"
            style={{ ...INPUT_STYLE, minWidth: "140px", flex: 1 }}
          />

          <button type="submit" disabled={uploading || !filename} style={{
            background: uploading || !filename ? "var(--surface-2)" : "var(--primary-bright)",
            color:      uploading || !filename ? "var(--text-muted)" : "#fff",
            border: "none", borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-5)",
            fontSize: "var(--text-sm)", fontWeight: 600,
            cursor: uploading || !filename ? "not-allowed" : "pointer", flexShrink: 0,
          }}>
            {uploading ? "Lädt…" : "Hochladen"}
          </button>

          {error && (
            <span style={{ color: "#f85149", fontSize: "var(--text-xs)" }}>{error}</span>
          )}
        </div>

        {dragOver && (
          <div style={{ marginTop: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--primary-bright)" }}>
            Datei loslassen zum Hochladen
          </div>
        )}
      </form>
    </div>
  )
}
