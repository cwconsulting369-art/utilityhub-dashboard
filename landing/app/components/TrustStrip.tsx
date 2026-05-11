'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ITEMS = [
  { label: '150+', sub: 'Hausverwaltungen' },
  { label: 'Ø 28 %', sub: 'Kostenersparnis' },
  { label: '< 48 h', sub: 'bis zur ersten Optimierung' },
  { label: 'DSGVO', sub: 'Made in Germany' },
]

export default function TrustStrip() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <section
      ref={ref}
      aria-label="Vertrauens-Kennzahlen"
      style={{
        padding: '2rem 0',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
      }}
    >
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
          gap: '0.5rem',
        }}>
          {ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.08 * i, ease: [0.23, 1, 0.32, 1] }}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.15rem',
                padding: '0.75rem 0.5rem',
                borderRight: i < ITEMS.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <span style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--color-accent)',
                lineHeight: 1,
              }}>
                {item.label}
              </span>
              <span style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-subtle)',
                fontWeight: 500,
                textAlign: 'center',
                lineHeight: 1.3,
              }}>
                {item.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
