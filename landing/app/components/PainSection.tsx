'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

/* ─── Pain points — placeholders, LEN-119.A will refine ─── */
const PAINS = [
  {
    icon: '🏢',
    title: 'Zu viele Anbieter',
    desc: 'Strom, Gas, Fernwärme — jede Liegenschaft hat andere Verträge, andere Abrechnungszyklen, andere Ansprechpartner.',
  },
  {
    icon: '📊',
    title: 'Kein Überblick',
    desc: 'Welche Liegenschaft verbraucht wie viel? Wo liegt Einsparpotenzial? Ohne Vergleichsdaten ist das Raten.',
  },
  {
    icon: '⏱️',
    title: 'Keine Kapazität',
    desc: 'Tarifvergleiche kosten Stunden. Die meisten Verwaltungen haben weder Zeit noch internes Know-how dafür.',
  },
]

export default function PainSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="problem"
      ref={ref}
      aria-label="Herausforderungen"
      style={{
        padding: 'var(--section-pad) 0',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 4rem' }}
        >
          <p style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '0.75rem',
          }}>
            Das Problem
          </p>
          <h2 style={{
            fontSize: 'clamp(1.9rem, 4vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: '1rem',
          }}>
            Warum Energieoptimierung so schwer ist.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Hausverwaltungen verwalten Dutzende Liegenschaften — aber niemand hat Zeit,
            für jede den günstigsten Energietarif zu finden.
          </p>
        </motion.div>

        {/* Pain cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '1.25rem',
        }}>
          {PAINS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 * i }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '2rem 1.75rem',
                transition: 'border-color 0.25s, transform 0.25s',
              }}
              whileHover={{ y: -4, borderColor: 'rgba(58,111,216,0.3)' }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.25rem',
              }}>
                {p.icon}
              </div>
              <h3 style={{
                fontWeight: 700,
                fontSize: '1.1rem',
                marginBottom: '0.6rem',
                letterSpacing: '-0.02em',
              }}>
                {p.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7 }}>
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
