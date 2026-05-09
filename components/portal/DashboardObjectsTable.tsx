"use client"

import { motion } from "framer-motion"
import { getStreet } from "@/lib/customers/format"

interface TelesonRecord {
  energie:         string | null
  neuer_versorger: string | null
  neu_ap:          number | null
  status:          string | null
  malo:            string | null
  zaehlernummer:   string | null
  created_at:      string | null
}

interface ObjectRow {
  id:              string
  full_name:       string
  status:          string
  object_type:     string | null
  city:            string | null
  postal_code:     string | null
  teleson_records: TelesonRecord[] | null
}

const tableContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const rowVariant = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

function HoverRow({ children, href, isLast }: { children: React.ReactNode; href: string; isLast: boolean }) {
  return (
    <motion.tr
      variants={rowVariant}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
      transition={{ duration: 0.12 }}
      style={{
        borderBottom: !isLast ? "1px solid var(--border)" : undefined,
        cursor: "pointer",
      }}
    >
      {children}
    </motion.tr>
  )
}

export function DashboardObjectsTable({ objects }: { objects: ObjectRow[] }) {
  if (objects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: "var(--space-10)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}
      >
        Keine Objekte vorhanden.
      </motion.div>
    )
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "2%" }} />
          </colgroup>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Objekt", "Adresse", "Strom-Tarif", "Gas-Tarif", "Status", "Zählernummer", ""].map(h => (
              <th key={h} style={{
                padding:    "var(--space-3) var(--space-4)",
                textAlign:  "left",
                fontWeight: 500,
                color:      "var(--text-muted)",
                fontSize:   "var(--text-xs)",
                whiteSpace: "nowrap",
                overflow:   "hidden",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={tableContainer} initial="hidden" animate="show">
          {objects.map((row, idx) => {
            const recs     = row.teleson_records ?? []
            const stromRec = recs.find(r => r.energie?.toLowerCase() === "strom") ?? null
            const gasRec   = recs.find(r => r.energie?.toLowerCase() === "gas")   ?? null
            const malo     = recs.map(r => r.zaehlernummer).find(Boolean) ?? null
            const addr     = [row.postal_code, row.city].filter(Boolean).join(" ") || null
            const href     = `/portal/objects/${row.id}`
            const isActive = row.status === "active"

            return (
              <HoverRow key={row.id} href={href} isLast={idx === objects.length - 1}>
                <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                  <a href={href} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none", color: "inherit" }}>
                    <div style={{
                      width:          "40px",
                      height:         "40px",
                      borderRadius:   "var(--radius-md)",
                      background:     "rgba(88,166,255,0.08)",
                      border:         "1px solid var(--border)",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      flexShrink:     0,
                      color:          "#58a6ff",
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21V12h6v9"/>
                      </svg>
                    </div>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>
                      {getStreet(row.full_name)}
                    </span>
                  </a>
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}>
                  {addr ? (
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.4 }}>
                      {row.postal_code && <span>{row.postal_code}</span>}
                      {row.city        && <span>{row.city}</span>}
                    </div>
                  ) : <span style={{ opacity: 0.4 }}>—</span>}
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                  {stromRec?.neuer_versorger ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#58a6ff" }}>{stromRec.neuer_versorger}</span>
                      {stromRec.neu_ap != null && (
                        <span style={{ fontSize: "10px", color: "#58a6ff", opacity: 0.8 }}>
                          {stromRec.neu_ap.toLocaleString("de-DE")} ct/kWh
                        </span>
                      )}
                    </div>
                  ) : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>}
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                  {gasRec?.neuer_versorger ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#ffa600" }}>{gasRec.neuer_versorger}</span>
                      {gasRec.neu_ap != null && (
                        <span style={{ fontSize: "10px", color: "#ffa600", opacity: 0.8 }}>
                          {gasRec.neu_ap.toLocaleString("de-DE")} ct/kWh
                        </span>
                      )}
                    </div>
                  ) : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>}
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                  <span style={{
                    display:        "inline-flex",
                    alignItems:     "center",
                    gap:            "5px",
                    background:     isActive ? "rgba(88,166,255,0.12)" : "rgba(139,148,158,0.12)",
                    color:          isActive ? "#58a6ff" : "var(--text-muted)",
                    border:         `1px solid ${isActive ? "rgba(88,166,255,0.3)" : "var(--border)"}`,
                    borderRadius:   "999px",
                    padding:        "2px 10px",
                    fontSize:       "var(--text-xs)",
                    fontWeight:     600,
                  }}>
                    {isActive && (
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#58a6ff", flexShrink: 0 }} />
                    )}
                    {isActive ? "Aktiv" : row.status}
                  </span>
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                  {malo ? (
                    <span style={{ fontFamily: "monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {malo}
                    </span>
                  ) : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>}
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right" }}>
                  <a href={href} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "var(--text-base)", transition: "color 150ms ease" }}>
                    ›
                  </a>
                </td>
              </HoverRow>
            )
          })}
        </motion.tbody>
      </table>
    </div>
  )
}
