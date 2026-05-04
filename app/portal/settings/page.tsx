import { createClient } from "@/lib/supabase/server"
import { redirect }     from "next/navigation"

export const metadata = { title: "Einstellungen | UtilityHub" }

export default async function PortalSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const rows = [
    { label: "Name",   value: profile?.full_name ?? "—" },
    { label: "E-Mail", value: user.email ?? "—"          },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>Einstellungen</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Ihre Kontoinformationen
        </p>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
      }}>
        <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Mein Konto</h2>
        </div>
        <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {rows.map(({ label, value }) => (
            <div key={label} style={{
              display: "grid", gridTemplateColumns: "140px 1fr",
              gap: "var(--space-3)", alignItems: "center",
            }}>
              <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{label}</span>
              <span style={{ fontSize: "var(--text-sm)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: "2px" }}>Passwort ändern</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            Bitte wenden Sie sich an den Support.
          </div>
        </div>
        <span style={{
          fontSize: "10px", fontWeight: 600, color: "var(--text-muted)",
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", padding: "1px 7px", letterSpacing: "0.04em",
        }}>BALD</span>
      </div>

    </div>
  )
}
