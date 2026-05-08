import { createClient } from "@/lib/supabase/server"

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single()

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
        Willkommen{profile?.full_name ? `, ${profile.full_name}` : ""}
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-8)" }}>
        Ihr Kundenportal wird gerade eingerichtet.
      </p>

      <div style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "2rem" }}>🔧</div>
        <p style={{ fontWeight: 600 }}>Portal im Aufbau</p>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", maxWidth: "360px" }}>
          Ihr Bereich für Dokumente, Objekte und Nachrichten wird in Kürze verfügbar sein.
          Bei Fragen wenden Sie sich an Ihren Betreuer.
        </p>
      </div>
    </div>
  )
}
