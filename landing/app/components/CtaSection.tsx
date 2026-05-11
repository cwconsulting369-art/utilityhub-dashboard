'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const UNIT_OPTIONS = [
  { value: '', label: 'Anzahl Einheiten wählen…' },
  { value: '<50', label: 'Unter 50 Einheiten' },
  { value: '50-200', label: '50–200 Einheiten' },
  { value: '200-500', label: '200–500 Einheiten' },
  { value: '500+', label: 'Über 500 Einheiten' },
]

const TRUST_ITEMS = [
  'Keine Kreditkarte erforderlich',
  'Setup in unter 15 Minuten',
  'Keine Mindestvertragslaufzeit',
  'DSGVO-konform · Daten in Deutschland',
]

export default function CTASection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', units: '' })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    /* TODO: Wire up to backend / Calendly when Carlos confirms endpoint */
    setSubmitted(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text)', fontSize: '1rem',
    fontFamily: 'inherit', outline: 'none',
    minHeight: 48, transition: 'border-color var(--transition-base)',
  }

  return (
    <section
      id="cta"
      ref={ref}
      aria-label="Zugang anfragen"
      style={{
        padding: 'var(--section-padding-y) 0',
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Subtle warm ambient */}
      <div aria-hidden style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 'clamp(300px, 50vw, 600px)',
        height: 'clamp(300px, 50vw, 600px)',
        background: 'radial-gradient(ellipse, rgba(232,162,74,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
          gap: 'clamp(2.5rem, 5vw, 5rem)',
          alignItems: 'center',
        }}>
          {/* Left: Text + trust list */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="section-label">Beratungsgespräch buchen</p>
            <h2 style={{
              fontSize: 'var(--font-size-h2)', fontWeight: 800,
              letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.25rem',
            }}>
              Bereit für weniger Energiekosten?
            </h2>
            <p style={{
              color: 'var(--color-text-muted)', fontSize: '1rem',
              lineHeight: 1.75, marginBottom: '2rem',
            }}>
              Tragen Sie Ihre Daten ein. Wir melden uns innerhalb von 24 Stunden
              mit Ihrer persönlichen Erstanalyse — kostenlos, unverbindlich.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {TRUST_ITEMS.map((item, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
                }}>
                  <span style={{
                    color: 'var(--color-accent)', fontWeight: 700, flexShrink: 0,
                    fontSize: '0.8rem',
                  }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Form card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border-accent)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(1.75rem, 3vw, 2.5rem)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ease: [0.23, 1, 0.32, 1] }}
                style={{ textAlign: 'center', padding: '2rem 0' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--color-accent-dim)',
                  border: '1px solid var(--color-border-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.5rem', color: 'var(--color-accent)',
                }}>
                  ✓
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Anfrage erhalten!
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  Wir melden uns innerhalb von 24 Stunden.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  Jetzt Zugang anfragen
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label htmlFor="cta-name" className="sr-only">Name</label>
                    <input id="cta-name" type="text" required placeholder="Ihr Name"
                      value={form.name} onChange={set('name')} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} />
                  </div>
                  <div>
                    <label htmlFor="cta-company" className="sr-only">Unternehmen</label>
                    <input id="cta-company" type="text" required placeholder="Unternehmen"
                      value={form.company} onChange={set('company')} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} />
                  </div>
                </div>
                <label htmlFor="cta-email" className="sr-only">E-Mail</label>
                <input id="cta-email" type="email" required placeholder="E-Mail-Adresse"
                  value={form.email} onChange={set('email')} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} />
                <label htmlFor="cta-phone" className="sr-only">Telefon (optional)</label>
                <input id="cta-phone" type="tel" placeholder="Telefon (optional)"
                  value={form.phone} onChange={set('phone')} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} />
                <label htmlFor="cta-units" className="sr-only">Anzahl Einheiten</label>
                <select id="cta-units" required value={form.units} onChange={set('units')}
                  style={{ ...inputStyle, color: form.units ? 'var(--color-text)' : 'var(--color-text-subtle)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}>
                  {UNIT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value} style={{ background: '#131315' }}>{o.label}</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary" style={{
                  width: '100%', justifyContent: 'center',
                  marginTop: '0.25rem', minHeight: 52,
                }}>
                  Zugang anfragen — kostenlos
                </button>
                <p style={{
                  fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)',
                  textAlign: 'center', lineHeight: 1.5,
                }}>
                  Kein Abo. Kein Risiko. Jederzeit kündbar.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
