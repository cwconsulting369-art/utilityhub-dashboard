'use client'

const LINKS = {
  produkt: [
    { label: 'Features', href: '#solution' },
    { label: 'Wie es funktioniert', href: '#process' },
    { label: 'Ergebnisse', href: '#kpi' },
    { label: 'FAQ', href: '#faq' },
  ],
  unternehmen: [
    { label: 'Über uns', href: '#' },
    { label: 'Kontakt', href: 'mailto:hello@utility-hub.one' },
    { label: 'Dashboard Login', href: 'https://app.utility-hub.one' },
  ],
  legal: [
    { label: 'Impressum', href: '/impressum' },
    { label: 'Datenschutz', href: '/datenschutz' },
    { label: 'AGB', href: '/agb' },
  ],
}

export default function Footer() {
  const year = new Date().getFullYear()

  const linkStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
    display: 'block', padding: '0.25rem 0',
    transition: 'color var(--transition-base)',
  }

  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-bg)',
    }}>
      <div className="container" style={{ padding: 'clamp(3rem, 5vw, 5rem) var(--container-padding)' }}>
        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: 'clamp(2rem, 4vw, 4rem)',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <span style={{
                width: 30, height: 30, borderRadius: 7,
                background: 'var(--color-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 800, color: '#fff',
              }}>UH</span>
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>UtilityHub</span>
            </a>
            <p style={{
              fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
              lineHeight: 1.65, maxWidth: 200,
            }}>
              Automatisches Energiemanagement für Hausverwaltungen.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <p style={{
              fontWeight: 700, fontSize: 'var(--font-size-xs)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-text-subtle)', marginBottom: '0.875rem',
            }}>
              Produkt
            </p>
            <nav aria-label="Produkt-Links">
              {LINKS.produkt.map(l => (
                <a key={l.href} href={l.href} style={linkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Unternehmen */}
          <div>
            <p style={{
              fontWeight: 700, fontSize: 'var(--font-size-xs)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-text-subtle)', marginBottom: '0.875rem',
            }}>
              Unternehmen
            </p>
            <nav aria-label="Unternehmen-Links">
              {LINKS.unternehmen.map(l => (
                <a key={l.href} href={l.href} style={linkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <p style={{
              fontWeight: 700, fontSize: 'var(--font-size-xs)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-text-subtle)', marginBottom: '0.875rem',
            }}>
              Rechtliches
            </p>
            <nav aria-label="Rechtliche Links">
              {LINKS.legal.map(l => (
                <a key={l.href} href={l.href} style={linkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1.5rem',
          display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
            © {year} UtilityHub GmbH. Alle Rechte vorbehalten.
          </p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
            Made with ♥ in Deutschland
          </p>
        </div>
      </div>
    </footer>
  )
}
