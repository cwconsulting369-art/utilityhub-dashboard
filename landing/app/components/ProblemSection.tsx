'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const PAINS = [
  {
    n: '01',
    badge: { text: '+27 % Fernwärme 2024' },
    title: 'Explodierende Heizkosten',
    desc: 'Gas +15 %, Fernwärme +27 % — Heizkostensteigerungen treffen Verwaltungen ohne Puffer direkt. Jede Liegenschaft zahlt zu viel.',
  },
  {
    n: '02',
    badge: { text: 'bis 95 % CO₂-Kosten' },
    title: 'CO₂-Kostenlast trifft Vermieter',
    desc: 'Ohne energetische Optimierung tragen Vermieter bis zu 95 % der CO₂-Abgabe allein — Tendenz steigend mit dem CO₂-Preiskorridor 2026.',
  },
  {
    n: '03',
    badge: { text: '93 % fehlerhaft', urgent: true },
    title: 'Fehlerhafte Abrechnungen',
    desc: '93 % aller Heizkostenabrechnungen enthalten Fehler (Mineko, 34.000 Abrechnungen 2025). Jeder Fehler kostet Zeit und Vertrauen.',
  },
]

export default function ProblemSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      id="problem"
      ref={ref}
      aria-label="Das Problem"
      style={{
        padding: 'var(--section-padding-y) 0',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 'clamp(3rem, 6vw, 6rem)',
          alignItems: 'center',
        }}>
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="section-label">Das Problem</p>
            <h2 style={{
              fontSize: 'var(--font-size-h2)', fontWeight: 800,
              letterSpacing: '-0.03em', lineHeight: 1.15,
              marginBottom: '0.5rem',
            }}>
              Das kostet Hausverwaltungen täglich Geld.
            </h2>
            <p style={{
              fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
              marginBottom: '2.5rem', fontWeight: 500,
            }}>
              Verifizierte Daten. Kein Marketing.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {PAINS.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.1 + 0.1 * i, ease: [0.23, 1, 0.32, 1] }}
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                    borderLeft: '3px solid var(--color-accent)',
                  }}
                >
                  {/* Step number */}
                  <span style={{
                    flexShrink: 0,
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 800,
                    color: 'var(--color-accent)',
                    letterSpacing: '0.04em',
                    marginTop: '0.15rem',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {p.n}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      flexWrap: 'wrap', marginBottom: '0.4rem',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.title}</span>
                      <span style={{
                        background: p.badge.urgent
                          ? 'rgba(220,38,38,0.15)'
                          : 'var(--color-accent-dim)',
                        color: p.badge.urgent
                          ? '#f87171'
                          : 'var(--color-accent)',
                        border: `1px solid ${p.badge.urgent ? 'rgba(220,38,38,0.25)' : 'var(--color-border-accent)'}`,
                        borderRadius: 999,
                        padding: '0.12rem 0.6rem',
                        fontSize: '0.72rem', fontWeight: 700,
                        letterSpacing: '0.02em', whiteSpace: 'nowrap',
                      }}>
                        {p.badge.text}
                      </span>
                    </div>
                    <p style={{
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--font-size-sm)',
                      lineHeight: 1.65,
                    }}>
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <p style={{
              marginTop: '1.25rem', fontSize: '0.72rem',
              color: 'var(--color-text-subtle)', lineHeight: 1.5,
            }}>
              Quellen: DMB Betriebskostenspiegel 2024 · Heizspiegel Deutschland 2025 (co2online, 90.000+ Gebäude) · Mineko Abrechnungsanalyse 2025
            </p>
          </motion.div>

          {/* Right: Image slot */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              aspectRatio: '4 / 3',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Placeholder — replace with <Image src="/images/problem-inline.jpg" fill sizes="(max-width: 768px) 100vw, 50vw" alt="Hausverwalter bei komplexer Abrechnung" /> when Higgsfield image is ready */}
            <div style={{
              textAlign: 'center',
              color: 'var(--color-text-subtle)',
              fontSize: 'var(--font-size-sm)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--color-accent-dim)',
                border: '1px solid var(--color-border-accent)',
                margin: '0 auto 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem',
              }}>
                ↗
              </div>
              <p style={{ fontWeight: 600 }}>Bild-Slot: <code>problem-inline.jpg</code></p>
              <p style={{ fontSize: '0.72rem', marginTop: '0.25rem', opacity: 0.7 }}>1200 × 900 px via Higgsfield</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
