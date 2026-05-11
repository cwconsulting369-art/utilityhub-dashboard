'use client'

import { useEffect, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
      background: scrolled ? 'rgba(10, 12, 16, 0.85)' : 'transparent',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
          }}>UH</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.3px' }}>
            UtilityHub
          </span>
        </a>

        {/* Desktop nav links */}
        <nav style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
        }} aria-label="Hauptnavigation">
          <a href="#features" style={{ transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            Features
          </a>
          <a href="#how-it-works" style={{ transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            Wie es funktioniert
          </a>
          <a href="#stats" style={{ transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            Zahlen
          </a>
        </nav>

        {/* CTA */}
        <a href="#cta" style={{
          background: 'var(--accent)',
          color: '#fff',
          padding: '0.5rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'background 0.2s, transform 0.15s',
          display: 'inline-block',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent)'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          }}>
          Kostenlos starten
        </a>
      </div>
    </header>
  )
}
