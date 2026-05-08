"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { PortalSidebarUpload } from "./PortalSidebarUpload"
import { BackNavButton } from "@/components/portal/BackNavButton"

interface NavItem {
  href:   string
  label:  string
  icon:   React.ReactNode
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
        width:         "240px",
        flexShrink:    0,
        background:    "var(--surface)",
        borderRight:   "1px solid var(--border)",
        display:       "flex",
        flexDirection: "column",
        position:      "sticky",
        top:           0,
        height:        "100dvh",
        overflowY:     "auto",
      }}>

        {/* Logo */}
        <div style={{
          padding:      "var(--space-5)",
          borderBottom: "1px solid var(--border)",
          display:      "flex",
          alignItems:   "center",
          gap:          "var(--space-3)",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="UtilityHub" style={{ height: "36px", width: "auto", objectFit: "contain" }} />
          <div style={{ fontSize: "var(--text-sm)", lineHeight: 1.2 }}>
            <span style={{ fontWeight: 300, letterSpacing: "0.06em" }}>UTILITY</span>
            <span style={{ fontWeight: 800, letterSpacing: "0.04em" }}>HUB</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{
          flex:          1,
          padding:       "var(--space-4)",
          display:       "flex",
          flexDirection: "column",
          gap:           "var(--space-1)",
        }}>
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none", position: "relative" }}>
                <motion.div
                  whileHover={!isActive ? {
                    backgroundColor: "rgba(255,255,255,0.04)",
                    x: 2,
                    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
                  } : {}}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "var(--space-3)",
                    padding:      "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    fontSize:     "var(--text-base)",
                    fontWeight:   isActive ? 600 : 400,
                    color:        isActive ? "#fff" : "var(--text-muted)",
                    background:   isActive ? accentColor : "transparent",
                    position:     "relative",
                    overflow:     "hidden",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      style={{
                        position:     "absolute",
                        inset:        0,
                        borderRadius: "var(--radius-md)",
                        background:   accentColor,
                        zIndex:       0,
                      }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <span style={{ fontSize: "1.25rem", lineHeight: 1, position: "relative", zIndex: 1 }}>{item.icon}</span>
                  <span style={{ flex: 1, position: "relative", zIndex: 1 }}>{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      style={{
                        background:  "#f59e0b",
                        color:       "#fff",
                        borderRadius: "999px",
                        padding:     "1px 7px",
                        fontSize:    "10px",
                        fontWeight:  700,
                        minWidth:    "18px",
                        textAlign:   "center",
                        lineHeight:  "14px",
                        position:    "relative",
                        zIndex:      1,
                      }}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </motion.span>
                  )}
                </motion.div>
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
        flex:          1,
        overflowY:     "auto",
        maxWidth:      "calc(100% - 240px)",
        display:       "flex",
        flexDirection: "column",
      }}>
        {/* Top header */}
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          gap:            "var(--space-2)",
          padding:        "var(--space-3) var(--space-8)",
          borderBottom:   "1px solid var(--border)",
          position:       "sticky",
          top:            0,
          zIndex:         20,
          background:     "var(--background)",
        }}>
          <BackNavButton />

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {/* Bell */}
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.12 }}
            title="Benachrichtigungen"
            style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </motion.button>

          {/* Help */}
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.12 }}
            title="Hilfe"
            style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </motion.button>

          <div ref={profileRef} style={{ position: "relative" }}>
            <motion.button
              onClick={() => setProfileOpen(o => !o)}
              title={user.name || user.email}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                width:          "44px",
                height:         "44px",
                borderRadius:   "50%",
                background:     "transparent",
                border:         "1px solid var(--border)",
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                color:          "var(--text-muted)",
                flexShrink:     0,
              }}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position:     "absolute",
                    right:        0,
                    top:          "calc(100% + 8px)",
                    background:   "var(--surface)",
                    border:       "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    overflow:     "hidden",
                    minWidth:     "180px",
                    zIndex:       50,
                    boxShadow:    "0 4px 16px rgba(0,0,0,0.4)",
                    transformOrigin: "top right",
                  }}
                >
                  <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, marginBottom: "2px" }}>{user.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{user.email}</div>
                  </div>
                  <a
                    href={portalType === "app" ? "/app/settings" : "/portal/settings"}
                    style={{
                      display:    "flex",
                      alignItems: "center",
                      gap:        "var(--space-2)",
                      padding:    "var(--space-2) var(--space-4)",
                      fontSize:   "var(--text-sm)",
                      color:      "var(--text)",
                      textDecoration: "none",
                      transition: "background 120ms ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    onClick={() => setProfileOpen(false)}
                  >
                    <span>⚙</span> Einstellungen
                  </a>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width:      "100%",
                      padding:    "var(--space-2) var(--space-4)",
                      display:    "flex",
                      alignItems: "center",
                      gap:        "var(--space-2)",
                      textAlign:  "left",
                      fontSize:   "var(--text-sm)",
                      color:      "#f85149",
                      background: "transparent",
                      border:     "none",
                      cursor:     "pointer",
                      borderTop:  "1px solid var(--border)",
                      transition: "background 120ms ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,81,73,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>↪</span> Abmelden
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>

        <div style={{ padding: "var(--space-8)" }}>
          {children}
        </div>
      </main>

    </div>
  )
}
