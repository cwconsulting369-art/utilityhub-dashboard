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

export function DashboardKPICards({
  stromCount, gasCount, orgFgFinanzCount, totalObjects, totalLiefer, allOptimized,
}: KPICardsProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1.5fr",
      gap: 12,
      height: "100%",
      minHeight: 0,
    }}>
      {/* Strom */}
      <div className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(88,166,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Strom</span>
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--text-bright)", lineHeight: 1 }}>
          {stromCount.toLocaleString("de-DE")}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Lieferstellen</div>
      </div>

      {/* Gas */}
      <div className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(245,158,11,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Gas</span>
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--text-bright)", lineHeight: 1 }}>
          {gasCount.toLocaleString("de-DE")}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Lieferstellen</div>
      </div>

      {/* Versicherung */}
      <div className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(139,92,246,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Versicherung</span>
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--text-bright)", lineHeight: 1 }}>
          {orgFgFinanzCount.toLocaleString("de-DE")}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Objekte</div>
      </div>

      {/* Summary */}
      <div className="card" style={{ padding: "14px 18px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, position: "relative", overflow: "hidden", borderLeft: "3px solid var(--accent)", minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--text-bright)", lineHeight: 1 }}>{totalObjects}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Objekte</span>
          <span style={{ color: "var(--border-subtle)" }}>|</span>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--text-bright)", lineHeight: 1 }}>{totalLiefer}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Lieferstellen</span>
        </div>

        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Alle koordiniert
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: "var(--text-faint)" }}>Alle Verträge optimiert</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: allOptimized ? "#58a6ff" : "var(--text-faint)" }}>{allOptimized ? "100%" : "0%"}</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: allOptimized ? "100%" : "0%" }}
              transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)", borderRadius: 999 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
