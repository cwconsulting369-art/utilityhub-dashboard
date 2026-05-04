"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Layout at /app handles role-based redirect (customer → /portal/dashboard)
    router.push("/app/dashboard")
    router.refresh()
  }

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-6)",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>

        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            marginBottom: "var(--space-6)",
          }}>
            <div style={{
              width: "36px", height: "36px",
              borderRadius: "var(--radius-md)",
              background: "var(--primary-bright)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "16px",
            }}>U</div>
            <span style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>UtilityHub</span>
          </div>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
            Anmelden
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Melde dich mit deinen Zugangsdaten an
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-8)",
          display: "flex", flexDirection: "column",
          gap: "var(--space-5)",
        }}>
          {error && (
            <div style={{
              background: "rgba(248,81,73,0.1)",
              border: "1px solid rgba(248,81,73,0.3)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3) var(--space-4)",
              color: "var(--error)",
              fontSize: "var(--text-sm)",
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-muted)" }}>
              E-Mail
            </label>
            <input
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@unternehmen.de"
              style={{
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
                color: "var(--text)", fontSize: "var(--text-sm)", outline: "none", width: "100%",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-muted)" }}>
              Passwort
            </label>
            <input
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
                color: "var(--text)", fontSize: "var(--text-sm)", outline: "none", width: "100%",
              }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              background: "var(--primary-bright)", color: "#fff",
              borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-6)",
              fontWeight: 600, fontSize: "var(--text-sm)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "var(--transition)", width: "100%",
            }}
          >
            {loading ? "Anmelden..." : "Anmelden"}
          </button>
        </form>

      </div>
    </div>
  )
}
