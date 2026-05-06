# UH Landing Page — Komplett-Umbau (10k UI)

**Issue:** LEN-117
**Source:** Carlos's Brain-Dump 2026-05-05
**Live-URL:** https://utility-hub.one/
**File:** `app/page.tsx` (Recruiter-Setter-Landing für utility-hub.one)
**Vercel-Project:** `utility-hub-dashboard` (auto-deploy bei push to `main`)

---

## Mission

> "Kompletter Umbau. Inhalt der Texte sinngemäß behalten. UI auf 10k heben. Farben visuell anpassen. Effekte einfügen aber dezent."

**Heißt konkret:**
- Content stays thematically (Setter-Recruiting, WhatsApp-Apply, Verdienst-Range, FAQ)
- Visual rewrite from scratch — nicht inkrementell
- Premium-Aesthetic, distinctive (kein generic AI-Vibe)
- Subtle Motion, kein Overdone

---

## Aktueller Stand

- 1246 LoC Single-File (`app/page.tsx`)
- Dark Theme schon da: BG `#0a0c10`, Primary `#3a6fd8` (Blue)
- Plus Jakarta Sans Font
- Framer Motion `^12.38.0` ist verfügbar
- Sticky-Header mit Backdrop-Blur
- WhatsApp-CTA: `https://wa.me/message/5GX3UQXT4OO6B1`

## Content-Kernaussagen (thematisch behalten)

1. **Hero:** "Werde Setter — flexibel, ohne Vertriebs-Erfahrung"
2. **Verdienst-Stage:** Einsteiger 500-1.200 €/Mo · Aktiv 1.500-3.000 € · Top 3.500 €+
3. **Wie läuft's:** Bewerbung via WhatsApp-Sprachnachricht, kein Lebenslauf
4. **Was bekommst du:** CRM, Leadlisten, Skripte, Onboarding
5. **Time-Commitment:** flexibel ab 10-15h/Woche
6. **Long-Term-Path:** bessere Listen → Coaching → Festanstellung
7. **6 FAQs** (siehe `faqItems` Array in Code)

→ Wording sinngemäß, nicht 1:1 copy. Schärfer, präziser, weniger Floskeln.

---

## Design-Direction (10k UI)

### Brand-Farben
- **Bleiben:** Dark BG (`#0a0c10`), Blue Accent (`#3a6fd8`)
- **Erweitern:** Tiefere Blautöne als Layered-Surface (Navy/Indigo Mix), warmes Gold/Amber als Money-Highlight bei Verdienst-Section
- **Konsistenz:** Blue-Akzent matched mit Customer-Portal-Inspo (`portal-dashboard-target.jpeg`)

### Typografie
- Plus Jakarta Sans bleiben (gut)
- Hero-Heading: Mega-Scale (clamp 3rem → 7rem), Tight Letter-Spacing, Mix Bold + Light für Visual Rhythm
- Body: Smaller, restrained, generous line-height
- Numerik (Verdienst, Stunden): Tabular-Nums, Display-Style

### Layout-Composition (10k Move)
- **Hero:** Big-Statement-First, generous whitespace, optional Background-Effect (grain texture, subtle gradient-mesh, oder thin animated gradient stroke). KEINE generic Halo-Glows.
- **Verdienst-Stage:** 3 Tier-Cards horizontal, mit Animated-Number-Reveal (Framer Motion useInView + count-up)
- **Process-Steps:** numbered 1-2-3, vertical-left rail oder horizontal-stepper
- **What-You-Get:** Icon-Grid mit Hover-Lift (subtle), evtl. 6 items in 3x2
- **FAQ:** Accordion, smooth height-transition, Plus→X Icon-Morph
- **Final-CTA:** Big WhatsApp-Card, sticky-bottom oder Hero-Echo

### Effekte (dezent)
- Scroll-Reveal: Fade-up-on-enter (Framer Motion `useInView`, `whileInView`)
- Card-Hover: subtle border-brightness + lift 2-4px (existing `card-lift` pattern)
- Number-Counter: bei View Verdienst-Tiers von 0 hochzählen (1-2 Sek)
- Cursor-Hover-Glow: optional, nur wenn unaufdringlich
- **NEIN:** keine bouncing badges, keine Confetti, keine vibrating buttons

### Motion-Library
- Framer Motion bereits installiert
- Pattern: `motion.div` mit `initial`/`whileInView`/`viewport={{once:true}}`
- Transition: `cubic-bezier(0.16,1,0.3,1)` (matches existing `--transition`)

---

## Komposition (Section-Struktur Vorschlag)

```
[Sticky Nav] Logo (uh + UTILITYHUB) · WhatsApp-CTA-Button
↓
[Hero] Mega-Heading + Sub-Statement + Primary CTA (WhatsApp) + Secondary (Scroll-Hint)
↓
[Trust-Strip] 3 Mikro-Stats (z.B. "X aktive Setter · Y € durchschn. Verdienst · Z Tage Onboarding")
↓
[Verdienst-Tiers] 3 Cards (Einsteiger / Aktiv / Top) mit Number-Counter
↓
[Process Steps] 1. Sprachnachricht senden → 2. Kennenlernen → 3. Onboarding → 4. Verdienen
↓
[What-You-Get Grid] 6 Tools/Support Items mit Icons
↓
[FAQ Accordion]
↓
[Final-CTA] Big WhatsApp-Section
↓
[Footer] minimal: Impressum-Link, Datenschutz, Logo
```

→ CODER darf reorganisieren wenn überzeugend.

---

## Acceptance-Kriterien

- [ ] `app/page.tsx` neu strukturiert, Content sinngemäß übernommen (alle 6 FAQs, Verdienst-Range, Time-Commitment, Long-Term-Path)
- [ ] WhatsApp-CTA bleibt funktional (`WA_URL`)
- [ ] Framer Motion Scroll-Reveals dezent (max 1 Effekt pro Section, nicht stacked)
- [ ] Number-Counter für Verdienst-Tiers
- [ ] Mobile-Responsive (Carlos öffnet auch auf Smartphone)
- [ ] No Layout-Shift bei Scroll
- [ ] Lighthouse-Performance bleibt ≥ 85 (Mobile)
- [ ] `npm run build` clean (pre-existing nudge-inactive Error darf bleiben)
- [ ] `git push origin main` → Vercel auto-deploys → utility-hub.one shows new

---

## Carlos's Verifikations-Pfad

1. CODER pushed Commits in `main`
2. Vercel auto-deploys (warte ~2-3 Min)
3. Notifier sendet "done"-Ping an Carlos
4. Carlos öffnet **https://utility-hub.one/** → visual-Check Mobile + Desktop
5. Bei OK → close Issue
6. Bei NOT-OK → Reply via NEXUS-Bot mit Konkret-Hinweisen ("Hero zu groß", "Number-Counter zu schnell", etc.)

---

## Stack-Hinweise

- **Next.js 16.2.4** (gerade upgraded via `pnpm add next@latest`)
- **Framer Motion ^12.38.0** vorhanden
- **CSS Custom Props** statt Tailwind (siehe `app/globals.css`)
- **Plus Jakarta Sans** Font (loaded via `app/layout.tsx`)
- **Sticky-Header-Pattern** etabliert (siehe Zeilen 69-110)

## Don't

- Keine neuen Heavy-Dependencies (kein Lottie, kein WebGL, kein Three.js)
- Keine Tailwind-Conversion (Stack ist CSS-Custom-Props-basiert)
- Keine Cookies/Trackers neu einbauen
- Keine Skript-Bibliotheken die ESM-Probleme machen
