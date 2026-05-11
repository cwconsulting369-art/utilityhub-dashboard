'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { label: 'Features', href: '#solution' },
  { label: 'Wie es funktioniert', href: '#process' },
  { label: 'Ergebnisse', href: '#kpi' },
  { label: 'FAQ', href: '#faq' },
]

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 'var(--z-nav)' as unknown as number,
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
        background: scrolled ? 'rgba(12,12,14,0.92)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? 'var(--color-border)' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: 64,
        }}>
          {/* Logo */}
          <a href="#" aria-label="UtilityHub — Startseite" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--color-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 800,
              color: '#0C0C0E', letterSpacing: '-0.5px',
              flexShrink: 0,
            }}>UH</span>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>
              UtilityHub
            </span>
          </a>

          {/* Desktop nav */}
          <nav aria-label="Hauptnavigation" style={{
            display: 'flex', gap: '1.75rem', alignItems: 'center',
            fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
          }} className="desktop-nav">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}
                style={{ transition: 'color var(--transition-base)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                {l.label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a href="#cta" className="btn-primary" style={{
              padding: '0.5rem 1.25rem',
              fontSize: 'var(--font-size-sm)',
              minHeight: 40,
              boxShadow: 'none',
            }}>
              Jetzt starten
            </a>

            <button
              aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
              className="hamburger"
              style={{
                width: 44, height: 44,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '10px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{
                display: 'block', width: 18, height: 1.5,
                background: 'var(--color-text)',
                transition: 'transform 0.25s',
                transform: menuOpen ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none',
              }} />
              <span style={{
                display: 'block', width: 18, height: 1.5,
                background: 'var(--color-text)',
                transition: 'opacity 0.25s',
                opacity: menuOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block', width: 18, height: 1.5,
                background: 'var(--color-text)',
                transition: 'transform 0.25s',
                transform: menuOpen ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none',
              }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
              background: 'rgba(12,12,14,0.98)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 99,
              display: 'flex', flexDirection: 'column',
              padding: '2rem var(--container-padding)',
              gap: '0.5rem',
              overflowY: 'auto',
            }}
          >
            {NAV_LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '1rem 0',
                  fontSize: '1.25rem', fontWeight: 700,
                  color: 'var(--color-text)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {l.label}
              </motion.a>
            ))}
            <a href="#cta" onClick={() => setMenuOpen(false)} className="btn-primary" style={{
              marginTop: '1.5rem', width: '100%',
              justifyContent: 'center', fontSize: '1rem',
              minHeight: 56,
            }}>
              Jetzt starten
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hamburger { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
