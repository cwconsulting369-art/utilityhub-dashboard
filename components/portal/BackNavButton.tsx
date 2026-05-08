"use client"

import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function BackNavButton() {
  const pathname = usePathname()
  const router   = useRouter()

  const segments = pathname.split("/").filter(Boolean)
  if (segments.length <= 2) return <div />

  return (
    <motion.button
      onClick={() => router.back()}
      whileHover={{ x: -2 }}
      transition={{ duration: 0.12 }}
      style={{
        display:     "flex",
        alignItems:  "center",
        gap:         "6px",
        background:  "transparent",
        border:      "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding:     "6px 14px",
        color:       "var(--text-muted)",
        fontSize:    "var(--text-sm)",
        cursor:      "pointer",
        fontWeight:  500,
        transition:  "border-color 150ms ease, color 150ms ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--primary-bright)"
        e.currentTarget.style.color = "var(--text)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border)"
        e.currentTarget.style.color = "var(--text-muted)"
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Zurück
    </motion.button>
  )
}
