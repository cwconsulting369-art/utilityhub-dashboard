"use client"

import { useState } from "react"

export interface Org { id: string; name: string }
interface Credentials { email: string; password: string }

interface Props {
  orgs:     Org[]
  onChange: (orgName: string | null) => void
  disabled?: boolean
}

const INPUT: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-3)",
  color: "var(--text)", fontSize: "var(--text-sm)", outline: "none",
}
const LABEL: React.CSSProperties = {
  fontSize: "var(--text-xs)", color: "var(--text-muted)",
  fontWeight: 500, marginBottom: "var(--space-2)",
}

export function OrgPicker({ orgs, onChange, disabled }: Props) {
  const [choice,    setChoice]    = useState<"" | "__new__" | string>("")
  const [newName,   setNewName]   = useState("")
  const [resolving, setResolving] = useState(false)
  const [fuzzy,     setFuzzy]     = useState<Org[] | null>(null)
  const [creds,     setCreds]     = useState<Credentials | null>(null)
  const [createdName, setCreatedName] = useState<string | null>(null)
  const [error,     setError]     = useState("")
  const [copied,    setCopied]    = useState<string | null>(null)

  function reset() {
    setNewName("")
    setFuzzy(null)
    setCreds(null)
    setCreatedName(null)
    setError("")
  }

  function handleSelectChange(value: string) {
    reset()
    setChoice(value)
    if (value === "" || value === "__new__") {
      onChange(null)
      return
    }
    const org = orgs.find(o => o.id === value)
    onChange(org?.name ?? null)
  }

  async function resolveNewOrg(forceNew: boolean) {
    const name = newName.trim()
    if (!name) { setError("Name eingeben"); return }
    setResolving(true)
    setError("")
    try {
      const res = await fetch("/api/organizations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, force_new: forceNew }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Fehler bei Org-Anlage")
        return
      }
      if (data.mode === "existing") {
        // silent existing-match: switch the dropdown to show the matched org
        // and clear the typed name so the input + button hide.
        setChoice(data.org.id as string)
        setNewName("")
        setFuzzy(null); setCreds(null); setCreatedName(null)
        onChange(data.org.name as string)
      } else if (data.mode === "fuzzy") {
        setFuzzy(data.candidates as Org[])
        setCreds(null); setCreatedName(null)
        onChange(null)
      } else if (data.mode === "created") {
        setFuzzy(null)
        setCreds((data.credentials as Credentials | null) ?? null)
        setCreatedName(data.org.name as string)
        onChange(data.org.name as string)
        if (Array.isArray(data.warnings) && data.warnings.length > 0) {
          setError(data.warnings.join(" · "))
        }
      }
    } catch (e) {
      setError("Netzwerkfehler: " + String(e))
    } finally {
      setResolving(false)
    }
  }

  function pickFuzzy(orgId: string) {
    const m = fuzzy?.find(c => c.id === orgId)
    if (!m) return
    setChoice(orgId)
    setFuzzy(null)
    onChange(m.name)
  }

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for non-HTTPS contexts where navigator.clipboard is unavailable
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity  = "0"
      document.body.appendChild(el)
      el.select()
      try { document.execCommand("copy") } catch {}
      document.body.removeChild(el)
    }
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const showNewInput = choice === "__new__" && !creds

  return (
    <div>
      <div style={LABEL}>Hausverwaltung *</div>
      <select
        value={choice}
        onChange={e => handleSelectChange(e.target.value)}
        disabled={disabled || resolving}
        style={{ ...INPUT, width: "100%", cursor: "pointer" }}
      >
        <option value="">– Wählen –</option>
        {orgs.map(o => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
        <option value="__new__">+ Neue Hausverwaltung anlegen</option>
      </select>

      {showNewInput && (
        <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
          <input
            type="text"
            value={newName}
            onChange={e => { setNewName(e.target.value); setFuzzy(null); setError("") }}
            placeholder="Name der Hausverwaltung"
            disabled={disabled || resolving}
            style={{ ...INPUT, flex: 1 }}
          />
          <button
            type="button"
            onClick={() => resolveNewOrg(false)}
            disabled={!newName.trim() || resolving || disabled}
            style={{
              background: !newName.trim() || resolving ? "var(--surface-2)" : "var(--primary-bright)",
              color: !newName.trim() || resolving ? "var(--text-muted)" : "#fff",
              border: "none", borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--text-sm)", fontWeight: 600,
              cursor: !newName.trim() || resolving ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {resolving ? "…" : "Prüfen / Anlegen"}
          </button>
        </div>
      )}

      {/* Fuzzy match suggestion */}
      {fuzzy && fuzzy.length > 0 && (
        <div style={{
          marginTop: "var(--space-3)",
          background: "rgba(255,166,0,0.08)",
          border: "1px solid rgba(255,166,0,0.3)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-3) var(--space-4)",
          fontSize: "var(--text-sm)",
        }}>
          <div style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>
            Meintest du:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {fuzzy.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
                <span style={{ fontWeight: 500 }}>{c.name}</span>
                <button
                  type="button"
                  onClick={() => pickFuzzy(c.id)}
                  style={{
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", padding: "4px 12px",
                    fontSize: "var(--text-xs)", fontWeight: 600, cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Ja, verwenden
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => resolveNewOrg(true)}
              disabled={resolving}
              style={{
                background: "transparent", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "var(--space-2)",
                fontSize: "var(--text-xs)", color: "var(--text-muted)",
                cursor: resolving ? "not-allowed" : "pointer",
                marginTop: "var(--space-1)",
              }}
            >
              Nein, „{newName}" trotzdem neu anlegen
            </button>
          </div>
        </div>
      )}

      {/* Created credentials — prominent success banner */}
      {creds && createdName && (
        <div style={{
          marginTop: "var(--space-4)",
          background: "linear-gradient(135deg, rgba(63,185,80,0.12), rgba(63,185,80,0.04))",
          border: "2px solid #3fb950",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5) var(--space-6)",
          boxShadow: "0 4px 12px rgba(63,185,80,0.15)",
        }}>
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "#3fb950", color: "#fff",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: 700, flexShrink: 0,
              }}>✓</span>
              <span style={{ fontWeight: 700, color: "#3fb950", fontSize: "var(--text-base)" }}>
                Hausverwaltung „{createdName}" angelegt
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setCreds(null); setCreatedName(null) }}
              title="Banner schließen"
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--text-muted)", fontSize: "16px", padding: "0 4px", lineHeight: 1,
              }}
            >×</button>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "var(--space-2)",
            background: "rgba(255,166,0,0.08)", border: "1px solid rgba(255,166,0,0.25)",
            borderRadius: "var(--radius-sm)", padding: "var(--space-2) var(--space-3)",
            marginBottom: "var(--space-4)",
            color: "#ffa600", fontSize: "var(--text-xs)", fontWeight: 600,
          }}>
            ⚠ Login-Daten werden nur jetzt angezeigt. Bitte vor dem Schließen sichern.
          </div>

          {/* Email row */}
          <CredRow
            label="Email"
            value={creds.email}
            copied={copied === "email"}
            onCopy={() => copyText("email", creds.email)}
          />

          {/* Password row */}
          <div style={{ marginTop: "var(--space-3)" }}>
            <CredRow
              label="Passwort"
              value={creds.password}
              copied={copied === "password"}
              onCopy={() => copyText("password", creds.password)}
            />
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "var(--space-2)", color: "#f85149", fontSize: "var(--text-xs)" }}>
          {error}
        </div>
      )}
    </div>
  )
}

function CredRow({
  label, value, copied, onCopy,
}: {
  label:  string
  value:  string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch", gap: "var(--space-2)",
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", overflow: "hidden",
    }}>
      <div style={{
        background: "var(--surface-2)",
        padding: "var(--space-3) var(--space-4)",
        fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.06em",
        display: "flex", alignItems: "center", minWidth: "92px",
      }}>
        {label}
      </div>
      <code style={{
        flex: 1, alignSelf: "center",
        padding: "var(--space-3) var(--space-2)",
        fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)",
        fontFamily: "monospace",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        userSelect: "all",
      }}>
        {value}
      </code>
      <button
        type="button"
        onClick={onCopy}
        title={`${label} kopieren`}
        style={{
          background: copied ? "#3fb950" : "var(--primary-bright)",
          color: "#fff", border: "none",
          padding: "var(--space-3) var(--space-4)",
          fontSize: "var(--text-xs)", fontWeight: 600,
          cursor: "pointer", whiteSpace: "nowrap",
          minWidth: "120px",
          transition: "background 0.15s",
        }}
      >
        {copied ? "✓ Kopiert" : "📋 Kopieren"}
      </button>
    </div>
  )
}
