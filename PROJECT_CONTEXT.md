# UtilityHub — Projekt Kontext

## Was ist UtilityHub?
UtilityHub ist ein internes **Data Hub** für Energiedaten, Objektverwaltung und Provisionsnachverfolgung.
Es ist **kein CRM**. Kein Sales-Pipeline-Denken, keine Kundenbeziehungslogik erfinden.

---

## Framework & Stack
- **Next.js 16 App Router** — kein `src/`-Verzeichnis, alles direkt unter `app/`
- **Supabase** — PostgreSQL, RLS, Storage, Server Client (RLS-aware) + Admin Client (bypass RLS)
- **Kein shadcn/ui** — das Projekt nutzt eigene Komponenten, CSS-Variablen und inline CSS
- Styles laufen über: bestehende Komponenten in `components/`, CSS-Variablen (`var(--space-*)`, `var(--text-*)`, `var(--surface)`, etc.) und inline `style={{}}`-Props
- Keine externe UI-Bibliothek einführen ohne expliziten Auftrag

---

## Verzeichnisstruktur (wichtig)

```
app/
  app/          ← interne Mitarbeiter-App (auth-geschützt)
  portal/       ← separates Kundenportal (eigene Auth, eigenes Layout)
  api/          ← API-Routen
  login/        ← Login-Seite
  layout.tsx    ← Root-Layout
  page.tsx      ← Landingpage / Redirect
```

### Interne App: app/app/...
Alle Mitarbeiterseiten liegen unter `app/app/`. Die Sidebar-Navigation und das Layout sind in `app/app/layout.tsx` definiert.

### Kundenportal: app/portal/...
Separates Portal für Kunden. Eigenes Layout (`app/portal/layout.tsx`). Unabhängig von der internen App.

---

## Seitenstruktur — interner Bereich

| Route (URL)             | Datei                                      | Status         | Hinweis |
|-------------------------|--------------------------------------------|----------------|---------|
| `/app/dashboard`        | `app/app/dashboard/page.tsx`               | ✅ fertig      | KPI-Übersicht, letzter Import, zuletzt hinzugefügte Objekte |
| `/app/customers`        | `app/app/customers/page.tsx`               | ✅ fertig      | Objekte-Liste mit Filtern, Pagination, Export |
| `/app/customers/[id]`   | `app/app/customers/[id]/page.tsx`          | ✅ fertig      | Objektdetail: Stammdaten, Teleson, FG Finanz, Dokumente, Potenziale, Notizen |
| `/app/opportunities`    | `app/app/opportunities/page.tsx`           | ✅ fertig      | **Fachlich: FG Finanz** (nicht umbenennen, Route bleibt) — zeigt Upsell-Potenziale |
| `/app/imports`          | `app/app/imports/page.tsx`                 | ✅ fertig      | CSV-Import (Teleson, FG Finanz), Notion-Sync, Batch-Übersicht |
| `/app/documents`        | `app/app/documents/page.tsx`               | ⏳ Placeholder | "In Entwicklung" — noch keine echte Funktionalität |
| `/app/incentives`       | `app/app/incentives/page.tsx`              | ⏳ Placeholder | "In Entwicklung" |
| `/app/settings`         | `app/app/settings/page.tsx`               | ⚠ vorhanden   | Seite existiert, Umfang prüfen |
| `/app/support`          | `app/app/support/page.tsx`                | ⏳ Placeholder | "Wird demnächst eingerichtet" |
| `/app/organizations`    | `app/app/organizations/page.tsx`           | ⚠ vorhanden   | Nicht in Haupt-Nav, aber Seite existiert |
| `/app/reports`          | `app/app/reports/page.tsx`                 | ⚠ vorhanden   | Nicht in Haupt-Nav, aber Seite existiert |

### Fachliche Hinweise
- `/app/opportunities` heißt in der Sidebar und UI **"FG Finanz"** — der URL-Pfad bleibt `opportunities`
- Objektseiten heißen intern **"Objekte"**, nicht "Kunden" (auch wenn die Route `customers` lautet)

---

## Seitenstruktur — Kundenportal

| Route (URL)             | Datei                                      | Status         |
|-------------------------|--------------------------------------------|----------------|
| `/portal/dashboard`     | `app/portal/dashboard/page.tsx`            | ⚠ vorhanden   |
| `/portal/documents`     | `app/portal/documents/page.tsx`            | ⚠ vorhanden   |

---

## Sidebar-Navigation (interne App)
Reihenfolge und Labels (Stand: aktuell):
1. Dashboard → `/app/dashboard`
2. Objekte → `/app/customers`
3. FG Finanz → `/app/opportunities`
4. Incentives → `/app/incentives`
5. Imports → `/app/imports`
6. Dokumente → `/app/documents`
7. Einstellungen → `/app/settings`
8. Support → `/app/support`

---

## Arbeitsweise — Pflichtregeln

- **Step by step**: immer nur einen klar abgegrenzten Schritt auf einmal umsetzen
- **Kein Großrefactor** ohne expliziten Auftrag
- **Keine neuen Datenmodelle / Migrationen** ohne expliziten Auftrag
- **Keine neuen UI-Bibliotheken** einführen
- **Keine Sync-Architektur / n8n / externe Dienste** erfinden
- **Kein Umbau des Kundenportals** ohne expliziten Auftrag
- Bestehende Struktur (`app/app/...`) beibehalten
- Leere Zustände sauber behandeln statt halbfertige Logik bauen
- UtilityHub ist ein **Data Hub** — keine CRM-Features, keine Sales-Pipeline erfinden
