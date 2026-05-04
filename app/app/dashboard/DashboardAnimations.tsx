"use client"

import { motion } from "framer-motion"
import type { CSSProperties, ReactNode } from "react"

const TRANSITION = { duration: 0.4, ease: "easeOut" } as const
const FADE_IN_INITIAL = { opacity: 0, y: 20 }
const FADE_IN_ANIMATE = { opacity: 1, y: 0 }

export function FadeInDiv({ children, index = 0, style }: {
  children: ReactNode
  index?:   number
  style?:   CSSProperties
}) {
  return (
    <motion.div
      initial={FADE_IN_INITIAL}
      animate={FADE_IN_ANIMATE}
      transition={{ ...TRANSITION, delay: index * 0.08 }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export function FadeInRow({ children, index = 0, style }: {
  children: ReactNode
  index?:   number
  style?:   CSSProperties
}) {
  return (
    <motion.tr
      initial={FADE_IN_INITIAL}
      animate={FADE_IN_ANIMATE}
      transition={{ ...TRANSITION, delay: index * 0.08 }}
      style={style}
    >
      {children}
    </motion.tr>
  )
}

export function FadeInLink({ children, href, index = 0, style }: {
  children: ReactNode
  href:     string
  index?:   number
  style?:   CSSProperties
}) {
  return (
    <motion.a
      href={href}
      initial={FADE_IN_INITIAL}
      animate={FADE_IN_ANIMATE}
      transition={{ ...TRANSITION, delay: index * 0.08 }}
      style={style}
    >
      {children}
    </motion.a>
  )
}

export function SlideInLeft({ children, style, delay = 0 }: {
  children: ReactNode
  style?:   CSSProperties
  delay?:   number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...TRANSITION, delay }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export function CoverageBar({ pct, color }: { pct: number; color: string }) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ ...TRANSITION, delay: 0.2 }}
      style={{
        height:       "100%",
        background:   pct > 0 ? color : "transparent",
        borderRadius: "3px",
      }}
    />
  )
}
