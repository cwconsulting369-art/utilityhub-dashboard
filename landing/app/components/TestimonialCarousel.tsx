'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import TestimonialCard, { type Testimonial } from './TestimonialCard'

/* TODO: Replace with real customer quotes when available */
const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Wir verwalten 340 Einheiten in Bayern. Vorher habe ich jährlich Wochen damit verbracht, Energieanbieter zu vergleichen. UtilityHub hat das vollständig von meinem Schreibtisch genommen — und wir sparen seitdem deutlich mehr als vorher.',
    name: 'Thomas K.',
    role: 'Geschäftsführer',
    company: 'Hausverwaltung Mitte GmbH',
    initials: 'TK',
  },
  {
    quote: 'Die CO₂-Berichte allein haben uns drei Monate Arbeit gespart. Eigentümer fragen immer öfter nach ESG-Nachweisen — UtilityHub liefert die auf Knopfdruck.',
    name: 'Sandra W.',
    role: 'Prokuristin',
    company: 'Immobilienservice Nord',
    initials: 'SW',
  },
  {
    quote: 'Setup in einem Nachmittag erledigt. Innerhalb von 48 Stunden hatten wir die erste Optimierungs-Empfehlung. Nie wieder zurück zum manuellen Tarifvergleich.',
    name: 'Marcus B.',
    role: 'Leiter Technik',
    company: 'Stadtwerk Verwaltungen AG',
    initials: 'MB',
  },
]

export default function TestimonialCarousel() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const [active, setActive] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [paused, setPaused] = useState(false)

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!paused) {
      timerRef.current = setInterval(() => {
        setActive(v => (v + 1) % TESTIMONIALS.length)
      }, 5000)
    }
  }

  useEffect(() => {
    if (!paused) {
      timerRef.current = setInterval(() => {
        setActive(v => (v + 1) % TESTIMONIALS.length)
      }, 5000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused])

  const go = (idx: number) => {
    setActive(idx)
    resetTimer()
  }

  return (
    <section
      id="testimonials"
      ref={ref}
      aria-label="Kundenstimmen"
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
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 3.5rem' }}
        >
          <p style={{
            fontSize: 'var(--font-size-xs)', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-accent)', marginBottom: '0.6rem',
          }}>
            Kundenstimmen
          </p>
          <h2 style={{
            fontSize: 'var(--font-size-h2)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.2,
          }}>
            Was Hausverwaltungen sagen.
          </h2>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{ position: 'relative', minHeight: 300 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              style={{ maxWidth: 680, margin: '0 auto' }}
            >
              <TestimonialCard testimonial={TESTIMONIALS[active]} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Dots */}
        <div
          role="tablist"
          aria-label="Testimonial auswählen"
          style={{
            display: 'flex', justifyContent: 'center',
            gap: '0.625rem', marginTop: '1.75rem',
          }}
        >
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => go(i)}
              style={{
                minWidth: 44, minHeight: 44,
                padding: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{
                display: 'block',
                width: i === active ? 24 : 8,
                height: 8, borderRadius: 999,
                background: i === active ? 'var(--color-accent)' : 'var(--color-border)',
                transition: 'width 0.3s, background 0.3s',
              }} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
