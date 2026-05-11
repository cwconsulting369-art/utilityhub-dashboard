'use client'

import { motion } from 'framer-motion'

const ease = [0.23, 1, 0.32, 1] as const

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease },
})

const METRICS = [
  {
    value: 'Ø 28 %',
    label: 'Energiekosten gespart',
    sub: 'vs. bestehende Tarife',
    color: 'var(--color-accent)',
    border: 'rgba(232,162,74,0.22)',
    glow: 'rgba(232,162,74,0.08)',
    rotate: -2,
    delay: 0.45,
    pos: { top: '4%', left: '2%' },
  },
  {
    value: '3.200+',
    label: 'Liegenschaften optimiert',
    sub: 'bundesweit, alle Klassen',
    color: '#7ab3f5',
    border: 'rgba(122,179,245,0.2)',
    glow: 'rgba(122,179,245,0.07)',
    rotate: 1.5,
    delay: 0.58,
    pos: { top: '38%', right: '0%' },
  },
  {
    value: '15 Min',
    label: 'Setup-Zeit',
    sub: 'bis zur ersten Analyse',
    color: 'var(--color-lime)',
    border: 'rgba(132,204,22,0.2)',
    glow: 'rgba(132,204,22,0.07)',
    rotate: -1,
    delay: 0.7,
    pos: { bottom: '4%', left: '12%' },
  },
]

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Einstieg"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Structured dot-grid — masks to left side where text lives */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(232,162,74,0.10) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        maskImage: 'radial-gradient(ellipse 60% 80% at 15% 50%, black 10%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 80% at 15% 50%, black 10%, transparent 80%)',
      }} />

      {/* Corner depth — NOT centered orb */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, right: 0,
        width: '45%', height: '60%',
        background: 'radial-gradient(ellipse at 100% 100%, rgba(232,162,74,0.05) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      <div
        className="container"
        style={{ position: 'relative', zIndex: 2, width: '100%' }}
      >
        <div
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(2.5rem, 5vw, 5rem)',
            alignItems: 'center',
            paddingTop: 'calc(64px + clamp(2.5rem, 5vw, 4.5rem))',
            paddingBottom: 'clamp(3rem, 6vw, 5.5rem)',
          }}
        >
          {/* LEFT — Text */}
          <div>
            <motion.div {...fadeUp(0)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(232,162,74,0.08)',
              border: '1px solid rgba(232,162,74,0.2)',
              borderRadius: 999, padding: '0.28rem 0.85rem',
              fontSize: 'var(--font-size-xs)', fontWeight: 700,
              color: 'var(--color-accent)', letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: '1.75rem',
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--color-accent)', flexShrink: 0,
              }} />
              Automatisches Energiemanagement
            </motion.div>

            {/* H1 — Playfair Display serif for editorial weight */}
            <motion.h1 {...fadeUp(0.08)} style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-h1)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: 'var(--color-text)',
              marginBottom: '1.5rem',
            }}>
              Energiekosten{' '}
              <span style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>
                senken.
              </span>
              <br />
              Automatisch.
            </motion.h1>

            <motion.p {...fadeUp(0.15)} style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.8,
              maxWidth: 480,
              marginBottom: '2.5rem',
            }}>
              UtilityHub analysiert alle Liegenschaften und optimiert
              Strom-, Gas- und Wärmetarife automatisch — ohne Aufwand,
              ohne Vertragsrisiko, mit messbaren Ergebnissen ab Tag&nbsp;1.
            </motion.p>

            <motion.div {...fadeUp(0.22)} style={{
              display: 'flex', gap: '0.75rem',
              flexWrap: 'wrap', marginBottom: '2.5rem',
            }}>
              <a href="#cta" className="btn-primary">
                Beratungsgespräch buchen
              </a>
              <a href="#process" className="btn-ghost">
                Wie es funktioniert →
              </a>
            </motion.div>

            <motion.div {...fadeUp(0.3)} style={{
              display: 'flex', alignItems: 'center',
              gap: '0.6rem', flexWrap: 'wrap',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-subtle)',
            }}>
              {['DSGVO-konform', 'Kein Vertragsrisiko', 'Made in Germany'].map((t, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ color: 'var(--color-lime)', fontWeight: 700 }}>✓</span>
                  <span style={{ fontWeight: 600 }}>{t}</span>
                  {i < 2 && <span style={{ opacity: 0.3 }}>·</span>}
                </span>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Floating metric cards */}
          <div
            className="hero-visual"
            style={{
              position: 'relative',
              height: 'clamp(340px, 48vh, 480px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {METRICS.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.88, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: m.rotate }}
                transition={{ duration: 0.52, delay: m.delay, ease }}
                style={{
                  position: 'absolute',
                  ...m.pos,
                  background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, ${m.glow} 100%)`,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: `1px solid ${m.border}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 'clamp(1.1rem, 2vw, 1.5rem)',
                  minWidth: 'clamp(165px, 18vw, 210px)',
                  boxShadow: `0 8px 32px ${m.glow}, 0 1px 0 rgba(255,255,255,0.06) inset`,
                }}
              >
                <div style={{
                  fontSize: 'clamp(1.6rem, 2.8vw, 2.25rem)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: m.color,
                  lineHeight: 1,
                  marginBottom: '0.35rem',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {m.value}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.2rem',
                }}>
                  {m.label}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: 'var(--color-text-subtle)',
                }}>
                  {m.sub}
                </div>
              </motion.div>
            ))}

            {/* Central concentric ring — structural depth, no orb */}
            <div aria-hidden style={{
              width: 'clamp(120px, 15vw, 180px)',
              height: 'clamp(120px, 15vw, 180px)',
              borderRadius: '50%',
              border: '1px solid rgba(232,162,74,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '70%', height: '70%',
                borderRadius: '50%',
                border: '1px solid rgba(232,162,74,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '55%', height: '55%',
                  borderRadius: '50%',
                  background: 'rgba(232,162,74,0.08)',
                  border: '1px solid rgba(232,162,74,0.22)',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
