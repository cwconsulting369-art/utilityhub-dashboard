"use client"

import { motion } from "framer-motion"

interface DocumentRowProps {
  mLabel:      string
  mColor:      string
  displayName: string
  fileName:    string
  description: string | null
  sizeLabel:   string
  dateLabel:   string
  docId:       string
}

export function DocumentRow({ mLabel, mColor, displayName, fileName, description, sizeLabel, dateLabel, docId }: DocumentRowProps) {
  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
      transition={{ duration: 0.12 }}
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        "var(--space-4)",
        padding:    "var(--space-3) var(--space-6)",
        borderTop:  "1px solid var(--border)",
        fontSize:   "var(--text-sm)",
      }}
    >
      <span style={{
        background:   `${mColor}20`,
        color:        mColor,
        border:       `1px solid ${mColor}44`,
        borderRadius: "var(--radius-sm)",
        padding:      "1px 6px",
        fontSize:     "10px",
        fontWeight:   600,
        flexShrink:   0,
      }}>{mLabel}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName}
        </div>
        {description?.trim() && description.trim() !== fileName && (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            {fileName}
          </div>
        )}
      </div>

      <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap", flexShrink: 0 }}>
        {sizeLabel} · {dateLabel}
      </span>

      <motion.a
        href={`/api/documents/${docId}`}
        target="_blank"
        rel="noreferrer"
        whileHover={{ scale: 1.05, color: "#3fb950" }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        style={{
          color:          "#3fb950",
          textDecoration: "none",
          fontSize:       "var(--text-sm)",
          fontWeight:     600,
          whiteSpace:     "nowrap",
          flexShrink:     0,
          display:        "inline-flex",
          alignItems:     "center",
          gap:            "3px",
        }}
      >
        Öffnen ↗
      </motion.a>
    </motion.div>
  )
}
