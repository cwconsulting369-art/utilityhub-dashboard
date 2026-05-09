"use client"

import { useState } from "react"
import { deleteAllCustomerData } from "./actions"

export function DeleteAllButton() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<{ ok: boolean; message: string } | null>(null)

  async function handleDelete() {
    setLoading(true)
    setResult(null)
    const res = await deleteAllCustomerData()
    setResult(res)
    setLoading(false)
    setConfirm(false)
    if (res.ok) setTimeout(() => window.location.reload(), 1500)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          style={{
            display: "flex", alignItems: "center", gap: "var(--space-2)",
            background: "rgba(248,81,73,0.1)", color: "#f85149",
            border: "1px solid rgba(248,81,73,0.3)", borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-4)",
            fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer",
            transition: "all 150ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,81,73,0.18)"; e.currentTarget.style.borderColor = "rgba(248,81,73,0.6)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(248,81,73,0.1)";  e.currentTarget.style.borderColor = "rgba(248,81,73,0.3)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
          Alle Kundendaten löschen
        </button>
      ) : (
        <div style={{
          background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.35)",
          borderRadius: "var(--radius-md)", padding: "var(--space-4)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "#f85149", fontWeight: 600 }}>
            ⚠ Wirklich alle Kunden, Teleson-Daten, Import-Batches und Portal-Accounts löschen?
          </p>
          <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            Diese Aktion ist nicht rückgängig zu machen.
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                background: "#f85149", color: "#fff", border: "none",
                borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
                fontSize: "var(--text-sm)", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Wird gelöscht…" : "Ja, alles löschen"}
            </button>
            <button
              onClick={() => setConfirm(false)}
              disabled={loading}
              style={{
                background: "transparent", color: "var(--text-muted)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                padding: "var(--space-2) var(--space-4)",
                fontSize: "var(--text-sm)", cursor: "pointer",
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {result && (
        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: result.ok ? "#3fb950" : "#f85149", fontWeight: 500 }}>
          {result.ok ? "✓ " : "✗ "}{result.message}
        </p>
      )}
    </div>
  )
}
