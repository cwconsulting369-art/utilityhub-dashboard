"use client"

import { motion } from "framer-motion"

export function FgFinanzContent() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
      >
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>FG Finanz</h1>
        <span style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
          color: "#ffa600", background: "rgba(255,166,0,0.1)",
          border: "1px solid rgba(255,166,0,0.3)", borderRadius: "var(--radius-sm)", padding: "1px 7px",
        }}>BALD</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-16) var(--space-12)",
          textAlign: "center", color: "var(--text-muted)", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -60%)",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(255,166,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatType: "loop" }}
          style={{
            width: "64px", height: "64px", borderRadius: "var(--radius-lg)",
            background: "rgba(255,166,0,0.12)", border: "1px solid rgba(255,166,0,0.25)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: "var(--space-6)", color: "#ffa600",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
            <line x1="10" y1="14" x2="14" y2="14"/>
          </svg>
        </motion.div>

        <div style={{ fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--text)" }}>
          FG Finanz-Daten werden in Kürze verfügbar
        </div>

        <p style={{ fontSize: "var(--text-sm)", maxWidth: "420px", margin: "0 auto var(--space-8)", lineHeight: 1.6 }}>
          Hier sehen Sie demnächst Verträge, Provisionen und Auszahlungen Ihrer Hausverwaltung — gebündelt und übersichtlich.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-6)", flexWrap: "wrap" }}>
          {[
            {
              label: "Vertragsübersicht",
              color: "#58a6ff",
              bg: "rgba(88,166,255,0.1)",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="3" y1="15" x2="21" y2="15"/>
                  <line x1="9" y1="9" x2="9" y2="21"/>
                </svg>
              ),
            },
            {
              label: "Provisionen",
              color: "#ffa600",
              bg: "rgba(255,166,0,0.1)",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v2m0 8v2M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1 2-2.5 2.5S9.5 15 9.5 16"/>
                </svg>
              ),
            },
            {
              label: "Auszahlungen",
              color: "#3fb950",
              bg: "rgba(63,185,80,0.1)",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              ),
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)",
                padding: "var(--space-4) var(--space-5)",
                background: "var(--surface-2)", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", minWidth: "120px",
              }}
            >
              <div style={{
                width: "36px", height: "36px", borderRadius: "var(--radius-md)",
                background: item.bg, display: "flex", alignItems: "center", justifyContent: "center",
                color: item.color,
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
