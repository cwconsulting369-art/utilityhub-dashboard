"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateCustomerStammdaten, type StammdatenInput } from "./actions"

export interface OrgOption { id: string; name: string }

interface Props {
  customerId: string
  initial:    StammdatenInput
  orgs:       OrgOption[]
}

const OBJECT_TYPE_OPTIONS = [
  { value: "weg",    label: "WEG"    },
  { value: "privat", label: "Privat" },
]

// Returns the street part (after " / ") of a full WEG-style name.
// Falls back to "Name" if no separator or empty street.
function nameLabel(fullName: string): string {
  if (!fullName) return "Name"
  const idx = fullName.indexOf(" / ")
  if (idx < 0) return "Name"
  return fullName.slice(idx + 3).trim() || "Name"
}

const INPUT: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", padding: "5px 10px",
  color: "var(--text)", fontSize: "var(--text-sm)", lineHeight: 1.3, outline: "none",
  width: "100%", height: "32px", boxSizing: "border-box",
}
const LABEL: React.CSSProperties = {
  color: "var(--text-muted)", marginBottom: "2px", fontSize: "var(--text-xs)",
}

export function StammdatenForm({ customerId, initial, orgs }: Props) {
  const router = useRouter()
  const [form, setForm]       = useState<StammdatenInput>(initial)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState("")
  const [isPending, startTransition] = useTransition()

  function set(field: keyof StammdatenInput, value: string) {
    setSaved(false)
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaved(false)
    startTransition(async () => {
      const result = await updateCustomerStammdaten(customerId, form)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        router.refresh()
      }
    })
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(initial)

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        display: "flex", flexDirection: "column", gap: "var(--space-2)",
        padding: "var(--space-3) var(--space-4)",
      }}>
        <div>
          <div style={LABEL}>Hausverwaltung</div>
          <select
            value={form.organization_id}
            onChange={e => set("organization_id", e.target.value)}
            style={{ ...INPUT, cursor: "pointer" }}
          >
            <option value="">—</option>
            {orgs.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div style={LABEL}>Objekt-Typ</div>
          <select
            value={form.object_type}
            onChange={e => set("object_type", e.target.value)}
            style={{ ...INPUT, cursor: "pointer" }}
          >
            {OBJECT_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <div style={LABEL}>{nameLabel(form.full_name)} *</div>
          <input
            type="text" value={form.full_name} required
            onChange={e => set("full_name", e.target.value)}
            style={INPUT}
          />
        </div>

        <div>
          <div style={LABEL}>E-Mail</div>
          <input
            type="email" value={form.email}
            onChange={e => set("email", e.target.value)}
            style={INPUT} placeholder="—"
          />
        </div>

        <div>
          <div style={LABEL}>Telefon</div>
          <input
            type="text" value={form.phone}
            onChange={e => set("phone", e.target.value)}
            style={INPUT} placeholder="—"
          />
        </div>

        {/* Straße + Stadt + PLZ in one row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 0.6fr", gap: "var(--space-2)" }}>
          <div>
            <div style={LABEL}>Straße</div>
            <input
              type="text" value={form.address}
              onChange={e => set("address", e.target.value)}
              style={INPUT} placeholder="—"
            />
          </div>
          <div>
            <div style={LABEL}>Stadt</div>
            <input
              type="text" value={form.city}
              onChange={e => set("city", e.target.value)}
              style={INPUT} placeholder="—"
            />
          </div>
          <div>
            <div style={LABEL}>PLZ</div>
            <input
              type="text" value={form.postal_code}
              onChange={e => set("postal_code", e.target.value)}
              style={INPUT} placeholder="—"
            />
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-5)",
        borderTop: "1px solid var(--border)",
      }}>
        <button
          type="submit"
          disabled={isPending || !dirty}
          style={{
            background:   isPending || !dirty ? "var(--surface-2)" : "var(--primary-bright)",
            color:        isPending || !dirty ? "var(--text-muted)" : "#fff",
            border:       "none", borderRadius: "var(--radius-md)",
            padding:      "var(--space-2) var(--space-5)",
            fontSize:     "var(--text-sm)", fontWeight: 600,
            cursor:       isPending || !dirty ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "Speichern…" : "Stammdaten speichern"}
        </button>

        {saved && !dirty && (
          <span style={{ color: "#3fb950", fontSize: "var(--text-sm)" }}>✓ Gespeichert</span>
        )}
        {error && (
          <span style={{ color: "#f85149", fontSize: "var(--text-sm)" }}>{error}</span>
        )}
      </div>
    </form>
  )
}
