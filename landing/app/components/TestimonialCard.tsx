'use client'

export interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  initials: string
}

interface Props {
  testimonial: Testimonial
}

export default function TestimonialCard({ testimonial: t }: Props) {
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border-accent)',
      borderRadius: 'var(--radius-lg)',
      padding: 'clamp(1.75rem, 3vw, 2.5rem)',
      height: '100%',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
    }}>
      {/* Stars */}
      <div style={{ color: 'var(--color-accent)', fontSize: '0.9rem', letterSpacing: '2px' }}>
        ★★★★★
      </div>

      {/* Quote */}
      <blockquote style={{
        flex: 1,
        fontSize: '1rem', lineHeight: 1.75,
        color: 'var(--color-text)',
        fontStyle: 'italic',
        margin: 0,
      }}>
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Avatar placeholder — replace with <Image> when portrait photos from Higgsfield arrive */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--color-accent-dim)',
          border: '1px solid var(--color-border-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-accent)',
          flexShrink: 0,
        }}>
          {t.initials}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', lineHeight: 1.3 }}>{t.name}</p>
          <p style={{
            fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.3,
          }}>
            {t.role} · {t.company}
          </p>
        </div>
      </div>
    </div>
  )
}
