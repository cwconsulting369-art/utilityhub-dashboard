"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ROLE_LABELS, type UserRole } from "@/lib/types"
import { PortalSidebarUpload } from "./PortalSidebarUpload"

interface NavItem {
  href:  string
  label: string
  icon:  string
  badge?: number
}

interface PortalNavProps {
  items:          NavItem[]
  user: {
    name:  string
    email: string
    role:  string
  }
  portalType:     "app" | "portal"
  children:       React.ReactNode
  sidebarBottom?: React.ReactNode
}

export default function PortalNav({ items, user, portalType, children, sidebarBottom }: PortalNavProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const accentColor = portalType === "app" ? "var(--primary-bright)" : "#3fb950"

  // Forced-password-change page renders full-screen (no sidebar/chrome).
  if (pathname === "/portal/change-password") {
    return <>{children}</>
  }

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>

      <aside style={{
        width: "240px", flexShrink: 0,
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100dvh", overflowY: "auto",
      }}>

        <div style={{
          padding: "var(--space-5)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "var(--space-3)",
        }}>
          <div style={{
            width: "32px", height: "32px",
            borderRadius: "var(--radius-md)",
            background: accentColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "14px", flexShrink: 0,
          }}>U</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>UtilityHub</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {portalType === "app" ? "Internes Portal" : "Kundenportal"}
            </div>
          </div>
        </div>

        <nav style={{
          flex: 1, padding: "var(--space-4)",
          display: "flex", flexDirection: "column", gap: "var(--space-1)",
        }}>
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "var(--space-3)",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#fff" : "var(--text-muted)",
                background: isActive ? accentColor : "transparent",
                transition: "var(--transition)",
                textDecoration: "none",
              }}>
                <span style={{ fontSize: "1rem", lineHeight: 1 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span style={{
                    background: "#f59e0b", color: "#fff",
                    borderRadius: "999px",
                    padding: "1px 7px",
                    fontSize: "10px", fontWeight: 700,
                    minWidth: "18px", textAlign: "center", lineHeight: "14px",
                  }}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {sidebarBottom && (
          <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
            {sidebarBottom}
          </div>
        )}

        {portalType === "portal" && (
          <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
            <PortalSidebarUpload />
          </div>
        )}

        <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
          <div style={{
            padding: "var(--space-3)", background: "var(--surface-2)",
            borderRadius: "var(--radius-md)", marginBottom: "var(--space-3)",
          }}>
            <div style={{ fontWeight: 600, fontSize: "var(--text-xs)", marginBottom: "2px" }}>
              {user.name}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "2px" }}>
              {user.email}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: accentColor, fontWeight: 600 }}>
              {ROLE_LABELS[user.role as UserRole] ?? user.role}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%", padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)", fontSize: "var(--text-xs)",
              fontWeight: 600, color: "var(--text-muted)",
              background: "transparent", border: "1px solid var(--border)",
              cursor: "pointer", textAlign: "center", transition: "var(--transition)",
            }}
          >
            Abmelden
          </button>
        </div>

      </aside>

      <main style={{
        flex: 1, padding: "var(--space-8)",
        overflowY: "auto", maxWidth: "calc(100% - 240px)",
      }}>
        {children}
      </main>

    </div>
  )
}
