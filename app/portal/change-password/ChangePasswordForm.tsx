"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const INPUT: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
  color: "var(--text)", fontSize: "var(--text-base)", outline: "none",
  width: "100%", boxSizing: "border-box",
}
const LABEL: React.CSSProperties = {
  color: "var(--text-muted)", marginBottom: "var(--space-2)",
  fontSize: "var(--text-xs)", fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.06em",
}

export function ChangePasswordForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [pw1, setPw1]     = useState("")
  const [pw2, setPw2]     = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (pw1.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.")
      return
    }
    if (pw1 !== pw2) {
      setError("Die beiden Passwörter stimmen nicht überein.")
      return
    }

    startTransition(async () => {
      const supabase = createClient()

      const { error: updErr } = await supabase.auth.updateUser({ password: pw1 })
      if (updErr) {
        setError("Passwort konnte nicht gespeichert werden: " + updErr.message)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Sitzung abgelaufen. Bitte erneut anmelden.")
        router.replace("/login")
        return
      }

      const { error: profErr } = await supabase
        .from("profiles")
        .update({ password_changed: true })
        .eq("id", user.id)
      if (profErr) {
        setError("Profil konnte nicht aktualisiert werden: " + profErr.message)
        return
      }

      router.replace("/portal/dashboard")
    })
  }

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "var(--space-6)",
      background: "var(--background)",
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-8)",
        maxWidth: "480px", width: "100%",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}>
        {/* Logo + heading */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
          <div style={{
            width: "40px", height: "40px",
            borderRadius: "var(--radius-md)", background: "#3fb950",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: "18px",
          }}>U</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>UtilityHub</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Kundenportal</div>
          </div>
        </div>

        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
          Passwort festlegen
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
          Beim ersten Login musst du ein eigenes Passwort vergeben.
          Mindestens 8 Zeichen.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <div style={LABEL}>Neues Passwort</div>
            <input
              type="password"
              value={pw1}
              onChange={e => { setPw1(e.target.value); setError("") }}
              autoFocus
              required
              minLength={8}
              autoComplete="new-password"
              disabled={pending}
              style={INPUT}
            />
          </div>

          <div>
            <div style={LABEL}>Passwort bestätigen</div>
            <input
              type="password"
              value={pw2}
              onChange={e => { setPw2(e.target.value); setError("") }}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={pending}
              style={INPUT}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)",
              borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
              color: "#f85149", fontSize: "var(--text-sm)",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending || pw1.length < 8 || pw1 !== pw2}
            style={{
              background: pending || pw1.length < 8 || pw1 !== pw2 ? "var(--surface-2)" : "#3fb950",
              color:      pending || pw1.length < 8 || pw1 !== pw2 ? "var(--text-muted)" : "#fff",
              border: "none", borderRadius: "var(--radius-md)",
              padding: "var(--space-3) var(--space-5)",
              fontSize: "var(--text-base)", fontWeight: 600,
              cursor:  pending || pw1.length < 8 || pw1 !== pw2 ? "not-allowed" : "pointer",
              marginTop: "var(--space-2)",
            }}
          >
            {pending ? "Speichere…" : "Passwort speichern"}
          </button>
        </form>

        <div style={{
          fontSize: "var(--text-xs)", color: "var(--text-muted)",
          textAlign: "center", marginTop: "var(--space-6)",
          paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)",
        }}>
          Sicherheitshinweis: Nutze ein einmaliges Passwort, das du nirgends sonst verwendest.
        </div>
      </div>
    </div>
  )
}
