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

/* ── Data ── */

const kpiMeta = [
  {
    icon: (
      <IconCircle bgColor="rgba(88,166,255,0.10)" borderColor="rgba(88,166,255,0.25)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </IconCircle>
    ),
    label: "Strom-Lieferstellen",
    sub:   "Lieferstellen",
  },
  {
    icon: (
      <IconCircle bgColor="rgba(245,158,11,0.10)" borderColor="rgba(245,158,11,0.25)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      </IconCircle>
    ),
    label: "Gas-Lieferstellen",
    sub:   "Lieferstellen",
  },
  {
    icon: (
      <IconCircle bgColor="rgba(139,92,246,0.10)" borderColor="rgba(139,92,246,0.25)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </IconCircle>
    ),
    label: "Versicherung",
    sub:   "Objekte",
  },
]

/* ── Component ── */

export function DashboardKPICards({
  stromCount, gasCount, orgFgFinanzCount, totalObjects, totalLiefer, allOptimized,
}: KPICardsProps) {
  const counts = [stromCount, gasCount, orgFgFinanzCount]

  return (
    <div className="kpi-grid">
      {/* 3 KPI cards */}
      {kpiMeta.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          className="card kpi-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="kpi-header">
            {kpi.icon}
            <span className="kpi-label">{kpi.label}</span>
          </div>
          <motion.div
            className="kpi-number"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {counts[i].toLocaleString("de-DE")}
          </motion.div>
          <div className="kpi-sub">{kpi.sub}</div>
        </motion.div>
      ))}

      {/* Summary card (wide) */}
      <motion.div
        className="card summary-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.21, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="summary-bar" />

        <div className="summary-counts">
          <motion.span
            className="summary-num"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.30, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {totalObjects.toLocaleString("de-DE")}
          </motion.span>
          <span className="summary-label">Objekte</span>
          <span className="summary-sep">|</span>
          <motion.span
            className="summary-num"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {totalLiefer.toLocaleString("de-DE")}
          </motion.span>
          <span className="summary-label">Lieferstellen</span>
        </div>

        <div className="summary-check">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Alle koordiniert
        </div>

        <div className="progress-wrap">
          <div className="progress-labels">
            <span>Alle Verträge optimiert</span>
            <span>{allOptimized ? "100%" : "0%"}</span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: "0%" }}
              animate={{ width: allOptimized ? "100%" : "0%" }}
              transition={{ delay: 0.6, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Sub-components ── */

function IconCircle({ children, bgColor, borderColor }: { children: React.ReactNode; bgColor: string; borderColor: string }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: bgColor, border: `1px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </div>
  )
}
