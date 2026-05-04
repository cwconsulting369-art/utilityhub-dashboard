"use client"

import { useState, useTransition, useRef } from "react"
import { addCustomerNote } from "./actions"

export function NoteForm({ customerId }: { customerId: string }) {
  const [content,    setContent]    = useState("")
  const [errorMsg,   setErrorMsg]   = useState("")
  const [isPending,  startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")
    startTransition(async () => {
      const result = await addCustomerNote(customerId, content)
      if (result.error) {
        setErrorMsg(result.error)
      } else {
        setContent("")
        textareaRef.current?.focus()
      }
    })
  }

  const canSubmit = content.trim().length > 0 && !isPending

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Interne Notiz verfassen…"
        rows={3}
        disabled={isPending}
        style={{
          background:   "var(--surface-2)",
          border:       "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding:      "var(--space-3) var(--space-4)",
          color:        "var(--text)",
          fontSize:     "var(--text-sm)",
          resize:       "vertical",
          width:        "100%",
          boxSizing:    "border-box",
          outline:      "none",
          fontFamily:   "inherit",
          opacity:      isPending ? 0.6 : 1,
        }}
      />

      {errorMsg && (
        <div style={{
          background:   "rgba(248,81,73,0.08)",
          border:       "1px solid rgba(248,81,73,0.3)",
          borderRadius: "var(--radius-md)",
          padding:      "var(--space-2) var(--space-3)",
          color:        "#f85149",
          fontSize:     "var(--text-xs)",
        }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          Nur intern sichtbar · max. 2000 Zeichen
        </span>
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            background:   canSubmit ? "var(--primary-bright)" : "var(--surface-2)",
            color:        "#fff",
            border:       "none",
            borderRadius: "var(--radius-md)",
            padding:      "var(--space-2) var(--space-5)",
            fontWeight:   600,
            fontSize:     "var(--text-sm)",
            cursor:       canSubmit ? "pointer" : "not-allowed",
            whiteSpace:   "nowrap",
          }}
        >
          {isPending ? "Speichern…" : "Notiz speichern"}
        </button>
      </div>
    </form>
  )
}
