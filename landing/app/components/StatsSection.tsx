'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

/*
 * PLACEHOLDER — Replace values + labels when LEN-119.A (RESEARCHER) delivers:
 *   - Trust-Stats (Einsparpotenzial, Marktgröße, CO₂-Zahlen, etc.)
 *   - Pain-Point-Statistiken für Visualisierung
 * Keys prefixed with TODO_ mark placeholder content.
 */
const STATS = [
  {
    value: 'TODO_%',       /* LEN-119.A: avg. savings % */
    suffix: '',
    label: 'Durchschnittliche Energiekostensenkung',
    sub: 'gegenüber bestehenden Tarifen',        /* LEN-119.A */
  },
  {
    value: 'TODO_k+',      /* LEN-119.A: active properties count */
    suffix: '',
    label: 'Liegenschaften aktiv optimiert',
    sub: 'bundesweit',                           /* LEN-119.A */
  },
  {
    value: 'TODO_t',       /* LEN-119.A: CO₂ saved */
    suffix: '',
    label: 'Tonnen CO₂ eingespart',
    sub: 'im laufenden Jahr',                    /* LEN-119.A */
  },
  {
    value: 'TODO_min',     /* LEN-119.A or UX: setup time */
    suffix: '',
    label: 'Minuten bis zur ersten Analyse',
    sub: 'kein langer Onboarding-Prozess',       /* LEN-119.A */
  },
]

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="stats"
      ref={ref}
      aria-label="Kennzahlen"
      style={{
        padding: 'var(--section-pad) 0',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: 540, margin: '0 auto 4rem' }}
        >
          <p style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '0.75rem',
          }}>
            Vertrauen in Zahlen
          </p>
          <h2 style={{
            fontSize: 'clamp(1.9rem, 4vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}>
            Messbarer Erfolg für Hausverwaltungen.
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              style={{
                background: 'var(--bg-card)',
                padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: 'var(--accent)',
                lineHeight: 1,
                marginBottom: '0.5rem',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {s.value}{s.suffix}
              </div>
              <div style={{
                fontWeight: 700,
                fontSize: '0.92rem',
                marginBottom: '0.25rem',
                color: 'var(--text)',
              }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                {s.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
