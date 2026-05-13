"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { PortalSidebarUpload } from "./PortalSidebarUpload"
import { BackNavButton } from "@/components/portal/BackNavButton"
import GlobalSearch from "@/components/search/GlobalSearch"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  href:   string
  label:  string
  icon?:  string
  badge?: number
}

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
  children:       React.ReactNode
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const HEADER_H      = 56
const SIDEBAR_W     = 260
const BREAKPOINT_LG = 1024
const BREAKPOINT_MD = 768

const Z_HEADER      = 30
const Z_MOBILE_MENU = 40
const Z_DROPDOWN    = 50

/* ------------------------------------------------------------------ */
/*  Helper: map common icon names to Unicode symbols                   */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, string> = {
  dashboard:    "⊞",
  objects:      "◈",
  buildings:    "▣",
  users:        "○",
  settings:     "◇",
  documents:    "▤",
  tickets:      "▫",
  billing:      "◊",
  analytics:    "◉",
  messages:     "✉",
  home:         "⌂",
  calendar:     "◴",
  search:       "⌕",
  notifications:"⍾",
  help:         "?",
  logout:       "↩",
  profile:      "◐",
  upload:       "↑",
  download:     "↓",
  add:          "+",
  edit:         "✎",
  delete:       "✕",
  check:        "✓",
  close:        "✕",
  arrowRight:   "→",
  arrowLeft:    "←",
  arrowUp:      "↑",
  arrowDown:    "↓",
  menu:         "☰",
  more:         "⋯",
  filter:       "▿",
  sort:         "↕",
  star:         "★",
  heart:        "♥",
  flag:         "⚑",
  tag:          "🏷",
  folder:       "▣",
  file:         "▤",
  image:        "◙",
  video:        "▶",
  music:        "♪",
  link:         "∞",
  lock:         "🔒",
  unlock:       "🔓",
  eye:          "◉",
  eyeOff:       "◎",
  refresh:      "↻",
  sync:         "↺",
  cloud:        "☁",
  sun:          "☀",
  moon:         "☾",
}

function resolveIcon(icon?: string): string {
  if (!icon) return "●"
  if (icon in ICON_MAP) return ICON_MAP[icon]
  // If it's already a symbol (single char), use directly
  if (icon.length <= 2) return icon
  return "●"
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PortalNav({
  items,
  user,
  portalType,
  sidebarBottom,
  children,
}: PortalNavProps) {
  const pathname = usePathname()
  const router   = useRouter()

  /* ── State ──────────────────────────────────────────────────────── */
  const [profileOpen, setProfileOpen]     = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile]           = useState(false)
  const [isTablet, setIsTablet]           = useState(false)

  const profileRef  = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef  = useRef<HTMLButtonElement>(null)

  /* ── Responsive detection ───────────────────────────────────────── */
  useEffect(() => {
    function check() {
      const w = window.innerWidth
      setIsMobile(w < BREAKPOINT_LG)
      setIsTablet(w < BREAKPOINT_MD)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  /* ── Lock body scroll when mobile menu is open ──────────────────── */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  /* ── Click outside: profile dropdown ────────────────────────────── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /* ── Click outside: mobile menu ─────────────────────────────────── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [mobileMenuOpen])

  /* ── Keyboard shortcuts ─────────────────────────────────────────── */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Close profile dropdown on Escape
      if (e.key === "Escape") {
        setProfileOpen(false)
        setMobileMenuOpen(false)
      }
      // Toggle mobile menu with m key (when not typing in input)
      if (
        e.key === "m" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        setMobileMenuOpen(prev => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  /* ── Sign out ───────────────────────────────────────────────────── */
  const handleSignOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }, [router])

  /* ── Derive initials ────────────────────────────────────────────── */
  const initials = user.name
    ? user.name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user.email
      ? user.email[0].toUpperCase()
      : "U"

  /* ── Active check ───────────────────────────────────────────────── */
  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + "/"),
    [pathname]
  )

  /* ── Special case: change-password page ─────────────────────────── */
  if (pathname === "/portal/change-password") {
    return <>{children}</>
  }

  /* ── Shared styles ──────────────────────────────────────────────── */
  const headerStyle: React.CSSProperties = {
    position:              "sticky",
    top:                   0,
    zIndex:                Z_HEADER,
    height:                HEADER_H,
    background:            "rgba(11, 17, 32, 0.80)",
    backdropFilter:        "blur(16px)",
    WebkitBackdropFilter:  "blur(16px)",
    borderBottom:          "1px solid var(--border)",
    display:               "flex",
    alignItems:            "center",
    justifyContent:        "space-between",
    padding:               "0 var(--space-5)",
    flexShrink:            0,
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        minHeight:     "100dvh",
      }}
    >
      {/* ════════════════════════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════════════════════════ */}
      <header style={headerStyle}>
        {/* ── Left: Logo + Hamburger ────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          {/* Hamburger (mobile only) */}
          {isMobile && (
            <motion.button
              ref={hamburgerRef}
              onClick={() => setMobileMenuOpen((o) => !o)}
              whileTap={{ scale: 0.92 }}
              style={{
                width:          36,
                height:         36,
                borderRadius:   "var(--radius-sm)",
                background:     "transparent",
                border:         "1px solid var(--border)",
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                color:          "var(--text-muted)",
                flexShrink:     0,
                transition:     "all 150ms ease",
                fontSize:       16,
              }}
              whileHover={{
                backgroundColor: "var(--surface-hover)",
                borderColor:     "var(--border-accent)",
              }}
              aria-label="Menü öffnen"
            >
              <span style={{ display: "block", lineHeight: 1, marginTop: -2 }}>
                {mobileMenuOpen ? "✕" : "☰"}
              </span>
            </motion.button>
          )}

          {/* Logo */}
          <Link
            href={portalType === "admin" ? "/admin" : "/portal"}
            style={{
              display:        "flex",
              alignItems:     "center",
              gap:            "var(--space-2)",
              textDecoration: "none",
              flexShrink:     0,
            }}
          >
            {/* Logo Badge */}
            <div
              style={{
                width:           36,
                height:          36,
                borderRadius:    "var(--radius-md)",
                background:      "linear-gradient(135deg, #3b82f6, #60a5fa)",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                fontWeight:      800,
                fontSize:        13,
                letterSpacing:   "-0.5px",
                color:           "#fff",
                flexShrink:      0,
              }}
            >
              UH
            </div>

            {/* Logo Text */}
            <div
              style={{
                fontSize:     15,
                lineHeight:   1.2,
                whiteSpace:   "nowrap",
              }}
            >
              <span
                style={{
                  fontWeight:     300,
                  letterSpacing:  "0.04em",
                  color:          "var(--text)",
                }}
              >
                UTILITY
              </span>
              <span
                style={{
                  fontWeight:     700,
                  letterSpacing:  "0.04em",
                  color:          "var(--accent)",
                }}
              >
                HUB
              </span>
            </div>
          </Link>
        </div>

        {/* ── Center: Global Search ─────────────────────────────────── */}
        {!isTablet && (
          <div style={{ flex: 1, maxWidth: 480, margin: "0 var(--space-4)" }}>
            <GlobalSearch
              placeholder={
                portalType === "portal"
                  ? "Objekt suchen…"
                  : "Objekt oder Hausverwaltung suchen…"
              }
            />
          </div>
        )}

        {/* ── Right: Icon Buttons ───────────────────────────────────── */}
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        "var(--space-2)",
            flexShrink: 0,
          }}
        >
          {/* Notifications */}
          <motion.button
            whileHover={{
              backgroundColor: "var(--surface-hover)",
              borderColor:     "var(--border-accent)",
            }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            title="Benachrichtigungen"
            aria-label="Benachrichtigungen"
            style={iconButtonStyle}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </motion.button>

          {/* Help */}
          <motion.button
            whileHover={{
              backgroundColor: "var(--surface-hover)",
              borderColor:     "var(--border-accent)",
            }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            title="Hilfe"
            aria-label="Hilfe"
            style={iconButtonStyle}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </motion.button>

          {/* Profile */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <motion.button
              onClick={() => setProfileOpen((o) => !o)}
              title={user.name || user.email}
              whileHover={{
                backgroundColor: "var(--surface-hover)",
                borderColor:     "var(--border-accent)",
              }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.15 }}
              aria-label="Profilmenü"
              aria-expanded={profileOpen}
              style={{
                ...iconButtonStyle,
                overflow: "hidden",
              }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  style={{
                    width:        "100%",
                    height:       "100%",
                    objectFit:    "cover",
                    borderRadius: "inherit",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize:     12,
                    fontWeight:   600,
                    color:        "var(--text-muted)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {initials}
                </span>
              )}
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  style={profileDropdownStyle}
                >
                  {/* User Info */}
                  <div style={profileInfoStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      {/* Avatar in dropdown */}
                      <div
                        style={{
                          width:          32,
                          height:         32,
                          borderRadius:   "50%",
                          background:     "var(--surface)",
                          border:         "1px solid var(--border)",
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          flexShrink:     0,
                          overflow:       "hidden",
                        }}
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            style={{
                              width:     "100%",
                              height:    "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize:   11,
                              fontWeight: 600,
                              color:      "var(--text-muted)",
                            }}
                          >
                            {initials}
                          </span>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize:      13,
                            fontWeight:    500,
                            color:         "var(--text)",
                            lineHeight:    1.3,
                            whiteSpace:    "nowrap",
                            overflow:      "hidden",
                            textOverflow:  "ellipsis",
                          }}
                        >
                          {user.name}
                        </div>
                        <div
                          style={{
                            fontSize:   11,
                            color:      "var(--text-muted)",
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            overflow:   "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {user.role || user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings Link */}
                  <Link
                    href={
                      portalType === "admin" ? "/admin/settings" : "/portal/settings"
                    }
                    onClick={() => setProfileOpen(false)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--surface-hover)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent"
                    }}
                  >
                    <span
                      style={{
                        fontSize:   14,
                        lineHeight: 1,
                        color:      "var(--text-muted)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </span>
                    Einstellungen
                  </Link>

                  {/* Divider */}
                  <div
                    style={{
                      height:     1,
                      background: "var(--border)",
                      margin:     "2px 0",
                    }}
                  />

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    style={{
                      ...dropdownItemStyle,
                      color: "#f85149",
                      width: "100%",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(248, 81, 73, 0.08)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent"
                    }}
                  >
                    <span
                      style={{
                        fontSize:   14,
                        lineHeight: 1,
                        color:      "#f85149",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </span>
                    Abmelden
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          BODY: Sidebar + Main
          ════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display:    "flex",
          flex:       1,
          minHeight:  0,
          position:   "relative",
        }}
      >
        {/* ── Sidebar (desktop always visible, mobile as overlay) ───── */}
        <AnimatePresence initial={false}>
          {(!isMobile || mobileMenuOpen) && (
            <>
              {/* Mobile: dark backdrop */}
              {isMobile && mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    position:   "fixed",
                    inset:      0,
                    background: "rgba(0, 0, 0, 0.5)",
                    zIndex:     Z_MOBILE_MENU - 1,
                  }}
                />
              )}

              <motion.aside
                ref={isMobile ? mobileMenuRef : undefined}
                initial={isMobile ? { x: -SIDEBAR_W } : false}
                animate={{ x: 0 }}
                exit={isMobile ? { x: -SIDEBAR_W } : undefined}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width:           SIDEBAR_W,
                  flexShrink:      0,
                  background:      "var(--bg-elevated)",
                  borderRight:     "1px solid var(--border)",
                  display:         "flex",
                  flexDirection:   "column",
                  position:        isMobile ? "fixed" : "sticky",
                  top:             isMobile ? 0 : HEADER_H,
                  left:            0,
                  height:          isMobile ? "100dvh" : `calc(100dvh - ${HEADER_H}px)`,
                  zIndex:          isMobile ? Z_MOBILE_MENU : 1,
                  overflowY:       "auto",
                  overflowX:       "hidden",
                }}
              >
                {/* Mobile: close button at top */}
                {isMobile && (
                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "flex-end",
                      padding:        "var(--space-3) var(--space-4)",
                      borderBottom:   "1px solid var(--border)",
                      flexShrink:     0,
                    }}
                  >
                    <motion.button
                      onClick={() => setMobileMenuOpen(false)}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        width:          32,
                        height:         32,
                        borderRadius:   "var(--radius-sm)",
                        background:     "transparent",
                        border:         "1px solid var(--border)",
                        cursor:         "pointer",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        color:          "var(--text-muted)",
                        fontSize:       14,
                        transition:     "all 150ms ease",
                      }}
                      whileHover={{
                        backgroundColor: "var(--surface-hover)",
                        borderColor:     "var(--border-accent)",
                      }}
                      aria-label="Menü schließen"
                    >
                      <span style={{ display: "block", lineHeight: 1, marginTop: -1 }}>✕</span>
                    </motion.button>
                  </div>
                )}

                {/* ── Navigation ────────────────────────────────────── */}
                <nav
                  style={{
                    padding:        "var(--space-3)",
                    display:        "flex",
                    flexDirection:  "column",
                    gap:            2,
                    flex:           1,
                  }}
                >
                  {items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          if (isMobile) setMobileMenuOpen(false)
                        }}
                        style={{ textDecoration: "none" }}
                      >
                        <motion.div
                          layout
                          whileTap={{ scale: 0.98 }}
                          transition={{
                            layout:   { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                            default:  { duration: 0.15 },
                          }}
                          style={{
                            display:        "flex",
                            alignItems:     "center",
                            gap:            12,
                            padding:        "10px 16px",
                            borderRadius:   "var(--radius-sm)",
                            fontSize:       13,
                            fontWeight:     active ? 600 : 500,
                            color:          active ? "var(--accent)" : "var(--text-muted)",
                            background:     active ? "var(--accent-dim)" : "transparent",
                            borderLeft:     active
                              ? "2px solid var(--accent)"
                              : "2px solid transparent",
                            position:       "relative",
                            overflow:       "hidden",
                            cursor:         "pointer",
                            transition:     "all 150ms ease",
                            userSelect:     "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!active) {
                              e.currentTarget.style.background = "var(--surface-hover)"
                              e.currentTarget.style.color = "var(--text)"
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!active) {
                              e.currentTarget.style.background = "transparent"
                              e.currentTarget.style.color = "var(--text-muted)"
                            }
                          }}
                        >
                          {/* Active background with layoutId */}
                          {active && (
                            <motion.div
                              layoutId="nav-active-indicator"
                              transition={{
                                duration: 0.25,
                                ease:     [0.16, 1, 0.3, 1],
                              }}
                              style={{
                                position:       "absolute",
                                inset:          0,
                                borderRadius:   "var(--radius-sm)",
                                background:     "var(--accent-dim)",
                                zIndex:         0,
                              }}
                            />
                          )}

                          {/* Icon */}
                          <span
                            style={{
                              fontSize:     18,
                              lineHeight:   1,
                              position:     "relative",
                              zIndex:       1,
                              flexShrink:   0,
                              width:        18,
                              textAlign:    "center",
                              display:      "inline-flex",
                              alignItems:   "center",
                              justifyContent: "center",
                            }}
                          >
                            {resolveIcon(item.icon)}
                          </span>

                          {/* Label */}
                          <span
                            style={{
                              flex:         1,
                              position:     "relative",
                              zIndex:       1,
                              whiteSpace:   "nowrap",
                              overflow:     "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.label}
                          </span>

                          {/* Badge */}
                          {item.badge != null && item.badge > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type:   "spring",
                                bounce: 0.4,
                              }}
                              style={{
                                background:     "var(--accent)",
                                color:          "#fff",
                                borderRadius:   "999px",
                                padding:        "1px 7px",
                                fontSize:       10,
                                fontWeight:     700,
                                minWidth:       18,
                                textAlign:      "center",
                                lineHeight:     "14px",
                                position:       "relative",
                                zIndex:         1,
                                flexShrink:     0,
                              }}
                            >
                              {item.badge > 99 ? "99+" : item.badge}
                            </motion.span>
                          )}
                        </motion.div>
                      </Link>
                    )
                  })}

                  {/* Push content to bottom */}
                  <div style={{ flex: 1, minHeight: "var(--space-2)" }} />

                  {/* Sidebar bottom slot (if provided) */}
                  {sidebarBottom && (
                    <div
                      style={{
                        padding:      "var(--space-3) 0",
                        borderTop:    "1px solid var(--border)",
                      }}
                    >
                      {sidebarBottom}
                    </div>
                  )}

                  {/* Portal upload widget */}
                  {portalType === "portal" && (
                    <div
                      style={{
                        padding:      "var(--space-3) 0",
                        borderTop:    "1px solid var(--border)",
                      }}
                    >
                      <PortalSidebarUpload />
                    </div>
                  )}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ──────────────────────────────────────────── */}
        <main
          style={{
            flex:           1,
            overflowY:      "auto",
            display:        "flex",
            flexDirection:  "column",
            minWidth:       0,
          }}
        >
          {/* Back nav strip */}
          <div
            style={{
              padding:        "var(--space-3) var(--space-6)",
              borderBottom:   "1px solid var(--border)",
              background:     "var(--bg)",
              position:       "sticky",
              top:            0,
              zIndex:         10,
            }}
          >
            <BackNavButton />
          </div>

          {/* Page content */}
          <div
            style={{
              padding:    "var(--space-6) var(--space-6) var(--space-8)",
              flex:       1,
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared style objects                                               */
/* ------------------------------------------------------------------ */

const iconButtonStyle: React.CSSProperties = {
  width:              36,
  height:             36,
  borderRadius:       "50%",
  background:         "transparent",
  border:             "1px solid var(--border)",
  cursor:             "pointer",
  display:            "flex",
  alignItems:         "center",
  justifyContent:     "center",
  color:              "var(--text-muted)",
  flexShrink:         0,
  transition:         "all 150ms ease",
  padding:            0,
}

const profileDropdownStyle: React.CSSProperties = {
  position:               "absolute",
  right:                  0,
  top:                    "calc(100% + 8px)",
  background:             "rgba(11, 17, 32, 0.95)",
  backdropFilter:         "blur(24px)",
  WebkitBackdropFilter:   "blur(24px)",
  border:                 "1px solid var(--border)",
  borderRadius:           "var(--radius-md)",
  overflow:               "hidden",
  minWidth:               200,
  zIndex:                 Z_DROPDOWN,
  boxShadow:              "0 8px 32px rgba(0, 0, 0, 0.4)",
  transformOrigin:        "top right",
  padding:                "var(--space-1) 0",
}

const profileInfoStyle: React.CSSProperties = {
  padding:      "var(--space-3) var(--space-4)",
  borderBottom: "1px solid var(--border)",
}

const dropdownItemStyle: React.CSSProperties = {
  display:        "flex",
  alignItems:     "center",
  gap:            "var(--space-2)",
  padding:        "8px var(--space-4)",
  fontSize:       13,
  fontWeight:     500,
  color:          "var(--text)",
  textDecoration: "none",
  background:     "transparent",
  transition:     "background 150ms ease",
  lineHeight:     1.5,
}
