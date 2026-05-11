'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Automatischer Tarifvergleich',
    desc: 'Echtzeit-Vergleich mit über 200 Energieanbietern — täglich aktualisiert, für jede Liegenschaft individuell.',
  },
  {
    icon: '📈',
    title: 'Verbrauchsanalyse',
    desc: 'Detaillierte Auswertungen pro Liegenschaft, Zähler und Zeitraum. Anomalien werden automatisch erkannt.',
  },
  {
    icon: '🌱',
    title: 'CO₂-Reporting',
    desc: 'ESG-konformes Reporting für Ihre Liegenschaften — auf Knopfdruck, PDF-ready für Eigentümer und Behörden.',
  },
  {
    icon: '🏠',
    title: 'Zentrales Dashboard',
    desc: 'Alle Liegenschaften, alle Verträge, alle Zählerstände auf einen Blick. Kein Tab-Switching mehr.',
  },
  {
    icon: '🔄',
    title: 'Automatische Optimierung',
    desc: 'Tarifwechsel mit Ihrer Freigabe — UtilityHub kümmert sich um Kündigung, Anmeldung und Übergabe.',
  },
  {
    icon: '🔔',
    title: 'Smarte Alerts',
    desc: 'Preisanstieg erkannt? Günstigerer Tarif verfügbar? Sie werden sofort informiert — per E-Mail oder Push.',
  },
]

export default function FeaturesSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="features"
      ref={ref}
      aria-label="Features"
      style={{ padding: 'var(--section-pad) 0' }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 4.5rem' }}
        >
          <p style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '0.75rem',
          }}>
            Was UtilityHub leistet
          </p>
          <h2 style={{
            fontSize: 'clamp(1.9rem, 4vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: '1rem',
          }}>
            Alles, was eine moderne Hausverwaltung braucht.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Gebaut für Verwaltungen mit 5 bis 500 Liegenschaften.
            Kein Technik-Know-how erforderlich.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.25rem',
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.07 * i }}
              whileHover={{ y: -3, borderColor: 'rgba(58,111,216,0.3)' }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1.75rem',
                display: 'flex',
                gap: '1.1rem',
                alignItems: 'flex-start',
                transition: 'border-color 0.25s',
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--accent-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '-0.015em',
                  marginBottom: '0.4rem',
                }}>
                  {f.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
