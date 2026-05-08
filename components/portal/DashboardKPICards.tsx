"use client"

import { motion } from "framer-motion"

interface KPICardsProps {
  stromCount:       number
  gasCount:         number
  orgFgFinanzCount: number
  totalObjects:     number
  totalLiefer:      number
  allOptimized:     boolean
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren:  0.07,
      delayChildren:    0.05,
    },
  },
}

const card = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

function KPICard({
  icon,
  color,
  bgColor,
  borderColor,
  label,
  count,
  sub,
}: {
  icon:        React.ReactNode
  color:       string
  bgColor:     string
  borderColor: string
  label:       string
  count:       number
  sub:         string
}) {
  return (
    <motion.div
      variants={card}
      whileHover={{
        scale: 1.018,
        borderColor: borderColor,
        boxShadow: `0 0 0 1px ${borderColor}, 0 8px 24px rgba(0,0,0,0.35)`,
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
      }}
      style={{
        background:    "var(--surface)",
        border:        "1px solid var(--border)",
        borderRadius:  "var(--radius-lg)",
        padding:       "var(--space-5) var(--space-6)",
        display:       "flex",
        flexDirection: "column",
        gap:           "var(--space-3)",
        cursor:        "default",
        willChange:    "transform",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width:          "36px",
            height:         "36px",
            borderRadius:   "var(--radius-md)",
            background:     bgColor,
            border:         `1px solid ${borderColor}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
        >
          {icon}
        </motion.div>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500 }}>
          {label}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color, lineHeight: 1, textAlign: "center" }}
      >
        {count.toLocaleString("de-DE")}
      </motion.div>

      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center" }}>{sub}</div>
    </motion.div>
  )
}

export function DashboardKPICards({
  stromCount,
  gasCount,
  orgFgFinanzCount,
  totalObjects,
  totalLiefer,
  allOptimized,
}: KPICardsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{
        display:               "grid",
        gridTemplateColumns:   "1fr 1fr 1fr 2fr",
        gap:                   "var(--space-4)",
        alignItems:            "stretch",
      }}
    >
      <KPICard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#58a6ff">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        }
        color="#58a6ff"
        bgColor="rgba(88,166,255,0.12)"
        borderColor="rgba(88,166,255,0.35)"
        label="Strom"
        count={stromCount}
        sub="Lieferstellen"
      />

      <KPICard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffa600">
            <path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z" />
          </svg>
        }
        color="#ffa600"
        bgColor="rgba(255,166,0,0.12)"
        borderColor="rgba(255,166,0,0.35)"
        label="Gas"
        count={gasCount}
        sub="Lieferstellen"
      />

      <KPICard
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#a78bfa">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        }
        color="#a78bfa"
        bgColor="rgba(167,139,250,0.12)"
        borderColor="rgba(167,139,250,0.35)"
        label="Versicherung"
        count={orgFgFinanzCount}
        sub="Objekte"
      />

      {/* Wide summary card */}
      <motion.div
        variants={card}
        whileHover={{
          scale: 1.012,
          borderColor: "rgba(63,185,80,0.35)",
          boxShadow: "0 0 0 1px rgba(63,185,80,0.25), 0 8px 24px rgba(0,0,0,0.35)",
          transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
        }}
        style={{
          background:    "var(--surface)",
          border:        "1px solid var(--border)",
          borderRadius:  "var(--radius-lg)",
          padding:       "var(--space-5) var(--space-6)",
          display:       "flex",
          flexDirection: "column",
          gap:           "var(--space-4)",
          willChange:    "transform",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "var(--text-3xl)", fontWeight: 800, lineHeight: 1 }}
          >
            {totalObjects.toLocaleString("de-DE")}
          </motion.span>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Objekte</span>
          <span style={{ color: "var(--border)" }}>|</span>
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "var(--text-3xl)", fontWeight: 800, lineHeight: 1 }}
          >
            {totalLiefer.toLocaleString("de-DE")}
          </motion.span>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Lieferstellen</span>
        </div>

        <div style={{ fontSize: "var(--text-sm)", color: "#3fb950", fontWeight: 600, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4, type: "spring", bounce: 0.4 }}
            style={{ display: "inline-block" }}
          >
            ✓
          </motion.span>
          Alle koordiniert
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Alle Verträge optimiert {allOptimized ? "✓" : ""}
            </span>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: allOptimized ? "#3fb950" : "var(--text-muted)" }}>
              {allOptimized ? "100%" : "0%"}
            </span>
          </div>
          <div style={{ height: "6px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: allOptimized ? "100%" : "0%" }}
              transition={{ delay: 0.6, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height:     "100%",
                background: "linear-gradient(90deg, #3fb950, #58a6ff)",
                borderRadius: "999px",
              }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
