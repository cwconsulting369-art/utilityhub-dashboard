# UtilityHub Landing — High-End Design Spec v2 (Anti-0815)

**Issue:** [LEN-131](/LEN/issues/LEN-131)
**Date:** 2026-05-05
**Status:** READY — CODER picks up via [LEN-131.A]
**Stack:** Next.js · Framer Motion ^12 · CSS Custom Props (NO Tailwind)
**Supersedes:** SPEC.md v1.0 (component structure stays; aesthetic layer replaced)

---

## 0. What changed and why

v1 spec produced functional but generic dark+blue SaaS aesthetic. SPEC.md was designed for correctness. This spec is designed for distinction.

**Root cause of 0815-Look:**
- `#3a6fd8` cold blue = used by ~150k SaaS products
- Centered `h1 + p + 2 CTAs` hero stack = SaaS template default
- Ambient radial-gradient orb = AI-generated landing page cliché
- 4 identical dark cards in `repeat(4, 1fr)` grid = Tailwind starter kit
- Single font (even Plus Jakarta Sans) = invisible default

**This spec fixes all five.**

---

## 1. Color System — Warm Amber replaces Cold Blue

### Decision
`#3a6fd8` cold blue → `#C9821A` warm amber.

Rationale: Amber = money, value, premium, established trust. German B2B Hausverwaltung buys with trust first, price second. Amber signals ROI. Cold blue signals "another SaaS tool." Anthropic, N26, Commerzbank, ING — they all use warm gold/amber for premium/financial positioning.

### New Token Set (full replacement for globals.css `:root`)

```css
:root {
  /* Dark BG — warmed by ~10% (barely perceptible, eliminates cold-blue cohesion) */
  --color-bg:              #0d0b09;
  --color-bg-card:         rgba(255, 248, 235, 0.04);   /* warm white surface */
  --color-bg-surface:      #141008;

  /* Primary Accent — Amber/Gold */
  --color-accent:          #C9821A;
  --color-accent-hover:    #B8730F;
  --color-accent-dim:      rgba(201, 130, 26, 0.12);
  --color-accent-glow:     rgba(201, 130, 26, 0.30);

  /* Secondary Accent — Teal (efficiency, positive signal, less generic than lime) */
  --color-accent-2:        #2DA87E;
  --color-accent-2-dim:    rgba(45, 168, 126, 0.10);

  /* Text — warm off-white */
  --color-text:            #FFF9F0;
  --color-text-muted:      rgba(255, 249, 240, 0.62);
  --color-text-subtle:     rgba(255, 249, 240, 0.38);

  /* Borders — warm */
  --color-border:          rgba(255, 248, 235, 0.08);
  --color-border-accent:   rgba(201, 130, 26, 0.22);
  --color-border-accent-hover: rgba(201, 130, 26, 0.55);

  /* Danger (unchanged) */
  --color-danger:          rgba(220, 38, 38, 0.9);

  /* Typography */
  --font-serif: 'DM Serif Display', Georgia, serif;     /* NEW — add to layout.tsx */
  --font-sans:  'Plus Jakarta Sans', system-ui, sans-serif;

  /* Type scale — expanded for display use */
  --font-size-display: clamp(3.5rem, 7vw, 6rem);        /* hero h1 */
  --font-size-h1:   clamp(2.8rem, 5.5vw, 4.5rem);
  --font-size-h2:   clamp(1.8rem, 3.5vw, 2.75rem);
  --font-size-h3:   clamp(1.15rem, 2vw, 1.4rem);
  --font-size-body: 1rem;
  --font-size-sm:   0.875rem;
  --font-size-xs:   0.78rem;

  /* Spacing — unchanged from v1 */
  --section-padding-y: clamp(4rem, 8vw, 8rem);
  --container-max:     1200px;
  --container-padding: clamp(1.25rem, 4vw, 2.5rem);

  /* Borders */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* Shadows — warm tint */
  --shadow-card:       0 0 24px rgba(201, 130, 26, 0.10);
  --shadow-card-hover: 0 0 36px rgba(201, 130, 26, 0.22);

  /* Animation easing — Emil Kowalski principles */
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);      /* entries: strong ease-out */
  --ease-in-out-str: cubic-bezier(0.77, 0, 0.175, 1);    /* on-screen movement */
  --ease-spring:     cubic-bezier(0.34, 1.2, 0.64, 1);   /* gentle spring, no bounce */

  /* Transitions */
  --transition-base: 0.18s var(--ease-out-expo);
  --transition-slow: 0.38s var(--ease-out-expo);

  /* Z-Index */
  --z-nav:     100;
  --z-modal:   200;
  --z-overlay: 10;
}

/* Amber gradient text utility */
.text-amber {
  background: linear-gradient(135deg, #D4962A 0%, #C9821A 50%, #E8B048 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Teal gradient text utility */
.text-teal {
  background: linear-gradient(135deg, #34C48E 0%, #2DA87E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 2. Typography — DM Serif Display + Plus Jakarta Sans

### Decision
Add DM Serif Display (Google Fonts, `weight: 400` only, `style: normal + italic`).
Use for: hero h1, section headline accent words, large quote marks in testimonials.
Plus Jakarta Sans stays for all body, UI, labels.

### layout.tsx change
```tsx
import { DM_Serif_Display, Plus_Jakarta_Sans } from 'next/font/google'

const dmSerif = DM_Serif_Display({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

// Apply both variables to <html className={`${dmSerif.variable} ${jakartaSans.variable}`}>
```

### Typography Rules

| Element | Font | Weight | Style | Notes |
|---------|------|--------|-------|-------|
| Hero h1 | DM Serif Display | 400 | italic | Amber gradient on key word(s) |
| Section h2 (accent) | DM Serif Display | 400 | italic | 1–3 accent words in amber |
| Section h2 (rest) | Plus Jakarta Sans | 800 | normal | Continues after serif part |
| Large quote mark | DM Serif Display | 400 | normal | Decorative `"`, 6-8rem, amber 0.15 opacity |
| Body | Plus Jakarta Sans | 400 | normal | Warm off-white muted |
| Labels / eyebrows | Plus Jakarta Sans | 700 | normal | 0.75rem, uppercase, 0.08em letter-spacing |
| Button text | Plus Jakarta Sans | 700 | normal | |
| Stat numbers (large) | Plus Jakarta Sans | 800 | normal | tabular-nums, amber |

### Heading pattern — serif italic lead + sans bold follow
```tsx
// H2 composition pattern (React):
<h2>
  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
    <span className="text-amber">Weniger Kosten.</span>
  </span>{' '}
  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
    Mehr Überblick.
  </span>
</h2>
```

---

## 3. Animation System

### Principle (from Emil Kowalski)
- Only animate `transform` and `opacity` (GPU-composited, no layout reflow)
- Entry: `ease-out-expo` (starts fast, feels responsive)
- Stagger: 40–60ms between items (not 100–150ms — faster = more alive)
- Button press: `scale(0.97)` on `whileTap` (Framer) or `:active` CSS
- Entry scale from `0.97`, never `0` (nothing in reality appears from nothing)
- Exit animations faster than entry (e.g., enter 0.5s, exit 0.2s)
- `prefers-reduced-motion`: show end state, no transition

### Framer Motion patterns

```tsx
// Standard entry (replaces all existing { duration: 0.6, delay } patterns)
const entryVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

// Stagger container
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }, // 50ms
}

// Button press (add to all CTA buttons/links)
whileTap={{ scale: 0.97 }}
transition={{ duration: 0.1, ease: 'easeOut' }}
```

### Magnetic CTA (Hero primary CTA only)
```tsx
// useRef on the button
// onMouseMove: calculate delta from button center → translateX/Y by 0.2× delta
// onMouseLeave: reset to 0,0
// Use Framer Motion useSpring for momentum
// Cap at ±8px max offset
// This effect: distinctive, not gimmicky at this scale
```

---

## 4. Hero Section — FULL REWRITE

### Delete
- Lines 35–41: radial-gradient ambient orb → `DELETE`
- `alignItems: 'center', justifyContent: 'center', textAlign: 'center'` → replace with asymmetric grid

### New composition: 55/45 asymmetric grid

```
[64px nav]
┌──────────────────────────────────────────────────────┐
│  HERO (100dvh, full-bleed, architectural BG)         │
│                                                      │
│  ┌── LEFT 55% ─────────────────┐  ┌── RIGHT 45% ──┐ │
│  │                             │  │               │ │
│  │  EYEBROW  (mono label)      │  │  STAT CARDS   │ │
│  │                             │  │  (3 layered,  │ │
│  │  H1: DM Serif italic        │  │   staggered)  │ │
│  │  "<em>Weniger zahlen.</em>  │  │               │ │
│  │  Besser verwalten."         │  │               │ │
│  │  Key word: amber gradient   │  │               │ │
│  │                             │  │  Floating     │ │
│  │  SUBLINE (sans, 1.1rem)     │  │  trust chips  │ │
│  │  max-width: 480px           │  │  (2 inline)   │ │
│  │                             │  │               │ │
│  │  CTA ROW (left-aligned)     │  │               │ │
│  │  [Amber: Kostenlos starten] │  │               │ │
│  │  Wie es funktioniert →      │  │               │ │
│  └─────────────────────────────┘  └───────────────┘ │
│                                                      │
│  ↓ scroll indicator (bottom center, animated)        │
└──────────────────────────────────────────────────────┘
```

### CSS layout
```tsx
// Hero outer: position: relative, minHeight: '100dvh', overflow: 'hidden'
// Hero inner:
display: 'grid',
gridTemplateColumns: '55fr 45fr',
alignItems: 'center',
gap: 'clamp(3rem, 6vw, 8rem)',
maxWidth: '1200px',
margin: '0 auto',
padding: '0 var(--container-padding)',
paddingTop: 'calc(64px + clamp(3rem, 5vw, 5rem))',
paddingBottom: 'clamp(3rem, 5vw, 5rem)',

// Mobile (< 768px): gridTemplateColumns: '1fr', right column moves below
```

### Hero Background (no Higgsfield yet)
Remove orb gradient. Replace with architectural SVG grid:

```tsx
// Thin angular lines suggesting property-grid (not amorphous blob)
// stroke: rgba(201, 130, 26, 0.06)  (amber, very subtle)
// A regular grid of slightly rotated rectangles → suggests floor plans / apartment blocks
// position: absolute, inset: 0, z-index: 0
// SVG viewBox="0 0 1200 800", preserveAspectRatio="xMidYMid slice"
// No glow, no blur, no orb

// Optional: very subtle radial gradient on top (NOT as a glow-ball, but as
// a vignette dimming the corners):
// background: radial-gradient(ellipse 80% 60% at 30% 50%, transparent 40%, rgba(13,11,9,0.6) 100%)
```

When Higgsfield `hero-bg-full.jpg` arrives: swap SVG for `<Image priority fill>` + overlay.

### Hero Right Column: Floating Stat Cards

3 overlapping dark cards showing real LEN-120 data. NOT a carousel. Static, staggered entrance.

```tsx
// Card 1 (largest, top-left):
{
  stat: '-28%',
  label: 'Ø Einsparung',
  sublabel: 'Energiekosten',
  detail: 'Bei 1.841 Einheiten Ø ca. 650.000 €/Jahr',
  color: '--color-accent',  // amber number
}

// Card 2 (medium, offset right 2rem + down 4rem):
{
  stat: '93%',
  label: 'Abrechnungen',
  sublabel: 'fehlerhaft',
  detail: 'Mineko 2025, 34.000 Analysen',
  color: '--color-danger',  // red-orange (warning)
}

// Card 3 (small, offset further right 1.5rem + down 4rem):
{
  stat: '< 48h',
  label: 'Onboarding',
  sublabel: 'bis zur Optimierung',
  color: '--color-accent-2',  // teal
}
```

Card styling:
```css
.hero-stat-card {
  background: rgba(13, 11, 9, 0.85);
  border: 1px solid rgba(255, 248, 235, 0.10);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 1.25rem 1.5rem;
  position: absolute;  /* stacked within relative container */
}
/* Gentle float animation on Card 1 only (decorative, pauses on reduced-motion) */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}
.hero-stat-card--floating {
  animation: float 4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .hero-stat-card--floating { animation: none; }
}
```

Entrance: stagger 0s / 0.12s / 0.22s per card.

### Hero Eyebrow — replace badge with inline label
```tsx
// NOT: pill badge with background (too common)
// YES: plain label line
<p style={{
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-accent)',
  marginBottom: '1.25rem',
  fontFamily: 'var(--font-sans)',
}}>
  Energiemanagement · Hausverwaltungen · Deutschland
</p>
```

### Hero H1 — DM Serif italic, no white gradient text
```tsx
<h1 style={{
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontSize: 'var(--font-size-display)',
  fontWeight: 400,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: 'var(--color-text)',
  marginBottom: '1.5rem',
}}>
  <span className="text-amber">Weniger zahlen.</span>
  <br />
  Besser verwalten.
</h1>
```

### Hero CTAs — left-aligned, amber primary
```tsx
// Primary: amber background, NOT blue
background: 'var(--color-accent)'
// On hover: --color-accent-hover, translateY(-2px), amber glow
boxShadow: '0 4px 28px rgba(201,130,26,0.35)'

// Secondary: no border-box (was: ghost button with border)
// Instead: text link with arrow → cleaner, more premium
// "Wie es funktioniert →" (no box, just text + arrow)
```

### Scroll indicator (new element)
```tsx
// Bottom center of hero, fixed to hero section bottom
// Animated chevron (⌄) or dot-on-line: opacity 0.4, y 0→8px loop, 2s ease-in-out
// disappears on scroll (useScrollY, opacity → 0 when > 80px)
```

---

## 5. MarqueeStrip (replaces TrustStrip.tsx)

### Rename: `TrustStrip.tsx` → `MarqueeStrip.tsx`

### Composition: two-row counter-scrolling marquee

```tsx
const ROW_1 = [
  { value: '150+', label: 'Hausverwaltungen' },
  { value: '93%', label: 'Abrechnungsfehler erkannt', source: 'Mineko 2025' },
  { value: '+27%', label: 'Fernwärme-Anstieg 2024', source: 'Heizspiegel' },
  { value: '< 48h', label: 'bis zur Optimierung' },
  { value: '49%', label: 'Betriebskosten für Heizung', source: 'DMB 2024' },
  { value: 'DSGVO', label: 'Made in Germany' },
]
// Duplicate array to create seamless loop: [...ROW_1, ...ROW_1]
```

```css
.marquee-wrapper {
  overflow: hidden;
  /* Edge fade */
  mask-image: linear-gradient(90deg,
    transparent 0%, black 6%,
    black 94%, transparent 100%
  );
  -webkit-mask-image: linear-gradient(90deg,
    transparent 0%, black 6%,
    black 94%, transparent 100%
  );
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 1.25rem 0;
}

.marquee-track {
  display: flex;
  gap: 3rem;
  width: max-content;
  animation: marquee-fwd 28s linear infinite;
}

.marquee-track--reverse {
  animation: marquee-rev 34s linear infinite;
}

@keyframes marquee-fwd {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes marquee-rev {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}

/* Pause on hover */
.marquee-track:hover { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
```

Item styling:
```tsx
// Each item: value in amber (700), separator · in amber 0.3, label in muted text
// Source (if present): smaller, very subtle
<span>
  <strong style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{item.value}</strong>
  {' '}{item.label}
  {item.source && <small style={{ opacity: 0.4, fontSize: '0.72rem' }}> · {item.source}</small>}
</span>
```

---

## 6. Problem + Solution Sections — Accent Pivot

No structural rewrite needed. Change:

1. `--color-accent` references → now renders amber (auto via token swap)
2. Section h2: apply serif/sans mixed heading pattern (see §2)
3. Stat badges (currently `color: var(--color-accent)`): keep — now amber
4. Error/warning badge: keep `--color-danger` red-orange

```tsx
// ProblemSection h2 example:
<h2>
  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-accent)' }}>
    Das kostet
  </span>{' '}
  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
    Hausverwaltungen täglich Geld
  </span>
</h2>
```

---

## 7. StatsSection (replaces KPIGrid.tsx + KPICard.tsx)

### Delete: `KPIGrid.tsx`, `KPICard.tsx` (both replaced by StatsSection)
### Keep: `StatCounter.tsx` (reused, update easing to `--ease-out-expo`)
### Rename: create `StatsSection.tsx`

### Layout: Bento asymmetric grid (NOT `repeat(4, 1fr)`)

```css
.stats-bento {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1rem;
  grid-template-areas:
    "hero-stat  small-a  small-b"
    "hero-stat  medium-a medium-b";
}

@media (max-width: 900px) {
  .stats-bento {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "hero-stat hero-stat"
      "medium-a  medium-b"
      "small-a   small-b";
  }
}

@media (max-width: 640px) {
  .stats-bento {
    grid-template-columns: 1fr;
    grid-template-areas:
      "hero-stat"
      "medium-a"
      "medium-b"
      "small-a"
      "small-b";
  }
}
```

### Grid areas content

**hero-stat (large, area: hero-stat):** Ø -28% Kostenersparnis
```tsx
// Large amber number via StatCounter (count from 0 → 28, suffix: '%')
// Below: thin horizontal bar chart:
//   Background track: rgba(255,248,235,0.08), height 6px, radius 3px
//   Amber fill: animates width 0→72% on inView (CSS transition 1.2s ease-out-expo)
//   Labels: "Vor UtilityHub" (100%) left | "Mit UtilityHub" (72%) right
// Source footnote: "Basierend auf Kundendaten · TODO: Carlos validiert"
```

**small-a (area: small-a):** 150+ Hausverwaltungen
```tsx
// StatCounter: 0 → 150, suffix: '+'
// Simple: number + label
```

**small-b (area: small-b):** < 48h Onboarding
```tsx
// Static text (not animated — "< 48" reads better as text than counter)
// Teal accent
```

**medium-a (area: medium-a):** 93% fehlerhafte Abrechnungen
```tsx
// StatCounter: 0 → 93, suffix: '%'
// Amber bar: width 0→93%
// Source: "Mineko 2025, 34.000 Abrechnungen"
// Warning: danger-red stat instead of amber (this IS alarming)
```

**medium-b (area: medium-b):** +27% Fernwärme 2024
```tsx
// StatCounter: 0 → 27, prefix: '+', suffix: '%'
// Mini SVG line chart (static, ascending → then sharp drop → aspirational with UtilityHub)
// Chart: ~80px height, amber stroke, no fill, no axis labels
// SVG path drawn with stroke-dashoffset animation on inView
```

### Card base style
```css
.stat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-accent);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
.stat-card:hover {
  border-color: var(--color-border-accent-hover);
  box-shadow: var(--shadow-card-hover);
}
```

---

## 8. ProcessSteps — Serif Background Numbers

No structural rewrite. Add serif background numbers as decorative layer:

```tsx
// Each step gets a decorative background number:
// DM Serif Display, ~8-10rem, amber, opacity: 0.10
// position: absolute, top: -1rem, left: 0
// z-index: 0 (behind content)

// Step content z-index: 1

// Connecting line: amber → transparent → amber gradient (not flat rgba(58,111,216,0.3))
// background: linear-gradient(90deg, transparent 0%, var(--color-accent) 20%,
//             var(--color-accent) 80%, transparent 100%)

// Stagger: reduce to 0.06s per step (from 0.15s — faster = more energetic)
```

---

## 9. TestimonialWall (replaces TestimonialCarousel.tsx + TestimonialCard.tsx)

### Rename: `TestimonialCarousel.tsx` → `TestimonialWall.tsx`
### Update: `TestimonialCard.tsx`

### Layout: 2-column quote grid (desktop), 1-column (mobile)

```
┌──────────────────────────────────────────────┐
│  Section H2: "Das sagen unsere Kunden"        │
│  (serif italic "Das sagen", sans "unsere...")  │
├──────────────────────┬───────────────────────┤
│  CARD LARGE          │  CARD MEDIUM          │
│  (spans full height) │                       │
│                      ├───────────────────────┤
│                      │  CARD MEDIUM          │
└──────────────────────┴───────────────────────┘
```

```css
.testimonial-wall {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1rem;
}

.testimonial-card--large {
  grid-row: span 2;
}

@media (max-width: 768px) {
  .testimonial-wall {
    grid-template-columns: 1fr;
  }
  .testimonial-card--large { grid-row: span 1; }
}
```

### TestimonialCard — editorial style
```tsx
// Decorative opening quote mark:
// DM Serif Display, 6rem, amber, opacity: 0.12, absolute top-left of card
// position: absolute, top: 0.5rem, left: 1rem, lineHeight: 1, zIndex: 0

// Quote text: Plus Jakarta Sans 400, 1.05rem, lineHeight 1.7, position relative zIndex 1
// Name: sans 700, 0.85rem, warm white
// Company: sans 400, 0.8rem, muted

// NO portrait photo circles (unless Higgsfield delivers)
// Card: same .stat-card base style (border: amber, warm surface)

const testimonials = [
  {
    quote: 'Ein System, das wirklich versteht, wie Hausverwaltungen arbeiten. Nicht noch eine Software, die man erklären muss.',
    name: 'Thomas M.',
    company: 'GF Müller Verwaltungsgesellschaft',
    large: true,
  },
  {
    quote: '48 Stunden nach Onboarding hatten wir die erste Optimierung. Das war nicht erwartet.',
    name: 'Anna K.',
    company: 'Hausverwaltung Köhler & Partner',
    large: false,
  },
  {
    quote: 'Die Fehlerquote in unseren Abrechnungen hat mich erschrocken. UtilityHub hat das in Zahlen gefasst.',
    name: 'Bernd S.',
    company: 'BMS Immobilienverwaltung',
    large: false,
  },
]
// TODO: Replace with real customer quotes when Carlos provides them (mark with /* PLACEHOLDER */)
```

---

## 10. CTA Section — Accent pivot + serif heading

Changes only:
1. Token swap (`--color-accent` → amber auto)
2. h2: apply serif/sans mixed pattern (§2)
3. Form input focus: `border-color: var(--color-accent)` + `box-shadow: 0 0 0 3px var(--color-accent-dim)` → amber focus ring (was blue)
4. Background: when Higgsfield `cta-bg.jpg` arrives — use. Until then: `background: var(--color-bg-surface)` with subtle architectural SVG pattern (same as hero).

---

## 11. Nav — Minor refinements
1. Scroll BG: `rgba(13, 11, 9, 0.92)` (warm, was cold `rgba(10,12,16,0.95)`)
2. Scroll border: `border-bottom: 1px solid rgba(255,248,235,0.06)` (warm)
3. CTA button: amber, not blue

---

## 12. Section Order (final, v2)

```
StickyNav
  ↓
HeroSection       (REWRITE — asymmetric, serif, no orb)
  ↓
MarqueeStrip      (was TrustStrip — infinite marquee, two rows)
  ↓
ProblemSection    (accent pivot + serif h2)
  ↓
SolutionSection   (accent pivot + serif h2)
  ↓
StatsSection      (was KPIGrid — bento asymmetric, bar chart, SVG line)
  ↓
ProcessSteps      (serif bg numbers, amber connecting line)
  ↓
TestimonialWall   (was TestimonialCarousel — quote wall, editorial)
  ↓
CtaSection        (accent pivot + serif h2)
  ↓
FAQAccordion      (accent pivot: amber chevron)
  ↓
Footer
```

**ClientSections.tsx** update: swap import names for renamed components.

---

## 13. Framer Motion SSR pattern (unchanged)

Keep `dynamic(() => import(...), { ssr: false })` in `ClientSections.tsx` for all Framer Motion components. `MarqueeStrip` uses CSS animation (no Framer Motion) → can add to server imports if needed, but keeping in ClientSections is fine.

---

## 14. CODER Implementation Map

| File | Action | Priority |
|------|--------|----------|
| `globals.css` | REPLACE `:root` token block (§1), add easing vars, add `.text-amber`, `.text-teal` | P0 |
| `layout.tsx` | Add DM Serif Display font import + variable | P0 |
| `HeroSection.tsx` | REWRITE (§4): delete orb, asymmetric grid, stat cards, serif h1, amber CTAs | P0 |
| `TrustStrip.tsx` → `MarqueeStrip.tsx` | RENAME + REWRITE (§5): CSS marquee, two rows | P0 |
| `KPIGrid.tsx` → `StatsSection.tsx` | RENAME + REWRITE (§7): bento grid, bar chart, SVG mini-line | P1 |
| `KPICard.tsx` | DELETE (absorbed into StatsSection) | P1 |
| `StatCounter.tsx` | UPDATE easing to `--ease-out-expo` | P1 |
| `TestimonialCarousel.tsx` → `TestimonialWall.tsx` | RENAME + REWRITE (§9): quote wall 2-col | P1 |
| `TestimonialCard.tsx` | UPDATE (§9): editorial style, serif quote mark, no portrait circles | P1 |
| `ProcessSteps.tsx` | UPDATE (§8): serif bg numbers, amber connecting line, faster stagger | P2 |
| `ProblemSection.tsx` | UPDATE: serif/sans h2, token rename if any | P2 |
| `SolutionSection.tsx` | UPDATE: serif/sans h2, token rename if any | P2 |
| `CtaSection.tsx` | UPDATE: amber form focus, serif h2 | P2 |
| `FAQAccordion.tsx` | UPDATE: amber chevron color | P2 |
| `StickyNav.tsx` | UPDATE: warm BG colors | P2 |
| `Footer.tsx` | UPDATE: warm border color | P3 |
| `ClientSections.tsx` | UPDATE: import MarqueeStrip, StatsSection, TestimonialWall | P0 |

**FeaturesSection.tsx:** Not in ClientSections → remains unused. Do not delete yet (Carlos decision).

---

## 15. Acceptance Criteria

| Criterion | Test |
|-----------|------|
| No `#3a6fd8` or `rgba(58,111,216` in output | grep codebase |
| No ambient orb glow div in HeroSection | code review |
| Hero h1 uses `--font-serif` | visual check |
| Marquee scrolls infinitely, pauses on hover | browser |
| StatsSection: bento grid layout visible, bar animates on scroll | browser |
| TestimonialWall: 2-col grid, editorial cards, large serif quote mark | browser |
| Lighthouse mobile ≥ 90 | Lighthouse CI |
| `prefers-reduced-motion`: all CSS/Framer animations suppressed | Chrome devtools |
| Git commit → Vercel auto-deploy → NEXUS-Bot pings Carlos | Paperclip automation |

---

## 16. Risks + Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Amber accent feels too warm / financial for some users | Medium | Medium | Carlos sees first deploy; amber is gold-adjacent (ING, N26, Commerzbank all use it). Fallback: forest teal `#3a7d6f`. |
| DM Serif Display feels too editorial | Low | Medium | Limit to headlines only; body/UI stays sans. Test after first deploy. |
| Hero stat cards overlap awkwardly on specific viewports | Medium | Low | CODER: test 1024px, 1280px, 1440px breakpoints; add `min-height` to right column container |
| Bento grid StatsSection needs real validated data | Medium | High | Mark all stat values `/* TODO: Carlos validates */`; use conservative LEN-120 research data as placeholders |
| Performance regression (2 Google Fonts, new SVG) | Low | Medium | DM Serif Display: 1 weight only; SVG: inline, no external load |

---

## 17. Follow-up after build

- [ ] Carlos validates KPI numbers (28% savings, 150+ customers, 48h) → replace TODO placeholders
- [ ] Carlos delivers Higgsfield images → CODER swaps architectural SVG for real photos
- [ ] Carlos delivers real customer quotes → CODER replaces TestimonialWall PLACEHOLDER texts
- [ ] Carlos delivers Calendly URL → CODER wires CTA form / Termin button
- [ ] After live: SEO tags from LEN-121 → insert in `layout.tsx`
- [ ] After 1 week live: Lighthouse CI check

---

*SPEC v2.0 — 2026-05-05 — ARCHITECT ([LEN-131](/LEN/issues/LEN-131))*
*Implementation: CODER picks up via LEN-131.A*
*Approved by: NEXUS (pending — see LEN-131 issue thread)*
