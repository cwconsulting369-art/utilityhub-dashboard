import { createClient } from "@/lib/supabase/server"
import { redirect }     from "next/navigation"

export const metadata = { title: "Einstellungen | UtilityHub" }

const ROLE_LABELS: Record<string, string> = {
  admin:    "Administrator",
  staff:    "Mitarbeiter",
  customer: "Kunde",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_active, created_at")
    .eq("id", user.id)
    .single()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>Einstellungen</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Konto- & App-Einstellungen
        </p>
      </div>

      {/* Account info */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
      }}>
        <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Mein Konto</h2>
        </div>
        <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

          {[
            { label: "Name",        value: profile?.full_name ?? "—"                              },
            { label: "E-Mail",      value: user.email ?? "—"                                       },
            { label: "Rolle",       value: ROLE_LABELS[profile?.role ?? ""] ?? profile?.role ?? "—" },
            { label: "Status",      value: profile?.is_active ? "Aktiv" : "Inaktiv"                },
            {
              label: "Mitglied seit",
              value: profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("de-DE")
                : "—",
            },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: "grid", gridTemplateColumns: "160px 1fr",
              gap: "var(--space-3)", alignItems: "center",
            }}>
              <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{label}</span>
              <span style={{ fontSize: "var(--text-sm)" }}>{value}</span>
            </div>
          ))}

        </div>
      </div>

      {/* Coming soon */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
      }}>
        <div style={{ fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
          Weitere Einstellungen
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {[
            "Passwort ändern",
            "Benachrichtigungen",
            "Benutzer & Rollen verwalten (Admin)",
          ].map(item => (
            <div key={item} style={{
              padding:      "var(--space-3) var(--space-4)",
              background:   "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              display:      "flex", justifyContent: "space-between", alignItems: "center",
              opacity:      0.6,
            }}>
              <span style={{ fontSize: "var(--text-sm)" }}>{item}</span>
              <span style={{
                fontSize: "10px", fontWeight: 600, color: "var(--text-muted)",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", padding: "1px 7px", letterSpacing: "0.04em",
              }}>
                BALD
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
