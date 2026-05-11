'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import KPICard from './KPICard'

const KPIS = [
  { value: 28,  prefix: 'Ø', unit: '%',  label: 'Durchschnittliche Kostenersparnis',     decimals: 0 },
  { value: 150, unit: '+',               label: 'Hausverwaltungen vertrauen UtilityHub', decimals: 0 },
  { value: 48,  unit: 'h',               label: 'Bis zur ersten Optimierung',             decimals: 0 },
  { value: 2.4, unit: 'M€',              label: 'Gesamt gespartes Kundenbudget',          decimals: 1 },
]

export default function KPIGrid() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="kpi"
      ref={ref}
      aria-label="Ergebnisse in Zahlen"
      style={{
        padding: 'var(--section-padding-y) 0',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 3.5rem' }}
        >
          <p className="section-label">Ergebnisse in Zahlen</p>
          <h2 style={{
            fontSize: 'var(--font-size-h2)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.15,
          }}>
            Messbarer Erfolg für Hausverwaltungen.
          </h2>
        </motion.div>

        {/* Open number grid — no card boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {KPIS.map((k, i) => (
            <KPICard
              key={i}
              {...k}
              delay={0.08 * i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
