'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const WA_URL = 'https://wa.me/message/5GX3UQXT4OO6B1';

const faqItems = [
  {
    q: 'Brauche ich Erfahrung im Vertrieb?',
    a: 'Nein. Was zählt ist deine Kommunikationsstärke und dein Wille. Wir schulen dich komplett ein — von der ersten Ansprache bis zum abgeschlossenen Termin.',
  },
  {
    q: 'Wie viel kann ich verdienen?',
    a: 'Das hängt von deinem Einsatz ab. Einsteiger erreichen typisch 500–1.200 €/Monat. Nach 3 Monaten liegen unsere aktiven Setter bei 1.500–3.000 €. Top Performer verdienen 3.500 € und mehr.',
  },
  {
    q: 'Wie läuft die Bewerbung ab?',
    a: 'Nur eine kurze WhatsApp-Sprachnachricht. Kein Lebenslauf, kein Aufwand. Wir schätzen direkt ein, ob Tonalität und Ausdruck passen — und melden uns innerhalb von 24 h.',
  },
  {
    q: 'Wie viel Zeit muss ich investieren?',
    a: 'Das entscheidest du. Viele starten mit 10–15 Stunden pro Woche neben Job oder Studium. Wer Vollzeit setzt, hat natürlich höheres Ertragspotenzial.',
  },
  {
    q: 'Was wird mir gestellt?',
    a: 'CRM-System, Leadlisten, Gesprächsskripte und vollständiges Onboarding. Du brauchst nur Telefon und Internetzugang — und die Motivation.',
  },
  {
    q: 'Kann ich langfristig aufsteigen?',
    a: 'Ja. Wer konstant performt, bekommt Zugang zu besseren Leadlisten, Coaching und bei starker Leistung die Option auf eine Festanstellung.',
  },
];

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(to * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {count.toLocaleString('de-DE')}
      {suffix}
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: 'var(--bg)',
        border: `1px solid ${open ? 'rgba(58,111,216,0.4)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color var(--transition)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: 'var(--space-6)',
          gap: 'var(--space-4)',
        }}
      >
        <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, lineHeight: 1.4, flex: 1 }}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{ flexShrink: 0, color: 'var(--primary-bright)', marginTop: 2 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                padding: '0 var(--space-6) var(--space-6)',
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
} as const;

const WA_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--primary-bright)',
  marginBottom: 'var(--space-4)',
  display: 'block',
};

const H2_STYLE: React.CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  marginBottom: 'var(--space-4)',
};

export default function Home() {
  return (
    <>
      {/* ── NAV ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 var(--space-6)',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Utility<span style={{ color: 'var(--primary-bright)' }}>Hub</span>
          </span>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
            }}
          >
            Jetzt bewerben
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingBlock: 'clamp(5rem, 14vw, 10rem)',
          textAlign: 'center',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.18,
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-30%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 900,
            height: 900,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(58,111,216,0.11) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '0 var(--space-6)' }}>
          <motion.div
            {...reveal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '6px 16px',
              background: 'rgba(245,166,35,0.1)',
              border: '1px solid rgba(245,166,35,0.3)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: '#f5a623',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-8)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#f5a623',
                animation: 'pulse 2s infinite',
                display: 'block',
                flexShrink: 0,
              }}
            />
            Setter gesucht — Remote Freelancer
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.75rem, 2rem + 4vw, 6.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              marginBottom: 'var(--space-6)',
              maxWidth: '16ch',
              marginInline: 'auto',
            }}
          >
            B2B Setter{' '}
            <span style={{ color: 'var(--primary-bright)' }}>im Energie-Vertrieb</span>{' '}
            <span
              style={{
                display: 'block',
                fontWeight: 300,
                color: 'var(--text-muted)',
                fontSize: '0.55em',
                letterSpacing: '-0.01em',
                lineHeight: 1.4,
                marginTop: '0.2em',
              }}
            >
              Flexibel. Remote. Aufstiegsfähig.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-muted)',
              maxWidth: '50ch',
              marginInline: 'auto',
              marginBottom: 'var(--space-10)',
              lineHeight: 1.6,
            }}
          >
            Kein Lebenslauf, kein Büro, keine Vorkenntnisse nötig — nur eine Stimme und den Willen erfolgreich zu sein.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}
          >
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '18px 48px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 'var(--text-base)',
                boxShadow: '0 4px 32px rgba(58,111,216,0.35)',
              }}
            >
              {WA_ICON}
              Jetzt Sprachnachricht senden
            </a>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
              Rückmeldung innerhalb 24 h · Kein Lebenslauf nötig
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          paddingBlock: 'var(--space-8)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 var(--space-6)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {[
            { v: '24 h', l: 'Rückmeldung garantiert' },
            { v: '2.200 €', l: 'Ø Verdienst aktiver Setter' },
            { v: '5 Tage', l: 'bis zum ersten Onboarding' },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: 'var(--primary-bright)',
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  marginTop: 6,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VERDIENST TIERS ── */}
      <section
        style={{
          paddingBlock: 'clamp(4rem, 10vw, 7rem)',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(58,111,216,0.06), transparent 70%)',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '0 var(--space-6)' }}>
          <motion.div {...reveal} style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span style={LABEL_STYLE}>Verdienst</span>
            <h2 style={H2_STYLE}>Was kannst du verdienen?</h2>
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-muted)',
                maxWidth: '50ch',
                marginInline: 'auto',
                lineHeight: 1.65,
              }}
            >
              Transparent, kein Kleingedrucktes. Dein Einsatz bestimmt dein Ergebnis.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-5)',
              marginBottom: 'var(--space-8)',
            }}
          >
            {[
              {
                tier: 'Einstieg',
                sub: 'Erste 30–60 Tage',
                to: 1200,
                from: 500,
                color: 'var(--text-muted)' as const,
                bg: 'var(--surface)',
                borderColor: 'var(--border)',
                highlight: false,
                desc: 'Show-Up-Bonus + erste eigene Deals. Vollständiges Onboarding inklusive.',
              },
              {
                tier: 'Aktiv',
                sub: 'Ab 3 Monaten',
                to: 3000,
                from: 1500,
                color: 'var(--primary-bright)' as const,
                bg: 'var(--surface-2)',
                borderColor: 'rgba(58,111,216,0.4)',
                highlight: true,
                desc: 'Konstante Pipeline, Deal-Boni und monatliche Performance-Boni.',
              },
              {
                tier: 'Top Performer',
                sub: 'Vollzeit + 6 Monate',
                to: 5000,
                from: 3500,
                color: '#f5a623' as const,
                bg: 'var(--surface)',
                borderColor: 'rgba(245,166,35,0.3)',
                highlight: false,
                desc: 'Bessere Leads, Teamcoaching und Option auf Festanstellung.',
              },
            ].map((tier, i) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="card-lift"
                style={{
                  background: tier.bg,
                  border: `1px solid ${tier.borderColor}`,
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-8)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {tier.highlight && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'linear-gradient(90deg, transparent, var(--primary-bright), transparent)',
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: tier.color,
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  {tier.tier}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginBottom: 'var(--space-5)' }}>
                  {tier.sub}
                </div>
                <div
                  style={{
                    fontSize: 'clamp(2.25rem, 2rem + 1vw, 3rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    color: tier.color,
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <CountUp to={tier.to} suffix=" €" />
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginBottom: 'var(--space-5)' }}>
                  bis /Monat · ab {tier.from.toLocaleString('de-DE')} €
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  {tier.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
            Angaben basieren auf Durchschnittswerten aktiver Setter. Individuelle Ergebnisse variieren je nach Einsatz.
          </p>
        </div>
      </section>

      {/* ── PROCESS STEPS ── */}
      <section
        style={{
          paddingBlock: 'clamp(4rem, 10vw, 7rem)',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 var(--space-6)' }}>
          <motion.div {...reveal} style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span style={LABEL_STYLE}>Bewerbungsprozess</span>
            <h2 style={H2_STYLE}>
              So läuft es ab —{' '}
              <span style={{ color: 'var(--primary-bright)' }}>in 4 Schritten</span>
            </h2>
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-muted)',
                maxWidth: '46ch',
                marginInline: 'auto',
                lineHeight: 1.6,
              }}
            >
              Einfach, schnell, direkt. Kein Lebenslauf, kein Aufwand.
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {[
              {
                n: 1,
                t: 'Sprachnachricht senden',
                d: 'Öffne unseren WhatsApp-Chat und schick uns eine kurze Bewerbungs-Sprachnachricht. Nur Stimme — kein Lebenslauf, kein Text.',
              },
              {
                n: 2,
                t: 'Kennenlernen',
                d: 'Wenn du überzeugst, laden wir dich zu einem kurzen Gespräch ein. Offen, direkt — wir schauen ob es passt.',
              },
              {
                n: 3,
                t: 'Onboarding starten',
                d: 'Du bekommst Zugang zu CRM, Leadlisten und Skripten. Vollständiges Setup — in wenigen Tagen startklar.',
              },
              {
                n: 4,
                t: 'Verdienen & wachsen',
                d: 'Du setzt Termine, verdienst Provision — und kannst dich langfristig bis zur Festanstellung entwickeln.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="card-lift"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr',
                  gap: 'var(--space-5)',
                  alignItems: 'start',
                  padding: 'var(--space-6)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                    border: '2px solid var(--primary-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-base)',
                    fontWeight: 900,
                    color: 'var(--primary-bright)',
                    flexShrink: 0,
                  }}
                >
                  {step.n}
                </div>
                <div>
                  <h3
                    style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}
                  >
                    {step.t}
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                    {step.d}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section
        style={{
          paddingBlock: 'clamp(4rem, 10vw, 7rem)',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--space-6)' }}>
          <motion.div {...reveal} style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span style={LABEL_STYLE}>Was du bekommst</span>
            <h2 style={H2_STYLE}>Dein komplettes Setup</h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-5)',
            }}
          >
            {[
              { i: '💻', t: 'CRM-Zugang', d: 'Professionelles CRM-System vom ersten Tag an — vollständig eingerichtet.' },
              { i: '📋', t: 'Qualifizierte Leadlisten', d: 'Kein Kaltstart. Du bekommst vorbereitete Listen für sofortigen Einsatz.' },
              { i: '🎯', t: 'Gesprächsskripte', d: 'Bewährte Scripts für jeden Einwand. Du lernst und optimierst fortlaufend.' },
              { i: '🚀', t: 'Volles Onboarding', d: 'Schritt-für-Schritt-Einarbeitung. In 5 Tagen bereit für dein erstes Gespräch.' },
              { i: '🕐', t: 'Freie Zeiteinteilung', d: 'Du arbeitest wann du willst. 10–15 h/Woche reichen für den Start.' },
              { i: '📈', t: 'Aufstiegspfad', d: 'Von Freelancer über bessere Leads und Coaching bis hin zur Festanstellung.' },
            ].map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="card-lift"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-8)',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 'var(--space-4)', lineHeight: 1 }}>{c.i}</div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                  {c.t}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  {c.d}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        style={{
          paddingBlock: 'clamp(4rem, 10vw, 7rem)',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 var(--space-6)' }}>
          <motion.div {...reveal} style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span style={LABEL_STYLE}>FAQ</span>
            <h2 style={H2_STYLE}>Häufige Fragen</h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {faqItems.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        style={{
          paddingBlock: 'clamp(5rem, 12vw, 9rem)',
          background: 'var(--bg)',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(58,111,216,0.08), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            maxWidth: 700,
            margin: '0 auto',
            padding: '0 var(--space-6)',
            textAlign: 'center',
          }}
        >
          <motion.div {...reveal} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '6px 14px',
                background: 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.3)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: '#25d366',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 'var(--space-8)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#25d366',
                  animation: 'pulse 2s infinite',
                  display: 'block',
                }}
              />
              Jetzt verfügbar
            </div>

            <h2
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 'var(--space-6)',
              }}
            >
              Bereit loszulegen?{' '}
              <span style={{ color: 'var(--primary-bright)', display: 'block' }}>
                Eine Nachricht reicht.
              </span>
            </h2>

            <p
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-muted)',
                maxWidth: '46ch',
                marginInline: 'auto',
                lineHeight: 1.65,
                marginBottom: 'var(--space-10)',
              }}
            >
              Schick uns{' '}
              <strong style={{ color: 'var(--text)' }}>ausschließlich eine kurze Sprachnachricht</strong>{' '}
              über WhatsApp. Kein Text, kein Lebenslauf — nur deine Stimme.
            </p>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '20px 56px',
                borderRadius: 'var(--radius-full)',
                background: '#25d366',
                color: '#fff',
                fontWeight: 700,
                fontSize: 'var(--text-lg)',
                boxShadow: '0 4px 32px rgba(37,211,102,0.35)',
              }}
            >
              {WA_ICON}
              Zur WhatsApp-Bewerbung
            </a>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-faint)',
                marginTop: 'var(--space-6)',
              }}
            >
              Wir melden uns innerhalb von 24 Stunden zurück
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          paddingBlock: 'var(--space-10)',
          background: 'var(--surface)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Utility<span style={{ color: 'var(--primary-bright)' }}>Hub</span>
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>© 2026 Utility Hub</p>
            <a href="/impressum" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
              Impressum
            </a>
            <a href="/datenschutz" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
              Datenschutz
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
