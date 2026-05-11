'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const STEPS = [
  {
    n: '01',
    title: 'Liegenschaften verbinden',
    desc: 'Verbinden Sie Ihre Liegenschaften per CSV-Import oder direktem Zählerdaten-Zugang. Einmalig, in wenigen Minuten.',
  },
  {
    n: '02',
    title: 'Potenziale analysieren',
    desc: 'UtilityHub analysiert Verbrauchsmuster und vergleicht Ihre aktuellen Tarife mit dem Markt — vollautomatisch.',
  },
  {
    n: '03',
    title: 'Automatisch optimieren',
    desc: 'Sie genehmigen, wir wechseln. Tarifoptimierung ohne Papierkram, ohne Risiko — und Sie behalten den Überblick.',
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="how-it-works"
      ref={ref}
      aria-label="Wie es funktioniert"
      style={{ padding: 'var(--section-pad) 0' }}
    >
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 4.5rem' }}
        >
          <p style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '0.75rem',
          }}>
            So funktioniert's
          </p>
          <h2 style={{
            fontSize: 'clamp(1.9rem, 4vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: '1rem',
          }}>
            In 3 Schritten zur Ersparnis.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Kein langer Onboarding-Prozess. Keine Vertragsfallen. Setup dauert
            unter 15 Minuten.
          </p>
        </motion.div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem',
          position: 'relative',
        }}>
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 * i }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '2.25rem 2rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Step number — large ghost */}
              <div aria-hidden style={{
                position: 'absolute',
                top: '-0.5rem',
                right: '1rem',
                fontSize: '6rem',
                fontWeight: 900,
                color: 'rgba(58,111,216,0.05)',
                lineHeight: 1,
                letterSpacing: '-0.05em',
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                {s.n}
              </div>

              {/* Step number — visible badge */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: 'var(--accent-dim)',
                border: '1px solid rgba(58,111,216,0.2)',
                color: '#7daef5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 800,
                marginBottom: '1.25rem',
                position: 'relative',
                zIndex: 1,
              }}>
                {s.n}
              </div>

              <h3 style={{
                fontWeight: 700,
                fontSize: '1.15rem',
                letterSpacing: '-0.02em',
                marginBottom: '0.7rem',
                position: 'relative',
                zIndex: 1,
              }}>
                {s.title}
              </h3>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.92rem',
                lineHeight: 1.7,
                position: 'relative',
                zIndex: 1,
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
