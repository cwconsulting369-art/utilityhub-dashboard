'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const FEATURES = [
  { title: 'Automatische Tarifanalyse', desc: 'Täglich aktualisierter Vergleich von 200+ Anbietern — je Liegenschaft, je Energieträger.' },
  { title: 'Anbieterwechsel ohne Aufwand', desc: 'Kündigung, Neuanmeldung, Übergabe — alles mit Ihrer Freigabe in einem Klick.' },
  { title: 'Echtzeit-Verbrauchsmonitoring', desc: 'Anomalien erkennen, Einsparpotenziale visualisieren, Benchmarks pro Liegenschaft.' },
  { title: 'Individuelle Reports', desc: 'ESG-konforme Berichte für Eigentümer und Behörden — auf Knopfdruck, PDF-ready.' },
]

export default function SolutionSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="solution"
      ref={ref}
      aria-label="Die Lösung"
      style={{ padding: 'var(--section-padding-y) 0' }}
    >
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 'clamp(2rem, 5vw, 5rem)',
          alignItems: 'center',
        }}>
          {/* Left: Image placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              aspectRatio: '16 / 9',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-accent)',
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              order: 0,
            }}
          >
            {/* Placeholder — replace with <Image src="/images/solution-inline.jpg" fill sizes="(max-width: 768px) 100vw, 50vw" alt="UtilityHub Dashboard mit Energiedaten" /> */}
            <div style={{
              textAlign: 'center',
              color: 'var(--color-text-subtle)',
              fontSize: 'var(--font-size-sm)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: 'var(--color-accent-dim)',
                border: '1px solid var(--color-border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', color: 'var(--color-accent)',
                margin: '0 auto 0.75rem',
              }}>↗</div>
              <p>Bild-Slot: <code>solution-inline.jpg</code></p>
              <p style={{ fontSize: '0.72rem', marginTop: '0.25rem' }}>1920 × 1080 px via Higgsfield</p>
            </div>
          </motion.div>

          {/* Right: Text + features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{ order: 1 }}
          >
            <p style={{
              fontSize: 'var(--font-size-xs)', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-accent)', marginBottom: '0.6rem',
            }}>
              Die Lösung
            </p>
            <h2 style={{
              fontSize: 'var(--font-size-h2)', fontWeight: 800,
              letterSpacing: '-0.03em', lineHeight: 1.2,
              marginBottom: '1rem',
            }}>
              UtilityHub übernimmt das komplette Energiemanagement.
            </h2>
            <p style={{
              color: 'var(--color-text-muted)', fontSize: '1rem',
              lineHeight: 1.75, marginBottom: '2rem',
            }}>
              Eine Plattform für alle Liegenschaften. Kein Wechsel von Tool zu Tool.
              Kein Aufwand für Ihr Team.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '0.875rem',
            }}>
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + 0.08 * i, ease: 'easeOut' }}
                  whileHover={{ y: -3, borderColor: 'var(--color-border-accent-hover)' }}
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border-accent)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    transition: 'border-color var(--transition-base)',
                  }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--color-accent)', marginBottom: '0.75rem',
                  }} />
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{f.title}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #solution .container > div > div:first-child { order: 0 !important; }
          #solution .container > div > div:last-child { order: 1 !important; }
        }
      `}</style>
    </section>
  )
}
