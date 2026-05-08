import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "UtilityHub | Kundenportal" }

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "customer") redirect("/app/dashboard")

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface)", color: "var(--text)" }}>
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "var(--space-4) var(--space-6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontWeight: 700 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13 2L4.09 13.5H11v8.5L19.91 10.5H13V2Z" />
          </svg>
          UtilityHub
        </div>
        <form action="/api/auth/logout" method="post">
          <button type="submit" style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-3)",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "var(--text-sm)",
          }}>
            Abmelden
          </button>
        </form>
      </header>
      <main style={{ padding: "var(--space-6)" }}>
        {children}
      </main>
    </div>
  )
}
