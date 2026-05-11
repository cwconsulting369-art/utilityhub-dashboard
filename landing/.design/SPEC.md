# UtilityHub Marketing-Landing — Architecture SPEC

**Issue:** LEN-122 (ARCHITECT deliverable → CODER picks up in LEN-123)
**Stack:** Next.js 16.2.4 · Framer Motion ^12.38.0 · CSS Custom Props (NO Tailwind)
**Colors:** `#0a0c10` dark BG · `#3a6fd8` blue accent · `#ffffff` primary text
**Constraint:** High-end, minimal/clean. Vertrauen → Qualität → Conversion. Slide-Effekte dezent.

---

## 1. Section-Liste (Render-Reihenfolge)

| # | ID | Komponente(n) | Bild-Slot | Priority |
|---|-----|-------------|-----------|---------|
| 0 | nav | `StickyNav` | — | eager |
| 1 | hero | `HeroSection` | `hero-bg-full` | eager |
| 2 | trust-strip | `TrustStrip` | — | lazy |
| 3 | problem | `ProblemSection` | `problem-inline` | lazy |
| 4 | solution | `SolutionSection` | `solution-inline` | lazy |
| 5 | kpi | `KPIGrid` + `KPICard` + `StatCounter` | `stats-bg` (subtle) | lazy |
| 6 | process | `ProcessSteps` | — | lazy |
| 7 | trust-signals | `TestimonialCarousel` + `TestimonialCard` | `testimonial-portrait-[1-3]` | lazy |
| 8 | cta | `CTASection` | `cta-bg` | lazy |
| 9 | faq | `FAQAccordion` | — | lazy |
| 10 | footer | `Footer` | — | lazy |

**Page entry point:** `app/page.tsx` imports all section components in this order.

---

## 2. Bild-Slots

Alle Bilder werden von Carlos via **Higgsfield** generiert. CODER integriert via Next.js `<Image>`.

### Slot: `hero-bg-full`
- **Verwendung:** HeroSection — Vollbild-Hintergrund mit Overlay
- **Aspect Ratio:** 21:9 → Zielgröße **3360 × 1440 px**
- **Subject:** Moderne Wohnanlage / Apartmentkomplex-Außenansicht bei Abenddämmerung oder Nacht. Architektonisch klar, urban, warm-kühle Beleuchtung mit Stadtlichtern reflektiert in Glasfassade.
- **Tonalität:** Cinematic dark-cool. Kein warmer Sonnenuntergang-Kitsch. Professionell, premium, leicht melancholisch-aspirational.
- **Overlay:** `linear-gradient(to bottom, rgba(10,12,16,0.75) 0%, rgba(10,12,16,0.55) 60%, rgba(10,12,16,0.90) 100%)`
- **Integration:** `<Image priority fill sizes="100vw" style={{ objectFit: 'cover' }} />`

### Slot: `problem-inline`
- **Verwendung:** ProblemSection — rechte Hälfte (Desktop), oben (Mobile)
- **Aspect Ratio:** 4:3 → Zielgröße **1200 × 900 px**
- **Subject:** Überforderter Hausverwalter am Schreibtisch. Papierstapel, mehrere Bildschirme mit Tabellen. Kein Chaos-Klischee — eher fokussierte Frustration bei komplexen Abrechnungen.
- **Tonalität:** Leicht entsättigt, kühles Bürolicht, gedeckte Grautöne dominant. Problem-Stimmung ohne Alarm-Effekt.
- **Integration:** `<Image sizes="(max-width: 768px) 100vw, 50vw" />`

### Slot: `solution-inline`
- **Verwendung:** SolutionSection — linke Hälfte (Desktop), oben (Mobile)
- **Aspect Ratio:** 16:9 → Zielgröße **1920 × 1080 px**
- **Subject:** Abstrahiertes modernes Dashboard mit Energiedaten, saubere Kurven auf dunklem Hintergrund. Kein Screenshot — eher eine ästhetisierte Visualisierung mit blauen/grünen Datenpunkten.
- **Tonalität:** Cool-blau, präzise, Klarheit signalisierend. Selber Dunkel-Ton wie Landing-BG für nahtlosen Look.
- **Integration:** `<Image sizes="(max-width: 768px) 100vw, 50vw" />`

### Slot: `stats-bg` (optional / low priority)
- **Verwendung:** KPIGrid — sehr subtiler Section-Hintergrund (opacity 0.05–0.08)
- **Aspect Ratio:** 16:9 → **1920 × 1080 px**
- **Subject:** Abstraktes Energie-Grid, Gitterlinien oder Daten-Hexagonmuster. Sehr reduziert.
- **Tonalität:** Navy-dunkel, fast unsichtbar. Nur Textur, kein ablenkender Inhalt.
- **Integration:** absolut positioniert, `opacity: 0.06`, kein Alt-Text nötig (`alt=""`)
- **Note:** Kann weggelassen werden wenn Bild zu busy wirkt — Section funktioniert auch ohne.

### Slot: `cta-bg`
- **Verwendung:** CTASection — Vollbild-Hintergrund
- **Aspect Ratio:** 21:9 → **3360 × 1440 px**
- **Subject:** Luftaufnahme deutsches Wohnquartier, Drohnenperspektive, blaue Stunde oder Nacht. Geordnete Strukturen, Premium-Wohnlage.
- **Tonalität:** Premium, aspirational, dunkel. Gleicher Stimmungsraum wie Hero-Bild, aber andere Perspektive (aerial statt bodenständig).
- **Overlay:** `rgba(10,12,16,0.80)` uniform overlay
- **Integration:** `<Image fill sizes="100vw" style={{ objectFit: 'cover' }} />`

### Slot: `testimonial-portrait-[1–3]`
- **Verwendung:** TestimonialCard — Portraitfoto neben Zitat
- **Aspect Ratio:** 1:1 → **800 × 800 px** (displayed 56–72px circular)
- **Subject:** Professioneller Hausverwalter oder Geschäftsführer einer Verwaltungsgesellschaft. Neutral-heller Hintergrund, Business-Attire (Hemd/Bluse, kein Sakko-Klischee). Direkter Blickkontakt. Authentisch, nicht stock-foto-artig.
- **Tonalität:** Corporate Trust. Warm-neutral. Klar, seriös, sympathisch.
- **Integration:** `<Image width={72} height={72} style={{ borderRadius: '50%' }} />`

---

## 3. Component-Plan

Alle Komponenten in `app/components/`. Keine Barrel-Files nötig bei 10 Komponenten.

### `StickyNav`
```
app/components/StickyNav.tsx
```
- Transparent on load → `background: rgba(10,12,16,0.95)` + `backdrop-filter: blur(12px)` on scroll (useScrollY)
- Logo left (SVG or text mark), CTA-Button right ("Jetzt starten")
- Framer Motion `AnimatePresence` für BG-Transition (Opacity 0→1 beim scroll)
- Mobile: hamburger icon → drawer overlay
- z-index: 100, position fixed

### `HeroSection`
```
app/components/HeroSection.tsx
```
**RECYCLE:** Hero-Composition-Pattern aus LEN-117 (full-viewport, overlay, stagger-in)
- `min-height: 100dvh`, relative container
- `<Image>` als Hintergrund (fill, `hero-bg-full` slot)
- Content: Headline (h1, `clamp(2.8rem, 5.5vw, 4.5rem)`, weight 800) → Subheadline (p, 1.25rem, opacity 0.75) → 2 CTAs
- Primary CTA: `#3a6fd8` Button → `href="#cta"` (smooth scroll)
- Secondary CTA: Ghost-Button mit border `rgba(255,255,255,0.25)` → `href="#process"` ("Wie es funktioniert")
- Animation: stagger (headline 0s → subhead 0.15s → CTAs 0.3s), all `y: 24 → 0, opacity: 0 → 1`

### `TrustStrip`
```
app/components/TrustStrip.tsx
```
- Thin section: `padding: 1.5rem 0`, `border-top/bottom: 1px solid rgba(255,255,255,0.08)`
- 4 items flex-row, gap 2rem, `justify-content: center`
- Items: stat-text oder placeholder für Partnerlogos (grayscale)
- Default stats (bis echte Logos/Zahlen kommen — Carlos validiert):
  - "150+ Hausverwaltungen" ← Carlos bestätigt Kundenzahl
  - "Ø 28% Kostenersparnis" ← ⚠️ VALIDATION NEEDED: Carlos ersetzt durch verifizierten Wert oder entfernt
  - "< 48h Onboarding" ← Carlos bestätigt Onboarding-Zeit
  - "DSGVO-konform · Made in Germany"
- Mobile: 2×2 Grid wenn < 640px

### `ProblemSection`
```
app/components/ProblemSection.tsx
```
- Split: `display: grid; grid-template-columns: 1fr 1fr` (Desktop), 1 col (Mobile)
- Left: 3 Pain-Point-Items mit Icon + Stat-Badge + Kurztext:
  1. **Explodierende Heizkosten** — Gas +15%, Fernwärme +27% (Heizspiegel 2025, 90.000+ Gebäude)
     - Stat-Badge: `"+27% Fernwärme 2024"` in `--accent` color
  2. **CO2-Kostenlast** — Vermieter tragen bis zu 95% der CO2-Abgabe ohne Optimierung (GEG 2023)
     - Stat-Badge: `"bis 95% CO₂-Kosten"` 
  3. **Fehlerhafte Abrechnungen** — 93% aller Heizkostenabrechnungen fehlerhaft (Mineko, 34.000 Abrechnungen 2025)
     - Stat-Badge: `"93% fehlerhaft"` in warning-red `rgba(220,38,38,0.9)`
- Right: `<Image>` slot `problem-inline`
- Section-Heading: "Das kostet Hausverwaltungen täglich Geld"
- Sub-Heading: `"Verifizierte Daten. Kein Marketing."` — trust signal
- Animation: Text-Block slideIn from left, Image-Block fadeIn, both `useInView once: true`
- **Quelle-Footnote** (klein, opacity 0.4): `"Quellen: DMB Betriebskostenspiegel 2024, Heizspiegel 2025 (co2online), Mineko 2025"`

### `SolutionSection`
```
app/components/SolutionSection.tsx
```
- Split gespiegelt: Image links, Text rechts (Desktop)
- 4 Feature-Pills/Cards (2×2 grid in Text-Block):
  1. "Automatische Tarifanalyse"
  2. "Anbieterwechsel ohne Aufwand"
  3. "Echtzeit-Verbrauchsmonitoring"
  4. "Individuelle Reports"
- Section-Heading: "UtilityHub übernimmt das Komplette Energiemanagement"
- Animation: Image-Block slideIn from right, Features stagger fadeIn

### `KPIGrid` + `KPICard` + `StatCounter`
```
app/components/KPIGrid.tsx
app/components/KPICard.tsx
app/components/StatCounter.tsx
```
**RECYCLE:** Number-Counter + Dark Card aus LEN-117 (Verdienst-Tiers Sektion)

`KPIGrid`: CSS Grid `repeat(4, 1fr)` → 2×2 auf md → 1 col auf sm

`KPICard`:
- `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(58,111,216,0.25)`
- `border-radius: 12px`, `padding: 2rem`
- Hover: `border-color: rgba(58,111,216,0.6)`, `box-shadow: 0 0 24px rgba(58,111,216,0.15)`
- Props: `value`, `unit`, `label`, `prefix?`

`StatCounter`:
- `useInView({ once: true, amount: 0.5 })`
- countUp via `useEffect` + `requestAnimationFrame` (lineare Interpolation über 2000ms)
- Respektiert `prefers-reduced-motion`: zeigt Endwert sofort ohne Animation

**KPI-Werte** (Placeholder → Carlos validiert mit echten AEVUM/UtilityHub-Kundendaten):
```
{ value: 28, unit: '%', prefix: 'Ø', label: 'Durchschnittliche Kostenersparnis' }
// ⚠️ NEEDS VALIDATION: Kein externer Research-Beleg für Tarif-Switch-ROI.
// Quelle muss AEVUM-Kundendaten sein. Bei Unsicherheit → konservativer Wert (z.B. "bis zu 20%") oder weglassen.

{ value: 150, unit: '+', label: 'Hausverwaltungen vertrauen UtilityHub' }
// Internes Datum (Carlos bestätigt aktuelle Kundenzahl)

{ value: 48, unit: 'h', label: 'Bis zur ersten Optimierung' }
// Produkt-Claim (Carlos bestätigt Onboarding-Zeit)

{ value: 2.4, unit: 'M€', label: 'Gesamt gespartes Kundenbudget' }
// Internes Datum (berechnet aus Kundenbasis × Ø-Einsparung)
```

**Research-verified Alternativ-KPIs** (aus [LEN-120](/LEN/issues/LEN-120), falls Kundendaten fehlen):
```
{ value: 49, unit: '%', label: 'der Betriebskosten entfallen auf Heizung/Warmwasser' }  // DMB 2024
{ value: 93, unit: '%', label: 'aller Heizkostenabrechnungen sind fehlerhaft' }           // Mineko 2025
{ value: 27, unit: '%', label: 'Fernwärme-Kostensteigerung 2023→2024' }                  // Heizspiegel
```

### `ProcessSteps`
```
app/components/ProcessSteps.tsx
```
**RECYCLE:** Basis-Pattern aus LEN-117 (WhatsApp-Apply 3-Step), angepasst auf 4 Steps

- Horizontal auf Desktop (flex-row, connecting line via CSS `::after` pseudo), vertical auf Mobile
- 4 Steps:
  1. **Analyse** — Kostenlose Energiekosten-Analyse Ihrer Liegenschaften
  2. **Optimierung** — Wir identifizieren und verhandeln die besten Tarife
  3. **Abschluss** — Reibungsloser Wechsel, kein Aufwand für Sie
  4. **Monitoring** — Laufende Überwachung und jährliche Re-Optimierung
- Step: Circle-Badge (Nummer) + Icon + Titel + kurze Beschreibung
- Connecting line: `width: 100%`, `height: 1px`, `background: rgba(58,111,216,0.3)`, absolute positioned between badges
- Animation: stagger slideUp, 0.15s delay per step, `useInView once: true`

### `TestimonialCarousel` + `TestimonialCard`
```
app/components/TestimonialCarousel.tsx
app/components/TestimonialCard.tsx
```
`TestimonialCard`:
- `background: rgba(255,255,255,0.04)`, border, border-radius 12px
- Portrait-Image (slot `testimonial-portrait-[1-3]`, circular, 64px)
- Quote in Anführungszeichen (italic, 1.1rem)
- Name + Unternehmen (small, opacity 0.6)

`TestimonialCarousel`:
- Auto-advance every 5s, pause on hover
- Framer Motion `AnimatePresence` + `motion.div` key-based transition (`opacity + x: 20→0`)
- Dot indicators unten
- Mobile: single visible card + swipe (Framer `drag: 'x'`, `dragElastic: 0.1`)
- 3 Testimonials (Platzhalter-Texte bis echte Kundenstimmen kommen)

### `CTASection`
```
app/components/CTASection.tsx
```
- Full-width, `min-height: 60vh`, id="cta"
- BG: `<Image>` slot `cta-bg` + overlay
- Centered content: Heading + Subtext + Kontakt-Form
- Form: Name, E-Mail, Telefon (optional), Unternehmensname, Anzahl Einheiten (Select: <50, 50-200, 200-500, 500+)
- Submit → placeholder handler (CODER implementiert Email/API-Anbindung)
- OR: "Termin vereinbaren" → Calendly-Link (Carlos liefert URL)
- Button: `background: #3a6fd8`, hover: `#2d5bc4`, full-width auf Mobile
- Animation: slideUp `y: 30→0`, `useInView once: true`

### `FAQAccordion`
```
app/components/FAQAccordion.tsx
```
**RECYCLE:** Aus LEN-117 (identische Pattern, andere Fragen)

- `useState` für aktiven Index
- Klick: Toggle open/close
- Framer Motion `AnimatePresence` + `motion.div` für Content-Height-Animation (`height: 0 → auto`)
- Full-row klickbar (nicht nur Chevron)
- Chevron-Icon rotiert 0→180° bei open
- Border zwischen Items: `1px solid rgba(255,255,255,0.08)`

**FAQ-Items (Platzhalter — CODER übernimmt final Texte):**
1. "Wie schnell sehe ich erste Einsparungen?"
2. "Muss ich bestehende Verträge kündigen?"
3. "Für wie viele Liegenschaften eignet sich UtilityHub?"
4. "Wie läuft der Wechsel ab?"
5. "Ist meine Kundschaft DSGVO-sicher?"
6. "Was kostet UtilityHub?"

### `Footer`
```
app/components/Footer.tsx
```
- 3-Column Grid (Logo+Tagline / Links / Legal)
- `border-top: 1px solid rgba(255,255,255,0.08)`
- Copyright + Datenschutz + Impressum Links
- Mobile: stack single column

---

## 4. Animation-Plan

**Global Rules:**
- `once: true` auf allen `useInView`-Hooks — kein Re-Trigger beim zurückscrollen
- Kein Parallax (Performance auf Mobile)
- `prefers-reduced-motion: reduce` → alle Animationen deaktiviert, Endstate direkt
- Keine Loop-Animationen außer Carousel-Auto-Advance (pausiert auf hover/focus)
- Framer Motion `viewport={{ once: true, amount: 0.25 }}` als Standard-Config

| Section | Element | Animation | Duration | Delay |
|---------|---------|-----------|----------|-------|
| Hero | Headline h1 | `y: 24→0, opacity: 0→1` | 0.6s | 0s |
| Hero | Subheadline | `y: 24→0, opacity: 0→1` | 0.5s | 0.15s |
| Hero | CTAs | `y: 16→0, opacity: 0→1` | 0.5s | 0.30s |
| TrustStrip | Items (stagger) | `opacity: 0→1` | 0.4s | 0.1s per item |
| Problem | Text-Block | `x: -30→0, opacity: 0→1` | 0.5s | 0s |
| Problem | Image | `opacity: 0→1` | 0.6s | 0.1s |
| Solution | Image | `x: 30→0, opacity: 0→1` | 0.5s | 0s |
| Solution | Features (stagger) | `y: 16→0, opacity: 0→1` | 0.4s | 0.08s per item |
| KPICard (stagger) | Card | `scale: 0.97→1, opacity: 0→1` | 0.4s | 0.1s per card |
| StatCounter | Number | countUp 0→target | 2.0s | on inView |
| ProcessSteps (stagger) | Step | `y: 20→0, opacity: 0→1` | 0.4s | 0.15s per step |
| Testimonial | Card | `opacity: 0→1, x: 20→0` | 0.35s | 0s |
| CTA | Content Block | `y: 30→0, opacity: 0→1` | 0.5s | 0s |
| FAQ | Accordion content | `height: 0→auto` | 0.22s ease | on click |

**Standard Easing:** `easeOut` für slide-ins. `linear` für countUp. `easeInOut` für Accordion.

---

## 5. LEN-117 Recycling-Map

LEN-117 (Recruiter-Landing-Rewrite, utility-hub.one) hatte gleichen Stack. Folgende Patterns übernehmen:

| LEN-117 Pattern | Wo im LEN-117 Code | LEN-119 Einsatz | Adaptation |
|----------------|-------------------|----------------|------------|
| `NumberCounter` | Verdienst-Tiers Sektion | `StatCounter` in KPIGrid | Prop-Rename: `target` statt spezifischer Wert; Unit-Prefix/Suffix generisch |
| `FAQAccordion` | FAQ Sektion (6 Items) | FAQ Sektion (6-8 Items) | Copy as-is, nur andere Fragen |
| Hero-Composition | Sticky-Nav + Hero split | `StickyNav` + `HeroSection` | Adapt: BG-Image fill statt BG-Color; CTA-Ziel anpassen |
| `ProcessSteps` | WhatsApp-Apply 3-Step | `ProcessSteps` 4 Steps | Extend: 4. Step "Monitoring" hinzufügen; connecting-line style anpassen |
| CSS Custom Props | `--bg-primary`, `--accent` | Gleiche Token-Namen | Extend mit `--border-subtle`, `--card-bg` |
| Dark Card style | `.card` Klasse | `KPICard`, `TestimonialCard` | Same BG + border, Hover-Glow für KPICard |
| `useInView` pattern | Alle Sektionen | Alle Sektionen | `once: true`, viewport amount 0.25 |

**CODER: LEN-117 Quell-Code liegt in anderem Repo (utility-hub.one). Patterns aus LANDING-SPEC.md oder Source lesen. Kein direktes Import — reimplementieren nach obiger Spec.**

---

## 6. Mobile-Strategy

### Breakpoints
```css
:root {
  --bp-sm:  640px;   /* phones */
  --bp-md:  768px;   /* tablet portrait */
  --bp-lg: 1024px;   /* tablet landscape */
  --bp-xl: 1280px;   /* desktop */
}
```

Verwendung: CSS `@media (max-width: var(--bp-md))` — oder via Media-Queries in CSS-Modules/Inline-Styles da kein Tailwind.

### Stack-Regeln pro Section

| Section | Desktop | < 768px (Tablet/Mobile) |
|---------|---------|------------------------|
| StickyNav | Logo + Links + CTA | Logo + Hamburger (Drawer) |
| HeroSection | Full-width, text centered oder left | Text centered, Image BG (kein split) |
| TrustStrip | 4 items row | 2×2 Grid |
| ProblemSection | 50/50 Grid: Text links, Bild rechts | Stack: Bild oben, Text unten |
| SolutionSection | 50/50 Grid: Bild links, Text rechts | Stack: Bild oben, Text unten |
| KPIGrid | 4 columns | 2×2 (< 640px: 1 col) |
| ProcessSteps | Horizontal row mit connecting line | Vertical stack, line links |
| TestimonialCarousel | 3 sichtbar (oder 1 groß) | 1 sichtbar + swipe |
| CTASection | 2-col: Text links, Form rechts | Stack: Text oben, Form unten |
| FAQAccordion | max-width 800px, centered | Full-width |
| Footer | 3-col Grid | Stack 1 col |

### Touch-Targets
- **Min 48×48px** für alle interaktiven Elemente (Button, Link, FAQ-Row, Nav-Item)
- FAQ Accordion: gesamte Row klickbar, `min-height: 56px`
- Carousel Dots: `min-width: 44px; min-height: 44px; padding: 8px`
- StickyNav Links: `padding: 0.75rem 1rem` (kein Line-Height-only Sizing)
- Formulare: Input `min-height: 48px`, `font-size: 16px` (verhindert iOS-Zoom)

### Performance auf Mobile
- `<Image priority>` nur für Hero-BG und Above-the-fold Assets
- `loading="lazy"` (Next.js default) für alle Below-fold Images
- Hero-Video: nur Desktop. Mobile → Static Image (kein Autoplay-Video)
- `@media (prefers-reduced-motion: reduce)`: Alle Framer-Motion-Animationen sofort auf Endstate setzen
- Font: System-Stack oder hosted Google Font mit `font-display: swap`, kein FOIT
- `sizes` prop auf allen `<Image>` Komponenten — Hero: `"100vw"`, Split-Images: `"(max-width: 768px) 100vw, 50vw"`, Portraits: `"(max-width: 768px) 64px, 72px"`

---

## 7. CSS Custom Props (Token-Referenz)

```css
:root {
  /* Colors */
  --color-bg:          #0a0c10;
  --color-bg-card:     rgba(255, 255, 255, 0.04);
  --color-accent:      #3a6fd8;
  --color-accent-hover: #2d5bc4;
  --color-text:        #ffffff;
  --color-text-muted:  rgba(255, 255, 255, 0.60);
  --color-text-subtle: rgba(255, 255, 255, 0.40);
  --color-border:      rgba(255, 255, 255, 0.08);
  --color-border-accent: rgba(58, 111, 216, 0.25);
  --color-border-accent-hover: rgba(58, 111, 216, 0.60);

  /* Spacing */
  --section-padding-y: clamp(4rem, 8vw, 8rem);
  --container-max:     1200px;
  --container-padding: clamp(1.25rem, 4vw, 2.5rem);

  /* Typography */
  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-size-h1: clamp(2.8rem, 5.5vw, 4.5rem);
  --font-size-h2: clamp(1.8rem, 3.5vw, 2.75rem);
  --font-size-h3: clamp(1.2rem, 2vw, 1.5rem);
  --font-size-body: 1rem;
  --font-size-small: 0.875rem;

  /* Borders */
  --radius-sm:  6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* Shadows */
  --shadow-card: 0 0 24px rgba(58, 111, 216, 0.12);
  --shadow-card-hover: 0 0 36px rgba(58, 111, 216, 0.25);

  /* Transitions */
  --transition-base: 0.2s ease;
  --transition-slow: 0.4s ease;

  /* Z-Index */
  --z-nav:    100;
  --z-modal:  200;
  --z-overlay: 10;
}
```

---

## 8. File-Struktur (CODER Ziel-State)

```
app/
├── layout.tsx               # Global metadata, fonts, CSS reset
├── page.tsx                 # Section-Assembly (all imports)
├── globals.css              # CSS Custom Props + Reset + base styles
└── components/
    ├── StickyNav.tsx
    ├── HeroSection.tsx
    ├── TrustStrip.tsx
    ├── ProblemSection.tsx
    ├── SolutionSection.tsx
    ├── KPIGrid.tsx
    ├── KPICard.tsx
    ├── StatCounter.tsx
    ├── ProcessSteps.tsx
    ├── TestimonialCarousel.tsx
    ├── TestimonialCard.tsx
    ├── CTASection.tsx
    ├── FAQAccordion.tsx
    └── Footer.tsx
public/
├── images/
│   ├── hero-bg-full.jpg         # Higgsfield → 3360×1440
│   ├── problem-inline.jpg       # Higgsfield → 1200×900
│   ├── solution-inline.jpg      # Higgsfield → 1920×1080
│   ├── stats-bg.jpg             # Higgsfield → 1920×1080 (optional)
│   ├── cta-bg.jpg               # Higgsfield → 3360×1440
│   ├── testimonial-portrait-1.jpg # Higgsfield → 800×800
│   ├── testimonial-portrait-2.jpg
│   └── testimonial-portrait-3.jpg
.design/
└── SPEC.md                  # Diese Datei
```

---

## 9. Open Items / CODER-TODOs

- [ ] **KPI-Werte validieren:** Carlos bestätigt 28%-Einsparung, 150+-Kunden, 48h-Onboarding, 2.4M€-Budget → CODER ersetzt Placeholder in `KPIGrid.tsx` + `TrustStrip.tsx` mit verifizierten Werten. Bei 28%: konservative Alternative aus [LEN-120](/LEN/issues/LEN-120) nutzen wenn nicht verifizierbar.
- [ ] **CTA-Form Backend:** E-Mail-Handler oder Calendly-URL von Carlos bestätigen lassen
- [ ] **Testimonial-Texte:** Echte Kundenzitate anfordern oder mit Platzhaltern starten (markieren mit `/* TODO */`)
- [ ] **Partner-Logos TrustStrip:** Bis Logos da → Stat-Texte verwenden (bereits in Spec)
- [ ] **Higgsfield-Bilder:** Carlos generiert nach dieser Spec. CODER integriert wenn geliefert; bis dahin `Next.js Image` mit Platzhalter-BG-Color
- [ ] **Analytics:** `<Script>` für Google Analytics / Plausible (Carlos entscheidet welches Tool)
- [ ] **Meta:** SEO-Tags aus LEN-119.B (SEOGEO) werden nachgeliefert → in `layout.tsx` eintragen

---

*Spec-Version: 1.0 — 2026-05-05 — ARCHITECT (LEN-122)*
*CODER: LEN-123 pickt diese Spec. Bei Unklarheiten: Comment auf LEN-123 oder LEN-122.*
