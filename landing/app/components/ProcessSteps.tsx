'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const STEPS = [
  {
    n: '01',
    title: 'Analyse',
    desc: 'Kostenlose Energiekosten-Analyse aller Ihrer Liegenschaften — vollautomatisch, in wenigen Minuten eingerichtet.',
  },
  {
    n: '02',
    title: 'Optimierung',
    desc: 'UtilityHub identifiziert Einsparpotenziale und verhandelt die besten Tarife mit 200+ Anbietern.',
  },
  {
    n: '03',
    title: 'Abschluss',
    desc: 'Sie genehmigen, wir wickeln alles ab. Kündigung, Neuanmeldung und Übergabe ohne Papierkram.',
  },
  {
    n: '04',
    title: 'Monitoring',
    desc: 'Laufende Überwachung aller Tarife und jährliche Re-Optimierung — Sie werden sofort informiert.',
  },
]

export default function ProcessSteps() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="process"
      ref={ref}
      aria-label="So funktioniert UtilityHub"
      style={{
        padding: 'var(--section-padding-y) 0',
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 4rem' }}
        >
          <p className="section-label">So funktioniert's</p>
          <h2 style={{
            fontSize: 'var(--font-size-h2)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem',
          }}>
            In 4 Schritten zur Ersparnis.
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
            Setup in unter 15 Minuten. Kein technisches Know-how erforderlich.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '1.25rem',
          position: 'relative',
        }}>
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.23, 1, 0.32, 1] }}
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1.75rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Ghost number — amber tint */}
              <div aria-hidden style={{
                position: 'absolute', top: '-1rem', right: '0.5rem',
                fontSize: '6rem', fontWeight: 900,
                color: 'rgba(232,162,74,0.05)',
                lineHeight: 1, letterSpacing: '-0.05em',
                pointerEvents: 'none', userSelect: 'none',
              }}>
                {s.n}
              </div>

              {/* Step badge */}
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                background: 'var(--color-accent-dim)',
                border: '1px solid var(--color-border-accent)',
                color: 'var(--color-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--font-size-xs)', fontWeight: 800,
                marginBottom: '1.25rem', position: 'relative', zIndex: 1,
                letterSpacing: '0.02em',
              }}>
                {s.n}
              </div>

              <h3 style={{
                fontWeight: 700, fontSize: 'var(--font-size-h3)',
                letterSpacing: '-0.02em', marginBottom: '0.5rem',
                position: 'relative', zIndex: 1,
              }}>
                {s.title}
              </h3>
              <p style={{
                color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)',
                lineHeight: 1.65, position: 'relative', zIndex: 1,
              }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
