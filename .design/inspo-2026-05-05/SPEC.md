# UH Revisions 2026-05-05

**Source:** Carlos Brain-Dump nach LEN-107/108/109 Review
**Inspo-Bild:** `./portal-dashboard-target.jpeg` — Miguel-approved Customer-Portal-Layout
**Logo:** `./utilityhub-logo.jpeg` — UH Logo (uh + UTILITYHUB Text)

---

## ✅ LEN-108 Login (done) — keine weitere Arbeit

---

## 🧹 Section A — Generelles Cleanup

### A1. Dashboard (Admin) — Aging-Counter raus
**File:** `app/dashboard/page.tsx`
**Change:** Den "Objekt-Alter" / Aging-Counter aus dem Dashboard entfernen. Carlos braucht das so nicht.

### A2. Dashboard (Admin) — Roadmap-Widget raus
**File:** `app/dashboard/page.tsx` (+ `app/roadmap/constants.ts` ggf weg)
**Change:** Roadmap-Widget aus Dashboard entfernen. "nice aber unnötig für später".

---

## 🛠️ Section B — Admin-Bereich

### B1. Objekt-Detail-Ansicht Stammdaten raus
**File:** `app/app/customers/[id]/page.tsx` (oder vergleichbar Object-Detail)
**Change:** "Stammdaten" Section komplett rausnehmen. Restliche Tabs/Sections bleiben.

---

## 👥 Section C — Kundenansicht (Portal)

**Pfad-Basis:** `app/portal/*`

### C1. Sidebar Cleanup
- "Incentives" → komplett raus
- "Einstellungen" → komplett raus
- "Dokumente" → komplett raus (ist eh in Objekt-Detail-Ansicht erreichbar)

### C2. Sidebar nach Inspo (siehe `portal-dashboard-target.jpeg`)
Final Sidebar-Items (in Reihenfolge):
1. Dashboard
2. Objekte
3. Verträge
4. Dokumente *(im Inspo-Bild noch drin — entscheide ob Sidebar oder nicht; Carlos sagt sidebar weg, aber Inspo zeigt es. Default: sidebar weg, da Carlos's Wunsch primary)*
5. Support

→ Active-State: blauer Highlight wie im Inspo (siehe "Dashboard"-Item in dsahboard inspo).

### C3. Support-Page Layout (war "Ansprechpartner")
**File:** `app/portal/support/page.tsx` (oder vergleichbar)

**Layout:** 2-Spalten-Split
- **Linke Spalte (kleinere, ~40%)**: 2 Karten untereinander
  - Karte 1: **Tufan** (Bild größer als bisher)
  - Karte 2: **David** (Bild größer als bisher)
- **Rechte Spalte (größere, ~60%)**: 1 große Karte
  - **Miguel** (Hauptansprechpartner)

→ Bilder generell deutlich größer als aktuell.

### C4. Logo sinnvoll einbetten
**Datei:** `./utilityhub-logo.jpeg` ist Asset-Source (in `.design/inspo-2026-05-05/`)
**Aktion:** Logo in Sidebar-Header (links oben), wie im Inspo:
- Blauer Quadrat-Container mit "uh"-Glyph
- Daneben Text "UTILITY HUB" (light + bold mix)
- Sidebar-Header bleibt sticky beim Scrollen

→ Asset ggf nach `public/logo.png` oder `public/logo.svg` konvertieren.

### C5. Profile-Icon Hover-Popup (top-right)
**Aktuelles Verhalten:** unklar
**Soll:**
- Profile-Icon oben rechts (rund, wie im Inspo)
- **Hover öffnet Dropdown** mit:
  - "Einstellungen"
  - "Abmelden"
- Klick außerhalb schließt Dropdown.

### C6. Account-Login unten rechts → weg
Aktuell unten rechts irgendein "Account / Login" Element → **komplett entfernen**.

### C7. Dokumente-Upload-Box größer (linke Sidebar-Bereich, unten)
**Aktuell:** kleine Drop-Zone
**Soll:** wie im Inspo (`portal-dashboard-target.jpeg`, links unten):
- Großes gestricheltes Card mit Cloud-Upload-Icon
- Text: "Dateien hierher ziehen — oder klicken"
- Soll den verfügbaren Platz nutzen (Sidebar unten füllen)

---

## 📐 Section D — Portal-Dashboard Re-Design (laut Inspo)

**Inspo:** `./portal-dashboard-target.jpeg` — "Miguel meinte es soll genau so aussehen"

### D1. Top-Section: 4 KPI-Cards horizontal
1. **Strom** — Bolt-Icon + Zahl (z.B. 47) + "Lieferstellen"
2. **Gas** — Flame-Icon + Zahl + "Lieferstellen"
3. **Versicherung** — Shield-Icon + Zahl + "Objekte"
4. **Großes Card** (rechts): "X Objekte | Y Lieferstellen, Alle koordiniert, Alle Verträge optimiert ✓ 100%" mit Progress-Bar

### D2. Mitte: "Objekte Übersicht" Tabelle
Columns: Objekt (mit Thumbnail-Bild) | Adresse | Strom-Tarif | Gas-Tarif | Status (Aktiv-Badge) | Lieferstelle (DE-Code) | Chevron-rechts

Pagination unten mittig (1, 2, ...).

### D3. Theme: Dark Mode (wie Inspo)
Sehr dunkler Hintergrund (#0a0a0f-ish), Cards leicht heller, Akzent-Blau für Highlights, Status-Grün für "Aktiv".

---

## 🎯 Acceptance-Kriterien

- [ ] LEN-107 Aging-Counter + Roadmap-Widget aus Dashboard
- [ ] Admin Objekt-Detail Stammdaten raus
- [ ] Portal Sidebar nur: Dashboard, Objekte, Verträge, Support (+ optional Dokumente per Carlos's Default-No)
- [ ] Support-Page mit 2/3-Layout (Tufan+David / Miguel)
- [ ] Logo in Sidebar-Header (uh-Box + UTILITYHUB Text)
- [ ] Profile-Hover-Popup mit Einstellungen + Abmelden
- [ ] Account-Login unten rechts weg
- [ ] Doc-Upload-Box vergrößert
- [ ] Portal-Dashboard nach Inspo (4 KPI-Cards + Tabelle)
- [ ] `npm run build` läuft ohne neue Errors (pre-existing TS-Error in `nudge-inactive` darf bleiben)
- [ ] Browser-Test http://localhost:3000/portal/* visual-OK

## Carlos's Verifikations-Pfad

1. CODER pushed Commits in main
2. Notifier sendet "done"-Ping an Carlos
3. Carlos öffnet http://localhost:3000/portal → visual-Check
4. Bei OK → close Issue
5. Bei NOT-OK → Reply via NEXUS-Bot mit Konkret-Hinweisen
