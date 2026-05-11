'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

/* FAQ content — SEOGEO (LEN-119.B) provides schema.org markup for these */
const FAQS = [
  {
    q: 'Wie schnell sehe ich erste Einsparungen?',
    a: 'Nach dem Setup analysiert UtilityHub Ihre Liegenschaften innerhalb von 48 Stunden. Die erste Optimierungsempfehlung liegt in der Regel nach 3–5 Werktagen vor. Messbare Einsparungen zeigen sich mit dem nächsten Abrechnungszeitraum.',
  },
  {
    q: 'Muss ich bestehende Verträge kündigen?',
    a: 'Nein. UtilityHub prüft zunächst alle laufenden Verträge auf Optimierungspotenzial. Wenn ein Wechsel sinnvoll ist, übernehmen wir Kündigung und Neuanmeldung vollständig — Sie müssen nur einmalig freigeben.',
  },
  {
    q: 'Für wie viele Liegenschaften eignet sich UtilityHub?',
    a: 'UtilityHub ist für Hausverwaltungen mit 5 bis über 500 Liegenschaften konzipiert. Ob Einzelobjekte, Wohnungseigentümergemeinschaften oder große Portfolios — alle Liegenschaften werden zentral verwaltet.',
  },
  {
    q: 'Wie läuft ein Tarifwechsel ab?',
    a: 'UtilityHub identifiziert den optimalen Tarif, erstellt den Wechselauftrag und legt ihn zur Freigabe vor. Nach Ihrer Zustimmung kümmern wir uns um alles: Kündigung beim alten Anbieter, Anmeldung beim neuen, Zählerübergabe. Kein Papierkram für Sie.',
  },
  {
    q: 'Sind meine Kundendaten DSGVO-sicher?',
    a: 'Ja. Alle Daten werden ausschließlich auf Servern in Deutschland gespeichert und verarbeitet. Wir arbeiten mit verschlüsselter Übertragung (TLS 1.3) und geben keine Daten an Dritte weiter. Vollständige DSGVO-Dokumentation auf Anfrage.',
  },
  {
    q: 'Was kostet UtilityHub?',
    a: 'Das Onboarding und die erste Analyse sind kostenlos. Das Preismodell orientiert sich an der Anzahl Ihrer Einheiten und der realisierten Ersparnis — Sie zahlen erst, wenn Sie sparen. Details erhalten Sie nach dem Erstgespräch.',
  },
]

export default function FAQAccordion() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const [active, setActive] = useState<number | null>(null)

  const toggle = (i: number) => setActive(v => v === i ? null : i)

  return (
    <section
      id="faq"
      ref={ref}
      aria-label="Häufige Fragen"
      style={{ padding: 'var(--section-padding-y) 0' }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 3.5rem' }}
        >
          <p style={{
            fontSize: 'var(--font-size-xs)', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-accent)', marginBottom: '0.6rem',
          }}>
            FAQ
          </p>
          <h2 style={{
            fontSize: 'var(--font-size-h2)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.2,
          }}>
            Häufige Fragen.
          </h2>
        </motion.div>

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.06 * i }}
              style={{
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={active === i}
                aria-controls={`faq-answer-${i}`}
                id={`faq-question-${i}`}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '1.25rem 0',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '1rem',
                  fontWeight: 700, fontSize: '1rem',
                  color: 'var(--color-text)',
                  minHeight: 56,
                  transition: 'color var(--transition-base)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text)')}
              >
                <span>{faq.q}</span>
                <motion.span
                  animate={{ rotate: active === i ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    flexShrink: 0, fontSize: '1rem',
                    color: 'var(--color-text-muted)',
                    display: 'block', lineHeight: 1,
                  }}
                  aria-hidden
                >
                  ▾
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {active === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{
                      padding: '0 0 1.25rem',
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--font-size-sm)', lineHeight: 1.75,
                    }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
