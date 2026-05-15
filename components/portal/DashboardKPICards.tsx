"use client"

import { motion } from "framer-motion"

interface KPICardsProps {
  stromCount: number
  gasCount: number
  orgFgFinanzCount: number
  totalObjects: number
  totalLiefer: number
  allOptimized: boolean
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
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

/* ── Icon circle helper (matches admin) ── */
function IconCircle({
  children,
  bgColor,
  borderColor,
}: {
  children: React.ReactNode
  bgColor: string
  borderColor: string
}) {
  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: bgColor,
        border: `1px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

/* ── Single KPI Card (Cards 1–3) ── */
function SingleKPICard({
  icon,
  bgColor,
  borderColor,
  label,
  count,
  sub,
}: {
  icon: React.ReactNode
  bgColor: string
  borderColor: string
  label: string
  count: number
  sub: string
}) {
  return (
    <motion.div
      variants={card}
      whileHover={{
        scale: 1.018,
        borderColor: "var(--border-accent)",
        boxShadow: "var(--shadow-md)",
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
      }}
      className="card"
      style={{
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4) var(--space-4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--space-2)",
        cursor: "default",
        willChange: "transform",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <IconCircle bgColor={bgColor} borderColor={borderColor}>
            {icon}
          </IconCircle>
        </motion.div>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
          {label}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "32px",
          fontWeight: 400,
          color: "var(--text-bright)",
          lineHeight: 1,
          textAlign: "center",
          alignSelf: "center",
        }}
      >
        {count.toLocaleString("de-DE")}
      </motion.div>

      <div style={{ fontSize: "11px", color: "var(--text-faint)", textAlign: "center", alignSelf: "center" }}>
        {sub}
      </div>
    </motion.div>
  )
}

/* ── Summary Card (Card 4, wide) ── */
function SummaryCard({
  totalObjects,
  totalLiefer,
  allOptimized,
}: {
  totalObjects: number
  totalLiefer: number
  allOptimized: boolean
}) {
  return (
    <motion.div
      variants={card}
      whileHover={{
        scale: 1.012,
        borderColor: "rgba(59,130,246,0.35)",
        boxShadow: "0 0 0 1px rgba(59,130,246,0.25), 0 8px 24px rgba(0,0,0,0.35)",
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
      }}
      style={{
        background: "var(--surface)",
        border: "1px solid rgba(59,130,246,0.10)",
        borderLeft: "3px solid #3b82f6",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4) var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        justifyContent: "center",
        willChange: "transform",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.28, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "24px",
            fontWeight: 400,
            lineHeight: 1,
            color: "var(--text-bright)",
          }}
        >
          {totalObjects.toLocaleString("de-DE")}
        </motion.span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Objekte</span>
        <span style={{ color: "var(--border-subtle)" }}>|</span>
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "24px",
            fontWeight: 400,
            lineHeight: 1,
            color: "var(--text-bright)",
          }}
        >
          {totalLiefer.toLocaleString("de-DE")}
        </motion.span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Lieferstellen</span>
      </div>

      <div
        style={{
          fontSize: "var(--text-xs)",
          color: "#58a6ff",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-1)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Alle koordiniert
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>
            Alle Verträge optimiert
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: allOptimized ? "#58a6ff" : "var(--text-faint)",
            }}
          >
            {allOptimized ? "100%" : "0%"}
          </span>
        </div>
        <div
          style={{
            height: "4px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: allOptimized ? "100%" : "0%" }}
            transition={{ delay: 0.6, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
              borderRadius: "999px",
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main exported component ── */
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
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1.8fr",
        gap: "var(--space-4)",
        alignItems: "stretch",
      }}
    >
      {/* Card 1: Strom */}
      <SingleKPICard
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        }
        bgColor="rgba(88,166,255,0.10)"
        borderColor="rgba(88,166,255,0.25)"
        label="Strom"
        count={stromCount}
        sub="Lieferstellen"
      />

      {/* Card 2: Gas */}
      <SingleKPICard
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        }
        bgColor="rgba(245,158,11,0.10)"
        borderColor="rgba(245,158,11,0.25)"
        label="Gas"
        count={gasCount}
        sub="Lieferstellen"
      />

      {/* Card 3: Versicherung */}
      <SingleKPICard
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        }
        bgColor="rgba(139,92,246,0.10)"
        borderColor="rgba(139,92,246,0.25)"
        label="Versicherung"
        count={orgFgFinanzCount}
        sub="Objekte"
      />

      {/* Card 4: Summary (wide) */}
      <SummaryCard
        totalObjects={totalObjects}
        totalLiefer={totalLiefer}
        allOptimized={allOptimized}
      />
    </motion.div>
  )
}
