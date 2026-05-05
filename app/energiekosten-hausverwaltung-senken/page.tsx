import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Energiekosten Hausverwaltung senken – Neutral & Provisionsfrei | UtilityHub",
  description:
    "Energiekosten Ihrer Hausverwaltung senken: Alle Tarife neutral vergleichen, ohne Makler & ohne Provision. Für WEG- und Mietverwaltungen. Jetzt kostenlos vergleichen.",
};

const faqData = [
  {
    q: "Was bedeutet EDL-G für Hausverwaltungen?",
    a: "Das Energiedienstleistungsgesetz verpflichtet Unternehmen zu regelmäßigen Energieeffizienz-Audits und Dokumentation. UtilityHub unterstützt Sie mit transparenten Tarifvergleichen, die Ihre Compliance-Dokumentation erleichtern.",
  },
  {
    q: "Wie viel kann eine Hausverwaltung durch einen Tarifwechsel sparen?",
    a: "Typischerweise 10–30 % je nach aktuellem Vertrag und Verbrauch. Ein Vergleich auf UtilityHub dauert unter 5 Minuten und zeigt das konkrete Einsparpotenzial für Ihr Objekt.",
  },
  {
    q: "Ist UtilityHub kostenpflichtig für Hausverwaltungen?",
    a: "Nein. Der Vergleich ist vollständig kostenlos. Keine Provision, keine versteckten Kosten, keine Makler-Gebühren.",
  },
  {
    q: "Was ist der Unterschied zu einem Energiemakler?",
    a: "Energiemakler verdienen Provision vom jeweiligen Anbieter – das schränkt ihre Neutralität ein. UtilityHub ist unabhängig: keine Provision, alle verfügbaren Anbieter sichtbar, Ihre Entscheidung bleibt bei Ihnen.",
  },
  {
    q: "Funktioniert UtilityHub für WEG- und Mietverwaltungen?",
    a: "Ja. Beide Verwaltungsformen werden vollständig unterstützt, inklusive Gemeinschaftsstrom, Allgemeinstrom und Heizenergie für Mehrfamilienhäuser.",
  },
  {
    q: "Brauche ich meine Vertragsunterlagen für den Vergleich?",
    a: "Hilfreich, aber nicht zwingend. Ihre aktuellen Verbrauchsangaben (kWh/Jahr) reichen für eine erste realistische Einschätzung des Einsparpotenzials.",
  },
];

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "UtilityHub",
      url: "https://utility-hub.one",
      description: "Provisionsfreier Energietarifvergleich für Hausverwaltungen",
    },
    {
      "@type": "Service",
      name: "Energietarifvergleich für Hausverwaltungen",
      serviceType: "Energietarifvergleich",
      provider: { "@type": "Organization", name: "UtilityHub" },
      description:
        "Neutraler, provisionsfreier Energietarifvergleich speziell für WEG- und Mietverwaltungen.",
      areaServed: { "@type": "Country", name: "Deutschland" },
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqData.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: "https://utility-hub.one" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Energiekosten Hausverwaltung senken",
          item: "https://utility-hub.one/energiekosten-hausverwaltung-senken",
        },
      ],
    },
  ],
};

const COMPARE_URL = "/portal";

/* ─── Shared tokens ─── */
const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 var(--space-6)",
};

const section: React.CSSProperties = {
  paddingBlock: "clamp(3rem, 8vw, 6rem)",
  borderBottom: "1px solid var(--border)",
};

const label: React.CSSProperties = {
  fontSize: "var(--text-xs)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--accent)",
  marginBottom: "var(--space-3)",
  display: "block",
};

const h2Base: React.CSSProperties = {
  fontSize: "var(--text-2xl)",
  fontWeight: 800,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
  marginBottom: "var(--space-4)",
};

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-xl)",
  padding: "var(--space-8)",
};

const ctaBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "14px 32px",
  borderRadius: "var(--radius-full)",
  background: "var(--accent)",
  color: "#0d0b09",
  fontWeight: 700,
  fontSize: "var(--text-base)",
  boxShadow: "0 4px 20px var(--accent-glow)",
  textDecoration: "none",
};

/* ─── Mini components ─── */
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AmberCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function TrustBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: "var(--radius-full)",
        border: "1px solid rgba(245,158,11,.28)",
        background: "rgba(245,158,11,.06)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--accent)",
        whiteSpace: "nowrap",
      }}
    >
      <AmberCheck />
      {children}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "4px 14px",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--text-muted)",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Marquee data ─── */
const ROW1 = [
  "Kein Makler",
  "Keine Provision",
  "EDL-G-konform",
  "DSGVO-konform",
  "GEG 2024",
  "WEG-Verwaltung",
  "Mietverwaltung",
  "Allgemeinstrom",
  "Heizenergie",
  "Neutral",
  "Sofortvergleich",
  "Kein Interessenkonflikt",
];

const ROW2 = [
  "Ø −28 % Einsparung",
  "< 5 Minuten",
  "0 € Provision",
  "8,7 Mio. Wohneinheiten",
  "Alle Anbieter",
  "2.500 € gespart/Jahr",
  "Sofort · kostenlos · neutral",
  "28.875 Hausverwaltungen",
];

/* ─── Bar chart data ─── */
const BAR_DATA = [
  { label: "Strom", before: 100, after: 72, pct: "−28 %" },
  { label: "Erdgas", before: 100, after: 78, pct: "−22 %" },
  { label: "Fernwärme", before: 100, after: 85, pct: "−15 %" },
];

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  {
    quote:
      "Wir verwalten 12 Objekte. Mit UtilityHub haben wir in einer Stunde alle Tarife verglichen – ohne einen einzigen Makleranruf.",
    author: "WEG-Verwalterin",
    city: "München",
  },
  {
    quote:
      "Endlich kein Interessenkonflikt mehr. Die Tarife sind wirklich neutral – wir haben direkt beim ersten Vergleich 18 % gespart.",
    author: "Immobilienverwalter",
    city: "Hamburg",
  },
  {
    quote:
      "Die EDL-G-Compliance war für uns immer ein Stressthema. UtilityHub gibt uns Sicherheit bei der Dokumentation.",
    author: "Hausverwaltung",
    city: "Berlin",
  },
  {
    quote:
      "Innerhalb von 4 Minuten hatten wir drei bessere Angebote als vom Makler. Das spart uns über 3.000 € pro Jahr.",
    author: "Mietverwaltung",
    city: "Frankfurt",
  },
];

export default function EnergiePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      {/* ─── Global page styles ─── */}
      <style>{`
        /* Hero asymmetric */
        .hero-grid{display:grid;grid-template-columns:55fr 45fr;gap:clamp(2rem,5vw,5rem);align-items:center}
        @media(max-width:768px){.hero-grid{grid-template-columns:1fr}.hero-stat-grid{grid-template-columns:1fr 1fr!important}}

        /* Bento grid */
        .bento-grid{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:auto auto;gap:var(--space-4)}
        @media(max-width:720px){.bento-grid{grid-template-columns:1fr}}

        /* Marquee */
        .marquee-track{display:flex;gap:var(--space-8);width:max-content;animation:marqueeLeft 42s linear infinite}
        .marquee-track-r{display:flex;gap:var(--space-8);width:max-content;animation:marqueeRight 34s linear infinite}
        .marquee-wrap:hover .marquee-track,.marquee-wrap:hover .marquee-track-r{animation-play-state:paused}

        /* Testimonial 2-col */
        .quote-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)}
        @media(max-width:640px){.quote-grid{grid-template-columns:1fr}}

        /* Timeline steps */
        .timeline-step{display:grid;grid-template-columns:72px 1fr;gap:var(--space-6);align-items:start;position:relative}

        /* Process connecting line */
        .timeline-wrap{position:relative}
        .timeline-wrap::before{content:'';position:absolute;left:36px;top:36px;bottom:36px;width:1px;background:linear-gradient(to bottom,var(--accent),rgba(245,158,11,.1));z-index:0}

        /* Bar fills */
        .bar-amber{background:linear-gradient(to top,var(--accent),color-mix(in srgb,var(--accent) 60%,transparent));border-radius:4px 4px 0 0;transform-origin:bottom;animation:barGrow 1s var(--ease) both}
        .bar-amber:nth-child(1){animation-delay:0ms}
        .bar-amber:nth-child(2){animation-delay:80ms}
        .bar-amber:nth-child(3){animation-delay:160ms}

        /* FAQ chevron color */
        .faq-num{color:var(--accent);font-family:var(--font-serif);font-style:italic;font-size:2rem;opacity:.3;line-height:1}

        /* Warm footer */
        .footer-warm{background:linear-gradient(to bottom,var(--surface),color-mix(in srgb,var(--surface) 90%,var(--accent) 10%))}

        /* Mobile sticky */
        @media(min-width:768px){.mobile-sticky-cta{display:none!important}}
        @media(max-width:767px){body{padding-bottom:80px}}

        /* SVG line animation */
        .svg-line{stroke-dasharray:220;stroke-dashoffset:0;animation:lineDraw 1.4s var(--ease) both 0.3s}
      `}</style>

      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "color-mix(in srgb, var(--bg) 88%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            ...container,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a href="/" style={{ fontSize: "var(--text-lg)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Utility<span style={{ color: "var(--accent)" }}>Hub</span>
          </a>
          <a href={COMPARE_URL} className="btn-primary" style={ctaBtn}>
            Jetzt vergleichen →
          </a>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO — asymmetric 55/45, serif h1, floating stat cards
      ══════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          paddingBlock: "clamp(5rem, 12vw, 8rem)",
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Architectural SVG background — grid lines, no orb */}
        <svg
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="arch-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0L0 0 0 60" fill="none" stroke="hsla(35,25%,75%,0.07)" strokeWidth="0.75" />
            </pattern>
            <radialGradient id="grid-fade" cx="45%" cy="50%" r="55%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="grid-mask">
              <rect width="100%" height="100%" fill="url(#grid-fade)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#arch-grid)" mask="url(#grid-mask)" />
          {/* Structural accent lines */}
          <line x1="55%" y1="0" x2="55%" y2="100%" stroke="hsla(35,50%,70%,0.035)" strokeWidth="1" />
          <line x1="0" y1="60%" x2="55%" y2="60%" stroke="hsla(35,50%,70%,0.04)" strokeWidth="1" />
        </svg>

        <div style={{ position: "relative", ...container }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{ marginBottom: "var(--space-6)", fontSize: "var(--text-xs)", color: "var(--text-faint)" }}
          >
            <a href="/" style={{ color: "var(--text-faint)" }}>
              Startseite
            </a>
            {" / "}
            <span style={{ color: "var(--text-muted)" }}>Energiekosten Hausverwaltung senken</span>
          </nav>

          {/* 55 / 45 asymmetric grid */}
          <div className="hero-grid">
            {/* ── Left 55% ── */}
            <div>
              {/* Eyebrow pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 14px",
                  border: "1px solid rgba(245,158,11,.3)",
                  background: "rgba(245,158,11,.06)",
                  borderRadius: "var(--radius-full)",
                  marginBottom: "var(--space-5)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                    color: "var(--accent)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Provisionsfreier Vergleich
                </span>
              </div>

              {/* H1 — DM Serif italic accent + sans bold body */}
              <h1 style={{ marginBottom: "var(--space-5)", maxWidth: "22ch" }}>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: "var(--text-3xl)",
                    color: "var(--accent)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Energiekosten
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font)",
                    fontWeight: 800,
                    fontSize: "var(--text-3xl)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    color: "var(--text)",
                  }}
                >
                  Ihrer Hausverwaltung senken
                </span>
              </h1>

              <p
                style={{
                  fontSize: "var(--text-lg)",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  marginBottom: "var(--space-8)",
                  maxWidth: "44ch",
                }}
              >
                Alle verfügbaren Tarife neutral vergleichen — ohne Makler, ohne Provision. Speziell für
                WEG- und Mietverwaltungen.
              </p>

              {/* CTAs — left-aligned, amber primary */}
              <div
                style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-6)" }}
              >
                <a href={COMPARE_URL} className="btn-primary" style={ctaBtn}>
                  Jetzt Tarife vergleichen →
                </a>
                <a
                  href="#einsparung"
                  className="btn-ghost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 24px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "var(--text-sm)",
                    textDecoration: "none",
                  }}
                >
                  Potenzial berechnen ↓
                </a>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                {["Kein Makler", "Keine Provision", "EDL-G-konform", "DSGVO-konform"].map((t) => (
                  <TrustBadge key={t}>{t}</TrustBadge>
                ))}
              </div>
            </div>

            {/* ── Right 45% — floating stat cards ── */}
            <div
              className="hero-stat-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}
            >
              {/* Big card — spans 2 cols, DM Serif number */}
              <div
                className="card-lift"
                style={{
                  gridColumn: "span 2",
                  background: "var(--surface)",
                  border: "1px solid rgba(245,158,11,.22)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-6)",
                  boxShadow: "0 8px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(245,158,11,.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -24,
                    right: -24,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(245,158,11,.1) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--text-2xl)",
                    fontWeight: 400,
                    color: "var(--accent)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  Ø −28 %
                </div>
                <div
                  style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)", marginTop: 8 }}
                >
                  Energiekosten optimiert
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 4 }}>
                  nach Tarifwechsel mit UtilityHub
                </div>
              </div>

              {/* Small card — savings */}
              <div
                className="card-lift"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-5)",
                  boxShadow: "0 4px 24px rgba(0,0,0,.4)",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--text-xl)",
                    fontWeight: 800,
                    color: "var(--success)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  2.500 €
                </div>
                <div
                  style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text)", marginTop: 6 }}
                >
                  Einsparung/Jahr
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 4 }}>
                  Ø 10-Einheiten-Objekt
                </div>
              </div>

              {/* Small card — zero cost */}
              <div
                className="card-lift"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-5)",
                  boxShadow: "0 4px 24px rgba(0,0,0,.4)",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--text-xl)",
                    fontWeight: 800,
                    color: "var(--text)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  0 €
                </div>
                <div
                  style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text)", marginTop: 6 }}
                >
                  Provision & Gebühren
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 4 }}>
                  Immer kostenlos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MARQUEE STRIP — two rows, counter-scroll, edge fade
      ══════════════════════════════════════════ */}
      <div
        className="marquee-wrap"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          paddingBlock: "var(--space-5)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Edge fades */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 100,
            background: "linear-gradient(to right, var(--surface), transparent)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 100,
            background: "linear-gradient(to left, var(--surface), transparent)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Row 1 — scroll left */}
        <div style={{ overflow: "hidden", marginBottom: "var(--space-2)" }}>
          <div className="marquee-track">
            {[...ROW1, ...ROW1].map((item, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "var(--accent)", fontSize: "0.45rem" }}>◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 — scroll right (counter-direction) */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track-r">
            {[...ROW2, ...ROW2].map((item, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "var(--accent)", fontSize: "0.45rem" }}>◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BENTO STATS — asymmetric grid, bar chart, SVG line chart
      ══════════════════════════════════════════ */}
      <section
        style={{ ...section, background: "var(--bg)" }}
        id="stats"
      >
        <div style={container}>
          {/* Section header — serif/sans mix */}
          <div style={{ marginBottom: "var(--space-10)" }}>
            <span style={label}>Die Zahlen</span>
            <h2 style={h2Base}>
              Warum Hausverwaltungen auf{" "}
              <em
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--accent)",
                }}
              >
                UtilityHub
              </em>{" "}
              setzen
            </h2>
          </div>

          <div className="bento-grid">
            {/* Main card — CSS bar chart, spans 2 rows */}
            <div
              style={{
                ...card,
                gridRow: "span 2",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-faint)",
                  marginBottom: "var(--space-8)",
                }}
              >
                Durchschnittliche Kostensenkung nach Tarifwechsel
              </div>

              {/* Bar chart */}
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-8)",
                  alignItems: "flex-end",
                  height: 200,
                  marginBottom: "var(--space-5)",
                  flex: 1,
                }}
              >
                {BAR_DATA.map((bar) => (
                  <div
                    key={bar.label}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    {/* Two bars side by side */}
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        width: "100%",
                        height: "100%",
                        alignItems: "flex-end",
                      }}
                    >
                      {/* Before bar — muted */}
                      <div
                        style={{
                          flex: 1,
                          background: "var(--surface-2)",
                          borderRadius: "4px 4px 0 0",
                          height: `${bar.before}%`,
                        }}
                      />
                      {/* After bar — amber animated */}
                      <div
                        className="bar-amber"
                        style={{ flex: 1, height: `${bar.after}%` }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--text-faint)",
                        fontWeight: 600,
                      }}
                    >
                      {bar.label}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {bar.pct}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div
                style={{ display: "flex", gap: "var(--space-5)", fontSize: "var(--text-xs)", color: "var(--text-faint)" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      background: "var(--surface-2)",
                      borderRadius: 2,
                      display: "inline-block",
                    }}
                  />
                  Vor Wechsel
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      background: "var(--accent)",
                      borderRadius: 2,
                      display: "inline-block",
                    }}
                  />
                  Nach Wechsel
                </span>
              </div>
            </div>

            {/* Top-right — SVG mini line chart, Fernwärme +27% */}
            <div className="card-lift" style={card}>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-faint)",
                  marginBottom: "var(--space-4)",
                }}
              >
                Fernwärme Preistrend
              </div>
              {/* SVG line chart */}
              <svg viewBox="0 0 120 56" style={{ width: "100%", height: 70, marginBottom: "var(--space-3)" }}>
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--error)" stopOpacity=".18" />
                    <stop offset="100%" stopColor="var(--error)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <polygon
                  points="0,50 20,44 40,38 60,28 80,18 100,10 120,6 120,56 0,56"
                  fill="url(#line-grad)"
                />
                {/* Line */}
                <polyline
                  className="svg-line"
                  points="0,50 20,44 40,38 60,28 80,18 100,10 120,6"
                  fill="none"
                  stroke="var(--error)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="108" y="4" fontSize="5.5" fill="var(--error)" fontWeight="700" textAnchor="middle">
                  +27 %
                </text>
              </svg>
              <div
                style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: 800,
                  color: "var(--error)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                +27 %
              </div>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text)", marginTop: 6 }}>
                Fernwärme gestiegen
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 4 }}>
                Preisanstieg 2024–2025 · Grund zum Wechseln
              </div>
            </div>

            {/* Bottom-right — market size */}
            <div className="card-lift" style={card}>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-faint)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Markt Deutschland
              </div>
              <div
                style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: 800,
                  color: "var(--text)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                8,7 Mio.
              </div>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text)", marginTop: 6 }}>
                Verwaltete Wohneinheiten
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 4 }}>
                28.875 Hausverwaltungen in DE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROBLEM SECTION
      ══════════════════════════════════════════ */}
      <section style={{ ...section, background: "var(--surface)" }}>
        <div style={container}>
          <div style={{ marginBottom: "var(--space-10)", maxWidth: "48ch" }}>
            <span style={label}>Das Problem</span>
            <h2 style={h2Base}>
              <em
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--text)",
                }}
              >
                Warum
              </em>{" "}
              Energiekosten in der Hausverwaltung so schwer zu kontrollieren sind
            </h2>
          </div>

          <div
            className="fade-group"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}
          >
            {[
              {
                num: "01",
                title: "Mehrere Objekte, mehrere Verträge",
                desc: "Jedes Objekt hat eigene Laufzeiten und Konditionen. Den Überblick zu behalten kostet wertvolle Zeit.",
              },
              {
                num: "02",
                title: "Makler kosten Provision",
                desc: "Energiemakler verdienen am Abschluss – das verteuert Ihre Tarife durch versteckte Kosten.",
              },
              {
                num: "03",
                title: "EDL-G und GEG 2024 Druck",
                desc: "Neue gesetzliche Anforderungen erhöhen den Dokumentations- und Effizienzaufwand für Verwalter.",
              },
              {
                num: "04",
                title: "Mieter-Erwartungen steigen",
                desc: "Mieter erwarten transparente und faire Betriebskosten. Zu hohe Energiepreise führen zu Konflikten.",
              },
              {
                num: "05",
                title: "Angebote brauchen zu lange",
                desc: "Makler-Prozesse dauern Wochen. Bis das Angebot kommt, läuft der Altvertrag weiter.",
              },
              {
                num: "06",
                title: "Bindung durch Rahmenverträge",
                desc: "Lange Laufzeiten verhindern flexibles Wechseln, selbst wenn günstigere Tarife verfügbar sind.",
              },
            ].map((c) => (
              <div
                key={c.num}
                className="card-lift"
                style={{ ...card, background: "var(--surface-2)", position: "relative", overflow: "hidden" }}
              >
                {/* Serif background number */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 12,
                    fontFamily: "var(--font-serif)",
                    fontSize: "8rem",
                    fontWeight: 400,
                    color: "var(--text)",
                    opacity: 0.04,
                    lineHeight: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {c.num}
                </div>
                <h3
                  style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-2)", position: "relative" }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-muted)",
                    lineHeight: 1.65,
                    position: "relative",
                  }}
                >
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SOLUTION — comparison table + feature cards
      ══════════════════════════════════════════ */}
      <section style={{ ...section, background: "var(--bg)" }}>
        <div style={container}>
          <div style={{ marginBottom: "var(--space-10)" }}>
            <span style={label}>Die Lösung</span>
            <h2 style={h2Base}>
              UtilityHub:{" "}
              <em
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--accent)",
                }}
              >
                Der Vergleich,
              </em>{" "}
              der wirklich neutral ist
            </h2>
          </div>

          {/* Comparison table */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              marginBottom: "var(--space-10)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                padding: "var(--space-4) var(--space-6)",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface-2)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
              }}
            >
              <span>Kriterium</span>
              <span style={{ textAlign: "center" }}>Energiemakler</span>
              <span style={{ textAlign: "center", color: "var(--accent)" }}>UtilityHub</span>
            </div>
            {[
              ["Geschäftsmodell", "Provision vom Anbieter", "Provisionsfreier Self-Service"],
              ["Transparenz", "Angebote intransparent", "Alle Anbieter sichtbar"],
              ["Unabhängigkeit", "Interessenkonflikt", "Neutral, kein Interessenkonflikt"],
              ["Geschwindigkeit", "Tage bis Wochen", "Sofort, unter 5 Minuten"],
              ["EDL-G-Positionierung", "Keine klare Aussage", "Trust-Signal explizit"],
              ["Zielgruppen-Fit", "Generalist", "HV-spezifisch"],
            ].map(([criterion, competitor, uh], idx) => (
              <div
                key={criterion}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  padding: "var(--space-4) var(--space-6)",
                  borderBottom: idx < 5 ? "1px solid var(--divider)" : "none",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{criterion}</span>
                <span
                  style={{ textAlign: "center", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}
                >
                  {competitor}
                </span>
                <span
                  style={{
                    textAlign: "center",
                    fontSize: "var(--text-sm)",
                    color: "var(--accent)",
                    fontWeight: 600,
                  }}
                >
                  {uh}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}
          >
            {[
              {
                icon: "⚖️",
                title: "Provisionsfreier Vergleich",
                desc: "Wir verdienen keine Provision von Anbietern. Jeder Tarif wird neutral bewertet – Ihr Interesse kommt zuerst.",
              },
              {
                icon: "🏢",
                title: "HV-spezifisch",
                desc: "Entwickelt für Hausverwaltungen: WEG-Strom, Allgemeinstrom, Heizenergie – alle Bedarfe auf einer Plattform.",
              },
              {
                icon: "⚡",
                title: "Sofort einsatzbereit",
                desc: "Kein Makler-Termin, keine Wartezeit. Verbrauch eingeben, alle Tarife sehen, Entscheidung treffen.",
              },
            ].map((c) => (
              <div key={c.title} className="card-lift" style={{ ...card, background: "var(--surface)" }}>
                <div style={{ fontSize: 28, marginBottom: "var(--space-4)", lineHeight: 1 }}>{c.icon}</div>
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: 1.65 }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIAL WALL — 2-col, large serif quote mark, no portraits
      ══════════════════════════════════════════ */}
      <section style={{ ...section, background: "var(--surface)" }}>
        <div style={container}>
          <div style={{ marginBottom: "var(--space-10)" }}>
            <span style={label}>Vertrauen</span>
            <h2 style={h2Base}>
              <em
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--text)",
                }}
              >
                Hausverwaltungen,
              </em>{" "}
              die schon sparen
            </h2>
          </div>

          {/* Decorative serif quote mark */}
          <div style={{ position: "relative" }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: -16,
                left: -8,
                fontFamily: "var(--font-serif)",
                fontSize: "6rem",
                lineHeight: 1,
                color: "var(--accent)",
                opacity: 0.12,
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 0,
              }}
            >
              "
            </div>

            {/* 2-col editorial grid */}
            <div className="quote-grid" style={{ position: "relative", zIndex: 1 }}>
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.author + t.city}
                  className="card-lift"
                  style={{
                    ...card,
                    background: "var(--surface-2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-4)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--text-base)",
                      color: "var(--text-muted)",
                      lineHeight: 1.7,
                      fontStyle: "italic",
                      flex: 1,
                    }}
                  >
                    „{t.quote}"
                  </p>
                  <div
                    style={{
                      paddingTop: "var(--space-4)",
                      borderTop: "1px solid var(--divider)",
                    }}
                  >
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text)" }}>
                      {t.author}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 2 }}>
                      {t.city}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SAVINGS CALCULATOR
      ══════════════════════════════════════════ */}
      <section style={{ ...section, background: "var(--bg)" }} id="einsparung">
        <div style={container}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--space-8)",
              alignItems: "center",
            }}
          >
            <div>
              <span style={label}>Einspar-Potenzial</span>
              <h2 style={h2Base}>
                <em
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "var(--accent)",
                  }}
                >
                  Wie viel
                </em>{" "}
                können Hausverwaltungen realistisch sparen?
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                  marginBottom: "var(--space-6)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Basierend auf realen Tarifwechseln sparen Hausverwaltungen zwischen 10 und 30 % ihrer
                Energiekosten. Für ein typisches 10-Einheiten-Objekt bedeutet das:
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {[
                  { text: "Verbrauch: ~50.000 kWh/Jahr Strom", accent: false },
                  { text: "Aktueller Marktpreis: ~0,28 €/kWh", accent: false },
                  { text: "Aktuell: ~14.000 €/Jahr", accent: false },
                  { text: "Mit bestem Tarif: ~10.500–12.000 €/Jahr", accent: false },
                  { text: "Einsparung: 2.000–3.500 €/Jahr", accent: true },
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--space-3)",
                      fontSize: "var(--text-sm)",
                      color: item.accent ? "var(--accent)" : "var(--text-muted)",
                      fontWeight: item.accent ? 700 : 400,
                    }}
                  >
                    <CheckIcon />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid rgba(245,158,11,.2)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-8)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "var(--space-4)",
                }}
              >
                Mögliche Jahreseinsparung
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 400,
                  color: "var(--accent)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  marginBottom: "var(--space-2)",
                }}
              >
                2.000–3.500 €
              </div>
              <div
                style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-6)" }}
              >
                pro 10-Einheiten-Objekt
              </div>
              <a
                href={COMPARE_URL}
                className="btn-primary"
                style={{ ...ctaBtn, width: "100%", justifyContent: "center" }}
              >
                Mein Einsparpotenzial berechnen →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROCESS / HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section style={{ ...section, background: "var(--surface)" }}>
        <div style={container}>
          <div style={{ marginBottom: "var(--space-10)" }}>
            <span style={label}>So funktioniert es</span>
            <h2 style={h2Base}>
              <em
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--accent)",
                }}
              >
                In drei Schritten
              </em>{" "}
              zum besseren Tarif
            </h2>
          </div>

          <div
            className="timeline-wrap"
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)", maxWidth: 680 }}
          >
            {[
              {
                n: "01",
                title: "Verbrauch eingeben",
                desc: "Geben Sie Verbrauch (kWh/Jahr) und Ihre aktuelle Situation an. Keine Registrierung nötig.",
              },
              {
                n: "02",
                title: "Alle Tarife vergleichen",
                desc: "UtilityHub zeigt alle verfügbaren Angebote neutral — sortiert nach Preis, ohne Provision.",
              },
              {
                n: "03",
                title: "Selbst entscheiden",
                desc: "Kein Makler, kein Druck. Ihre Entscheidung, Ihr Tempo. Wechsel auf Wunsch direkt über die Plattform.",
              },
            ].map((step, i) => (
              <div key={step.n} className="timeline-step" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Step number — DM Serif, large background */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "var(--radius-lg)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        fontFamily: "var(--font-serif)",
                        fontSize: "3.5rem",
                        fontWeight: 400,
                        color: "var(--accent)",
                        opacity: 0.1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                        userSelect: "none",
                      }}
                    >
                      {step.n}
                    </div>
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 700,
                        color: "var(--accent)",
                        position: "relative",
                      }}
                    >
                      {step.n}
                    </span>
                  </div>
                </div>
                <div style={{ paddingTop: 16 }}>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: 1.7 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EDL-G COMPLIANCE
      ══════════════════════════════════════════ */}
      <section style={{ ...section, background: "var(--bg)" }}>
        <div style={container}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--space-8)",
              alignItems: "center",
            }}
          >
            <div style={{ ...card, background: "var(--surface)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {[
                  { badge: "EDL-G", desc: "Effizienzaudit-Dokumentation unterstützt" },
                  { badge: "GEG 2024", desc: "Konforme Tarifempfehlungen verfügbar" },
                  { badge: "DSGVO", desc: "Daten bleiben in Deutschland" },
                  { badge: "Neutral", desc: "Keine Provision, kein Interessenkonflikt" },
                ].map((item) => (
                  <div
                    key={item.badge}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-4)",
                      padding: "var(--space-4)",
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--divider)",
                    }}
                  >
                    <div
                      style={{
                        padding: "6px 12px",
                        background: "var(--accent-dim)",
                        border: "1px solid rgba(245,158,11,.28)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 800,
                        color: "var(--accent)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.badge}
                    </div>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span style={label}>Compliance</span>
              <h2 style={h2Base}>
                <em
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "var(--text)",
                  }}
                >
                  EDL-G und GEG 2024:
                </em>{" "}
                Keine Sorge um Compliance
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Das Energiedienstleistungsgesetz (EDL-G) verpflichtet Unternehmen zu regelmäßigen
                Effizienz-Audits – und das GEG 2024 erhöht den Druck weiter.
              </p>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "var(--text-sm)" }}>
                UtilityHub unterstützt Ihre{" "}
                <a
                  href="/geg-2024-hausverwaltung-pflichten"
                  style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  GEG 2024 Hausverwaltung
                </a>
                -Anforderungen mit transparenten, dokumentierbaren Tarifvergleichen. Alle Vergleichsdaten
                sind exportierbar und audit-tauglich.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MID-PAGE CTA
      ══════════════════════════════════════════ */}
      <section
        style={{
          paddingBlock: "clamp(4rem, 10vw, 7rem)",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle amber gradient — warm, not cold */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(245,158,11,.08), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", ...container }}>
          <h2 style={{ ...h2Base, fontSize: "var(--text-3xl)", letterSpacing: "-0.03em" }}>
            Jetzt Energietarife für Ihre{" "}
            <em
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--accent)",
              }}
            >
              Hausverwaltung
            </em>{" "}
            vergleichen
          </h2>
          <p
            style={{
              fontSize: "var(--text-lg)",
              color: "var(--text-muted)",
              maxWidth: "48ch",
              marginInline: "auto",
              marginBottom: "var(--space-8)",
              lineHeight: 1.6,
            }}
          >
            Kostenlos, neutral und in unter 5 Minuten. Kein Makler, keine Provision, keine Anmeldung
            nötig.
          </p>
          <a href={COMPARE_URL} className="btn-primary" style={ctaBtn}>
            Kostenlos vergleichen →
          </a>
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-faint)",
              marginTop: "var(--space-4)",
            }}
          >
            Keine Anmeldung nötig · Keine Provision · DSGVO-konform
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ — amber chevron numbers
      ══════════════════════════════════════════ */}
      <section style={{ ...section, background: "var(--bg)" }}>
        <div style={{ ...container, maxWidth: 780 }}>
          <div style={{ marginBottom: "var(--space-10)" }}>
            <span style={label}>FAQ</span>
            <h2 style={h2Base}>Häufige Fragen zur Energiekostenoptimierung</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {faqData.map((item, i) => (
              <div
                key={i}
                style={{ ...card, background: "var(--surface)" }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-4)",
                    alignItems: "flex-start",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {/* Amber serif number */}
                  <span className="faq-num">{String(i + 1).padStart(2, "0")}</span>
                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, lineHeight: 1.3, paddingTop: 4 }}>
                    {item.q}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-muted)",
                    lineHeight: 1.7,
                    paddingLeft: "calc(2rem + var(--space-4))",
                  }}
                >
                  {item.a}
                </p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "var(--space-10)" }}>
            <a href={COMPARE_URL} className="btn-primary" style={ctaBtn}>
              Alle Tarife jetzt vergleichen →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER CTA — warm scroll BG
      ══════════════════════════════════════════ */}
      <section
        className="footer-warm"
        style={{
          paddingBlock: "clamp(3rem, 8vw, 5rem)",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <div style={container}>
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "var(--space-4)",
            }}
          >
            Energiekosten jetzt senken
          </h2>
          <p
            style={{
              fontSize: "var(--text-base)",
              color: "var(--text-muted)",
              maxWidth: "48ch",
              marginInline: "auto",
              marginBottom: "var(--space-6)",
            }}
          >
            Neutral. Provisionsfrei. Für Hausverwaltungen gemacht.
          </p>
          <a href={COMPARE_URL} className="btn-primary" style={ctaBtn}>
            Energiekosten jetzt senken →
          </a>

          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "var(--space-6)",
            }}
          >
            <Badge>Kein Makler</Badge>
            <Badge>Keine Provision</Badge>
            <Badge>Kostenlos</Badge>
            <Badge>DSGVO-konform</Badge>
          </div>

          <div
            style={{
              marginTop: "var(--space-10)",
              paddingTop: "var(--space-6)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "var(--space-4)",
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: "var(--text-xs)",
              color: "var(--text-faint)",
            }}
          >
            <a href="/betriebskosten-hausverwaltung-optimieren" style={{ color: "var(--text-faint)" }}>
              Betriebskosten optimieren
            </a>
            <a href="/nebenkostenabrechnung-strom-hausverwaltung" style={{ color: "var(--text-faint)" }}>
              Nebenkostenabrechnung Strom
            </a>
            <a href="/hausstrom-tarife-vergleichen" style={{ color: "var(--text-faint)" }}>
              Hausstrom Vergleich
            </a>
            <a href="/geg-2024-hausverwaltung-pflichten" style={{ color: "var(--text-faint)" }}>
              GEG 2024 Hausverwaltung
            </a>
            <a href="/" style={{ color: "var(--text-faint)" }}>
              Neutraler Tarifvergleich
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MOBILE STICKY CTA
      ══════════════════════════════════════════ */}
      <div
        className="mobile-sticky-cta"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "var(--space-4) var(--space-6)",
          background: "color-mix(in srgb, var(--surface) 95%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "center",
          zIndex: 50,
        }}
      >
        <a
          href={COMPARE_URL}
          className="btn-primary"
          style={{ ...ctaBtn, width: "100%", maxWidth: 400, justifyContent: "center" }}
        >
          Jetzt Tarife vergleichen →
        </a>
      </div>
    </>
  );
}
