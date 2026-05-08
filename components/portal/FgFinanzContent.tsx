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
          style={{ fontSize: "3rem", marginBottom: "var(--space-6)", display: "inline-block" }}
        >
          💼
        </motion.div>

        <div style={{ fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--text)" }}>
          FG Finanz-Daten werden in Kürze verfügbar
        </div>

        <p style={{ fontSize: "var(--text-sm)", maxWidth: "420px", margin: "0 auto var(--space-8)", lineHeight: 1.6 }}>
          Hier sehen Sie demnächst Verträge, Provisionen und Auszahlungen Ihrer Hausverwaltung — gebündelt und übersichtlich.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-6)", flexWrap: "wrap" }}>
          {[
            { icon: "📊", label: "Vertragsübersicht" },
            { icon: "💰", label: "Provisionen" },
            { icon: "📈", label: "Auszahlungen" },
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
              <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
