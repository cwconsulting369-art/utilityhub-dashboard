"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const accentColor = portalType === "app" ? "var(--primary-bright)" : "#3fb950"

  if (pathname === "/portal/change-password") {
    return <>{children}</>
  }

  const initials = user.name
    ? user.name.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>

      <aside style={{
        width: "240px", flexShrink: 0,
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100dvh", overflowY: "auto",
      }}>

        {/* Logo */}
        <div style={{
          padding: "var(--space-5)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "var(--space-3)",
        }}>
          <div style={{
            width: "36px", height: "36px",
            borderRadius: "var(--radius-md)",
            background: accentColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "13px", flexShrink: 0,
            letterSpacing: "-0.5px", color: "#fff",
          }}>uh</div>
          <div>
            <div style={{ fontSize: "var(--text-sm)", lineHeight: 1.2 }}>
              <span style={{ fontWeight: 300, letterSpacing: "0.06em" }}>UTILITY</span>
              <span style={{ fontWeight: 800, letterSpacing: "0.04em" }}>HUB</span>
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
              {portalType === "app" ? "Internes Portal" : "Kundenportal"}
            </div>
          </div>
        </div>

        {/* Nav */}
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

      </aside>

      <main style={{
        flex: 1,
        overflowY: "auto", maxWidth: "calc(100% - 240px)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Top header bar with profile icon (portal only) */}
        {portalType === "portal" && (
          <div style={{
            display: "flex", justifyContent: "flex-end", alignItems: "center",
            padding: "var(--space-3) var(--space-8)",
            borderBottom: "1px solid var(--border)",
            position: "sticky", top: 0, zIndex: 20,
            background: "var(--background)",
          }}>
            <div ref={profileRef} style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                title={user.name || user.email}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: accentColor,
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "13px", color: "#fff",
                  flexShrink: 0,
                }}
              >
                {initials}
              </button>
              {profileOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", overflow: "hidden",
                  minWidth: "180px", zIndex: 50,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}>
                  <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, marginBottom: "2px" }}>{user.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{user.email}</div>
                  </div>
                  <a href="/portal/settings" style={{
                    display: "flex", alignItems: "center", gap: "var(--space-2)",
                    padding: "var(--space-2) var(--space-4)",
                    fontSize: "var(--text-sm)", color: "var(--text)", textDecoration: "none",
                  }}
                  onClick={() => setProfileOpen(false)}
                  >
                    <span>⚙</span> Einstellungen
                  </a>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: "100%", padding: "var(--space-2) var(--space-4)",
                      display: "flex", alignItems: "center", gap: "var(--space-2)",
                      textAlign: "left", fontSize: "var(--text-sm)",
                      color: "#f85149", background: "transparent", border: "none",
                      cursor: "pointer", borderTop: "1px solid var(--border)",
                    }}
                  >
                    <span>↪</span> Abmelden
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ padding: "var(--space-8)" }}>
          {children}
        </div>
      </main>

    </div>
  )
}
