"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export interface Category {
  id:        string
  name:      string
  color:     string
  parent_id: string | null
}

interface Props {
  customerId: string
  assigned:   Category[]
  all:        Category[]
}

export function CategoriesSection({ customerId, assigned, all }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState("")
  const [removing, setRemoving] = useState<string | null>(null)

  const assignedIds = new Set(assigned.map(c => c.id))
  const available   = all.filter(c => !assignedIds.has(c.id))

  async function handleAdd() {
    if (!selectedId || isPending) return
    const res = await fetch(`/api/customers/${customerId}/categories`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ categoryId: selectedId }),
    })
    if (!res.ok) return
    setSelectedId("")
    startTransition(() => router.refresh())
  }

  async function handleRemove(categoryId: string, name: string) {
    if (!confirm(`Kategorie „${name}" entfernen?`)) return
    setRemoving(categoryId)
    await fetch(`/api/customers/${customerId}/categories/${categoryId}`, { method: "DELETE" })
    setRemoving(null)
    startTransition(() => router.refresh())
  }

  // Build grouped options:
  // - Root categories that have children → <optgroup>
  // - Root categories with no children   → <option>
  // - Orphaned children (parent missing) → flat <option>
  const rootCats   = all.filter(c => !c.parent_id)
  const childrenOf = (parentId: string) => available.filter(c => c.parent_id === parentId)
  const orphans    = available.filter(c => c.parent_id && !all.find(p => p.id === c.parent_id))

  const SELECT_STYLE: React.CSSProperties = {
    background: "var(--surface-2)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "var(--space-1) var(--space-3)",
    color: "var(--text)", fontSize: "var(--text-sm)", cursor: "pointer", outline: "none",
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
      <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
        Kategorien
        {assigned.length > 0 && (
          <span style={{ fontWeight: 400, fontSize: "var(--text-sm)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
            ({assigned.length})
          </span>
        )}
      </h2>

      {/* Assigned badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: assigned.length > 0 ? "var(--space-4)" : 0 }}>
        {assigned.length === 0 && available.length === 0 && (
          <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Keine Kategorien vorhanden. Kategorien können im Admin-Bereich angelegt werden.
          </span>
        )}
        {assigned.map(cat => (
          <span key={cat.id} style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            background: `${cat.color}22`, color: cat.color,
            border: `1px solid ${cat.color}55`,
            borderRadius: "var(--radius-sm)",
            padding: "3px 6px 3px 10px",
            fontSize: "var(--text-sm)", fontWeight: 600,
          }}>
            {cat.name}
            <button
              onClick={() => handleRemove(cat.id, cat.name)}
              disabled={removing === cat.id || isPending}
              title="Entfernen"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "inherit", opacity: removing === cat.id ? 0.3 : 0.6,
                padding: "0 2px", fontSize: "15px", lineHeight: 1,
                display: "inline-flex", alignItems: "center",
              }}
            >×</button>
          </span>
        ))}
      </div>

      {/* Add dropdown */}
      {available.length > 0 && (
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ ...SELECT_STYLE, color: selectedId ? "var(--text)" : "var(--text-muted)", minWidth: "220px" }}
          >
            <option value="">Kategorie hinzufügen…</option>

            {rootCats.map(parent => {
              const kids          = childrenOf(parent.id)
              const parentFree    = !assignedIds.has(parent.id)

              // Root with no children
              if (kids.length === 0) {
                return parentFree
                  ? <option key={parent.id} value={parent.id}>{parent.name}</option>
                  : null
              }

              // Root with children → optgroup
              return (
                <optgroup key={parent.id} label={parent.name}>
                  {parentFree && (
                    <option value={parent.id}>{parent.name} (allgemein)</option>
                  )}
                  {kids.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              )
            })}

            {/* Orphaned children whose parent isn't in the list */}
            {orphans.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={handleAdd}
            disabled={!selectedId || isPending}
            style={{
              background:   selectedId ? "var(--primary-bright)" : "var(--surface-2)",
              color:        selectedId ? "#fff" : "var(--text-muted)",
              border:       "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding:      "var(--space-1) var(--space-4)",
              fontSize:     "var(--text-sm)", fontWeight: 600,
              cursor:       selectedId ? "pointer" : "default",
              opacity:      isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "…" : "Hinzufügen"}
          </button>
        </div>
      )}
    </div>
  )
}
