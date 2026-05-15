"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

/* ── Types ── */

interface NavItem { href: string; label: string; icon?: string }

interface PortalNavProps {
  items:          NavItem[]
  user: {
    name:   string
    email:  string
    avatar?: string
    role?:   string
  }
  portalType:     "admin" | "portal"
  sidebarBottom?: React.ReactNode
  searchApiPath?: string
  children:       React.ReactNode
}

/* ── Constants ── */

const HEADER_H      = 64
const SIDEBAR_W     = 240

/* ── Framer-motion ── */

const TRANSITION_DEFAULT = { duration: 0.25, ease: [0.16, 1, 0.3, 1] }

const slideIn = {
  initial: { x: -SIDEBAR_W, opacity: 0 },
  animate: { x: 0,        opacity: 1 },
  exit:    { x: -SIDEBAR_W, opacity: 0 },
  transition: TRANSITION_DEFAULT,
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.2 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.95, y: -4 },
  transition: { duration: 0.18 },
}

/* ── Component ── */

export default function PortalNav({
  items,
  user,
  portalType,
  sidebarBottom,
  children,
}: PortalNavProps) {

  /* ── state ── */

  const [mobileMenu,      setMobileMenu]      = useState(false)
  const [profileDropdown, setProfileDropdown]  = useState(false)
  const dropRef           = useRef<HTMLDivElement>(null)
  const btnRef            = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileDropdown(false)
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setMobileMenu(prev => !prev)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        profileDropdown &&
        dropRef.current &&
        !dropRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setProfileDropdown(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [profileDropdown])

  useEffect(() => {
    setMobileMenu(false)
    setProfileDropdown(false)
  }, [])

  /* ── helpers ── */

  const isActive = (href: string) => {
    if (typeof window === "undefined") return false
    return window.location.pathname.startsWith(href)
  }

  /* ── avatar helpers ── */

  const initials =
    user.name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const avatarColor = (() => {
    const hash = user.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    const hue  = hash % 360
    return `hsl(${hue} 50% 50%)`
  })()

  /* ═══════════ JSX ═══════════ */

  return (
    <>

      {/* ── Sticky top header ── */}
      <header
        style={{
          position:       "sticky",
          top:            0,
          zIndex:         30,
          height:         HEADER_H,
          background:     "rgba(11,17,32,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom:   "1px solid var(--border)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "0 20px",
        }}
      >
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          style={{
            display:       "none",
            background:    "none",
            border:        "none",
            color:         "var(--text)",
            cursor:        "pointer",
            padding:       8,
            ["@media (max-width: 1023px)" as any]: { display: "flex" },
          }}
          aria-label="Menü"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <Link href={`/${portalType}/dashboard`} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, #3b82f6, #60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, letterSpacing: "-0.5px", color: "#fff", flexShrink: 0 }}>
            UH
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.2, whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: 300, letterSpacing: "0.04em" }}>UTILITY</span>
            <span style={{ color: "var(--accent)" }}>HUB</span>
          </div>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Bell */}
          <button style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", cursor: "pointer", transition: "150ms" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          {/* Help */}
          <button style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", cursor: "pointer", transition: "150ms" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>

          {/* Profile button */}
          <button
            ref={btnRef}
            onClick={() => setProfileDropdown(!profileDropdown)}
            style={{
              display:        "flex",
              alignItems:     "center",
              gap:            8,
              background:     "transparent",
              border:         "1px solid var(--border)",
              borderRadius:   "var(--radius-sm)",
              color:          "var(--text)",
              cursor:         "pointer",
              padding:        "4px 12px 4px 4px",
              transition:     "150ms",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#fff", flexShrink: 0 }}>
              {initials}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Profile dropdown ── */}
      <AnimatePresence>
        {profileDropdown && (
          <motion.div
            ref={dropRef}
            {...scaleIn}
            style={{
              position:       "fixed",
              top:            HEADER_H + 8,
              right:          12,
              zIndex:         40,
              width:          260,
              background:     "rgba(17,24,39,0.95)",
              backdropFilter: "blur(20px)",
              border:         "1px solid var(--border)",
              borderRadius:   "var(--radius-lg)",
              padding:        "var(--space-4)",
              boxShadow:      "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: "var(--space-2)" }}>
              <button style={{ width: "100%", textAlign: "left", padding: "8px 12px", background: "transparent", border: "none", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", transition: "150ms" }}>Profil</button>
              <button style={{ width: "100%", textAlign: "left", padding: "8px 12px", background: "transparent", border: "none", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", transition: "150ms" }}>Einstellungen</button>
              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
              <form action="/logout" method="post">
                <button type="submit" style={{ width: "100%", textAlign: "left", padding: "8px 12px", background: "transparent", border: "none", borderRadius: "var(--radius-sm)", color: "#ef4444", fontSize: 13, cursor: "pointer", transition: "150ms" }}>Abmelden</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ Layout ═══════════ */}

      <div
        style={{
          display:    "flex",
          flex:       1,
          minHeight:  "100dvh",
          position:   "relative",
        }}
      >
        {/* ── Desktop sidebar ── */}
        <aside
          style={{
            position:       "sticky",
            top:            0,
            width:          SIDEBAR_W,
            height:         "100dvh",
            background:     "var(--bg-elevated)",
            borderRight:    "1px solid var(--border)",
            display:        "flex",
            flexDirection:  "column",
            zIndex:         20,
            ["@media (max-width: 1023px)" as any]: { display: "none" },
          }}
        >
          {/* Spacer for header */}
          <div style={{ height: HEADER_H, flexShrink: 0 }} />

          {/* Nav items */}
          <nav style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    gap:            14,
                    padding:        "12px 16px",
                    borderRadius:   "var(--radius-sm)",
                    textDecoration: "none",
                    color:          active ? "var(--accent)" : "var(--text-muted)",
                    background:     active ? "var(--accent-dim)" : "transparent",
                    borderLeft:     active ? "2px solid var(--accent)" : "2px solid transparent",
                    fontSize:       14,
                    fontWeight:     500,
                    transition:     "150ms",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"
                      ;(e.currentTarget as HTMLElement).style.color = "var(--text)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent"
                      ;(e.currentTarget as HTMLElement).style.color = "var(--text-muted)"
                    }
                  }}
                >
                  <span style={{ width: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "var(--accent-dim)", color: "var(--accent)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </nav>

          {/* Push to bottom */}
          <div style={{ flex: "1 1 0", minHeight: 0 }} />

          {/* Upload area — pinned to bottom */}
          {sidebarBottom && (
            <div style={{ padding: "var(--space-3)", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              {sidebarBottom}
            </div>
          )}
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        <AnimatePresence>
          {mobileMenu && (
            <>
              <motion.div
                {...fadeIn}
                onClick={() => setMobileMenu(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 30 }}
              />
              <motion.aside
                {...slideIn}
                style={{
                  position:       "fixed",
                  top:            0,
                  bottom:         0,
                  left:           0,
                  width:          SIDEBAR_W,
                  background:     "var(--bg-elevated)",
                  borderRight:    "1px solid var(--border)",
                  zIndex:         40,
                  display:        "flex",
                  flexDirection:  "column",
                  paddingTop:     HEADER_H,
                }}
              >
                <nav style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: 2 }}>
                  {items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenu(false)}
                        style={{
                          display:        "flex",
                          alignItems:     "center",
                          gap:            14,
                          padding:        "12px 16px",
                          borderRadius:   "var(--radius-sm)",
                          textDecoration: "none",
                          color:          active ? "var(--accent)" : "var(--text-muted)",
                          background:     active ? "var(--accent-dim)" : "transparent",
                          fontSize:       14,
                          fontWeight:     500,
                        }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
                <div style={{ flex: 1 }} />
                {sidebarBottom && (
                  <div style={{ padding: "var(--space-3)", borderTop: "1px solid var(--border)" }}>
                    {sidebarBottom}
                  </div>
                )}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <div
          style={{
            flex:          1,
            display:       "flex",
            flexDirection: "column",
            minHeight:     0,
            overflow:      "hidden",
          }}
        >
          {/* Spacer for sticky header */}
          <div style={{ height: 0 }} />

          <div style={{ flex: 1, overflow: "hidden" }}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
