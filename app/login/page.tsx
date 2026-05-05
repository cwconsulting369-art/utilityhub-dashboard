"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L4.09 13.5H11v8.5L19.91 10.5H13V2Z" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconEye({ closed }: { closed: boolean }) {
  if (closed) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]             = useState("")
  const [password, setPassword]       = useState("")
  const [error, setError]             = useState("")
  const [loading, setLoading]         = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocus, setEmailFocus]   = useState(false)
  const [passFocus, setPassFocus]     = useState(false)

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

    router.push("/app/dashboard")
    router.refresh()
  }

  const inputBase: React.CSSProperties = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-3) var(--space-4)",
    color: "var(--text)",
    fontSize: "var(--text-sm)",
    outline: "none",
    width: "100%",
    transition: "border-color 180ms ease, box-shadow 180ms ease",
  }

  return (
    <>
      <style>{`
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orb-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-40px, 30px) scale(1.1); }
        }
        @keyframes orb-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, -20px) scale(0.95); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-input:focus {
          border-color: var(--primary-bright) !important;
          box-shadow: 0 0 0 3px rgba(58,111,216,0.2) !important;
        }
        .login-btn:hover:not(:disabled) {
          background: var(--primary-hover) !important;
          box-shadow: 0 4px 20px rgba(58,111,216,0.35) !important;
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .pw-toggle:hover {
          color: var(--text) !important;
        }
        .login-card {
          animation: loginFadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .login-card { animation: none; }
          .orb { animation: none !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* ambient background orbs */}
        <div className="orb" style={{
          position: "absolute", top: "15%", left: "10%",
          width: "420px", height: "420px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(58,111,216,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "orb-drift-1 14s ease-in-out infinite",
        }} />
        <div className="orb" style={{
          position: "absolute", bottom: "10%", right: "8%",
          width: "320px", height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(24,44,89,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "orb-drift-2 18s ease-in-out infinite",
        }} />

        <div className="login-card" style={{ width: "100%", maxWidth: "400px" }}>

          {/* Logo + heading */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              marginBottom: "var(--space-5)",
            }}>
              <div style={{
                width: "40px", height: "40px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--primary-bright) 0%, #2554b8 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(58,111,216,0.4)",
              }}>
                <IconBolt />
              </div>
              <span style={{ fontWeight: 700, fontSize: "var(--text-lg)", letterSpacing: "-0.01em" }}>
                UtilityHub
              </span>
            </div>

            <h1 style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              marginBottom: "var(--space-2)",
              letterSpacing: "-0.02em",
            }}>
              Willkommen zurück
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              Melde dich mit deinen Zugangsdaten an
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-8)",
            boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(58,111,216,0.06)",
          }}>
            <form onSubmit={handleSubmit} style={{
              display: "flex", flexDirection: "column",
              gap: "var(--space-5)",
            }}>
              {error && (
                <div role="alert" style={{
                  background: "rgba(248,81,73,0.08)",
                  border: "1px solid rgba(248,81,73,0.25)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3) var(--space-4)",
                  color: "var(--error)",
                  fontSize: "var(--text-sm)",
                  display: "flex",
                  gap: "var(--space-2)",
                  alignItems: "flex-start",
                }}>
                  <span style={{ flexShrink: 0, marginTop: "1px" }}>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label
                  htmlFor="email"
                  style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-muted)" }}
                >
                  E-Mail
                </label>
                <input
                  id="email"
                  className="login-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="name@unternehmen.de"
                  style={{
                    ...inputBase,
                    ...(emailFocus ? {
                      borderColor: "var(--primary-bright)",
                      boxShadow: "0 0 0 3px rgba(58,111,216,0.2)",
                    } : {}),
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-muted)" }}
                >
                  Passwort
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    className="login-input"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPassFocus(true)}
                    onBlur={() => setPassFocus(false)}
                    placeholder="••••••••"
                    style={{
                      ...inputBase,
                      paddingRight: "var(--space-10)",
                      ...(passFocus ? {
                        borderColor: "var(--primary-bright)",
                        boxShadow: "0 0 0 3px rgba(58,111,216,0.2)",
                      } : {}),
                    }}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "var(--space-3)",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      transition: "color var(--transition)",
                      padding: "var(--space-1)",
                      lineHeight: 0,
                    }}
                  >
                    <IconEye closed={showPassword} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="login-btn"
                style={{
                  background: "linear-gradient(135deg, var(--primary-bright) 0%, #2554b8 100%)",
                  color: "#fff",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3) var(--space-6)",
                  fontWeight: 600,
                  fontSize: "var(--text-sm)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.65 : 1,
                  transition: "background var(--transition), box-shadow var(--transition), transform 120ms ease, opacity var(--transition)",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-2)",
                  letterSpacing: "0.01em",
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: "14px", height: "14px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    Anmelden…
                  </>
                ) : "Anmelden"}
              </button>
            </form>
          </div>

          {/* Trust signals */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-4)",
            marginTop: "var(--space-6)",
            flexWrap: "wrap",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "var(--space-1)",
              color: "var(--text-faint)", fontSize: "var(--text-xs)",
            }}>
              <IconLock />
              SSL-verschlüsselt
            </div>
            <div style={{
              width: "3px", height: "3px", borderRadius: "50%",
              background: "var(--text-faint)",
            }} />
            <div style={{
              display: "flex", alignItems: "center", gap: "var(--space-1)",
              color: "var(--text-faint)", fontSize: "var(--text-xs)",
            }}>
              <IconShield />
              256-Bit AES
            </div>
            <div style={{
              width: "3px", height: "3px", borderRadius: "50%",
              background: "var(--text-faint)",
            }} />
            <span style={{ color: "var(--text-faint)", fontSize: "var(--text-xs)" }}>
              DSGVO-konform
            </span>
          </div>

        </div>
      </div>

    </>
  )
}
