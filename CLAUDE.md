@AGENTS.md

# UtilityHub — Projektkontext für Claude Code

## Zweck

UtilityHub ist ein internes Data Hub für ein Energieberatungsunternehmen. Es verwaltet Kundendaten aus dem Teleson-Vertriebssystem, ermöglicht strukturierte Importe aus Notion und CSV, und stellt Mitarbeitern eine Übersicht über Kunden, Verträge und Import-Batches bereit. Es gibt kein Kundenportal (noch nicht aktiv).

---

## Stack

| Schicht | Technologie |
|---|---|
| Framework | Next.js 16.2 (App Router, React 19, TypeScript 5) |
| Datenbank | Supabase (PostgreSQL, RLS, Auth) |
| Auth-Client | `@supabase/ssr` — SSR-Client für Server Components, Admin-Client (Service Role) für Import-Routes |
| Styling | TailwindCSS 4 + CSS Custom Properties (`var(--space-*)`, `var(--text-*)`, `var(--radius-*)`) |
| Session | `middleware.ts` im Root ruft `updateSession` auf (Supabase-Session-Refresh) |

---

## Wichtigste Tabellen

| Tabelle | Zweck |
|---|---|
| `organizations` | Übergeordnete Ebene: Hausverwaltungen, Bestandshalter etc. `org_type`: `hausverwaltung / bestandshalter / privat / sonstige`. |
| `customers` | Objekte/Kunden. `status`: `active / inactive / blocked / pending`. `organization_id` FK → `organizations`. `object_type`: `weg / mfh / efh / gewerbe / sonstige`. |
| `customer_identities` | Externe IDs pro Kunde. Unique auf `(system, external_id)`. Systeme: `teleson` (KNR), `malo` (MALO), `weg` (WEG-Adresse, nur Notion-Importe). |
| `teleson_records` | Einzelne Vertragsdatensätze. FK → `customers`. Ein Kunde kann mehrere Records haben (z.B. Strom + Gas). |
| `import_batches` | Protokoll jedes Imports. `error_log` (JSONB) enthält `{summary: {imported, skipped_metadata, skipped_incomplete, errors}, skipped[], errors[]}`. |
| `customer_notes` | Interne Notizen. `author_id` → `profiles.id` (FK, `ON DELETE SET NULL`). `is_internal: true` immer. |
| `profiles` | Auth-User-Profile. `role`: `admin / staff / customer`. Helper-Funktion `get_my_role()` in DB. |

RLS ist auf allen Tabellen aktiv. Admin/Staff haben vollen Zugriff auf `customer_notes`, `customers`, `teleson_records`, `organizations`. Import-Routes verwenden den Admin-Client (Service Role, umgeht RLS).

### Organisations-Hierarchie (Migration 016)

```
organizations (Hausverwaltung Pfafflinger GmbH)
└── customers / Objekte (object_type=weg|mfh|efh|gewerbe|sonstige)
    ├── customer_identities (KNR, MALO, WEG)
    └── teleson_records (Strom, Gas, ...)
```

- `customers.organization_id` nullable → alle alten Einträge bleiben gültig
- `customers.object_type` nullable → WEG-Backfill via Migration 016 (JOIN auf `customer_identities WHERE system='weg'`)
- Import: Spalte `Hausverwaltung` / `Organisation` im CSV/Notion → auto-lookup oder -create der Organization
- `ProcessOptions.organizationName` — batch-level override in `processRows()`

---

## Notion — Rolle und Grenzen

- Notion ist **ausschließlich Import-/Referenzquelle**, kein führendes System.
- **Kein Schreibzugriff zurück nach Notion**, kein bidirektionaler Sync, kein MCP.
- Notion-Importe nutzen `useWegIdentity: true` → WEG-Adresse als drittes Identitätssystem (`system="weg"`).
- CSV-Importe nutzen WEG **nicht** als Identity (dort = Vertriebskanal, nicht eindeutige Adresse).

---

## Implementierte Features

### Import (`/app/imports`)

- **CSV/JSON-Upload** (`POST /api/import/teleson`): FormData, max 10 MB, `.csv` / `.json`. Fallback auf Legacy JSON-Body `{rows, filename}`.
- **Notion-Import** (`GET/POST /api/notion/import`): GET = Verbindungstest, POST = vollständiger Import aus verknüpfter DB (`NOTION_DATABASE_ID`).
- **Shared Import-Logik** in `lib/teleson/importRows.ts`:
  - `mapRow()` — normalisiert Raw-Zeilen auf Schema (50+ Spalten-Aliases). `neu_ap` wird als `num()` gemappt (Zahl, nicht Rohstring).
  - `processRows()` — deduplication via `customer_identities` + Pre-Check auf `teleson_records`, Skip-Regeln, DB-Writes.
  - Skip Rule 1 (aktiv): kein KNR + kein MALO + kein Energie → Metadaten-/Legende-Zeile, wird übersprungen.
  - Skip Rule 2 (reserviert, immer 0): Platzhalter für zukünftige unvollständige Zeilen.
  - `buildBatchErrorLog()` — strukturierter JSONB-Log für `import_batches.error_log`.
  - **Deduplication-Verhalten** (Re-Import-Sicherheit):
    - `teleson_records` werden idempotent per KNR (primär) → MALO (Fallback) ge-upserted.
    - CSV: WEG wird **nicht** als Dedup-Key verwendet (= Vertriebskanal, nicht eindeutig). Rows ohne KNR/MALO werden immer neu inserted.
    - Notion (`useWegIdentity: true`): WEG zusätzlich als Identity in `customer_identities` → WEG-Lookup greift in Schritt 1 (Customer-Lookup), nicht beim Record-Upsert.
  - **⚠ Pflicht-Migration: `014_teleson_neu_ap_numeric.sql`** muss im Supabase SQL-Editor ausgeführt werden. Konvertiert `teleson_records.neu_ap` von TEXT zu NUMERIC(8,4). Bis zur Ausführung funktioniert der Import korrekt, aber das DB-Schema bleibt inkonsistent.
  - **⚠ Pflicht-Migration: `016_organizations.sql`** muss ausgeführt werden, bevor Organisations-/Objekttyp-Felder in der DB verfügbar sind. Erstellt `organizations`-Tabelle, ergänzt `customers.organization_id` + `customers.object_type`, backfilled WEG-Objekte.
  - **Organisation-Linking im Import**: `mapRow()` liest Spalte `Hausverwaltung` / `Organisation` aus Rohdaten → `organization_name`. `processRows()` sucht Organisation per ILIKE-Name, legt sie neu an (org_type=hausverwaltung) wenn nicht gefunden. `ProcessOptions.organizationName` erlaubt batch-level Zuweisung.
- **Import-History** auf der Seite zeigt: Kanal-Badge (NOTION/DATEI), Dateiname, Gesamt, Importiert, Übersprungen, Fehler aus `error_log.summary`.

### Kundenliste (`/app/customers`)

- **Server Component** (`page.tsx`) liest `searchParams`: `q` (Suche), `status` (Filter), `page` (Pagination).
- **Suche**: Server-seitig — `customers.full_name` ILIKE + separater Query auf `customer_identities.external_id` (KNR, MALO, WEG) → kombinierter OR-Filter.
- **Status-Filter**: Pill-Buttons (Alle / Aktiv / Inaktiv / Gesperrt / Ausstehend), als URL-Param, validiert gegen Allowlist vor DB-Query.
- **Pagination**: Offset-basiert, 25 pro Seite, `.range(from, to)`.
- Alle drei (Suche + Filter + Pagination) arbeiten zusammen: `pageUrl(q, status, page)` trägt alle drei Params in jeden Link.
- **Client Component** `CustomersTable.tsx` rendert Search-Input mit 350ms Debounce → `router.push`, Filter-Pills als `<a>`-Links, Prev/Next.
- `key={q}` auf `CustomersTable` → Remount bei Such-Wechsel (reset des Input-State).

### WEG-Kunden

WEG-Kunden = aus Notion importierte Immobilien/Gebäude-Einträge ohne Personenname.

- Erkennung: `customer_identities.system === "weg"` vorhanden.
- `full_name` = WEG-Adresse (z.B. "Bad Füssing / Hibinger Str. 10a") — das ist korrekt und wird so angezeigt.
- In der **Liste**: kleines graues `WEG`-Pill neben dem Namen; Kontaktspalten (E-Mail/Telefon/Stadt/PLZ) auf `opacity: 0.4` gedimmt (immer leer).
- In der **Detailseite**: `WEG`-Badge im Header; Stammdaten-Sektion wird ausgeblendet wenn alle Kontaktfelder null; Teleson-Records-Tabelle ohne `Weg`-Spalte (wäre Wiederholung des H1); Meta-Zeile (Quelle/Datum) am Seitenende.
- Ein Kunde kann mehrere Teleson-Records haben (z.B. Strom + Gas) und mehrere KNR-Identities.

### Kundendetail (`/app/customers/[id]`)

- Liest parallel: `customers`, `customer_identities`, `teleson_records`, `customer_notes` (inkl. `author:profiles!author_id(full_name)`).
- **Energie-Badges**: Strom=blau, Gas=orange, Wärme=rot, Wasser=grün, Sonstiges=grau.
- **Statusbearbeitung**: `StatusSelect` Client Component — `<select>` in Badge-Optik, Server Action `updateCustomerStatus` (Allowlist-Validierung, `revalidatePath`).
- **Notizfunktion**: Server Action `addCustomerNote` (in `actions.ts`) — schreibt in `customer_notes` mit `author_id: user.id`, `is_internal: true`. Feld heißt `author_id` (nicht `created_by`!). Nach Save: `revalidatePath` → Seite lädt neue Notizen. Anzeige zeigt Inhalt + "Verfasst von: [Name]" + Datum/Uhrzeit.

### Dashboard (`/app/dashboard`)

- Kennzahlen: Kunden gesamt, Aktive Kunden (+ %-Anteil), Teleson-Datensätze, Upsell offen.
- Letzter Import: Kanal-Badge, Dateiname, Gesamt/Importiert/Übersprungen/Fehler (aus `error_log.summary`), Fehlerquote (%), Zeitstempel.
- Tabelle der 8 zuletzt angelegten Kunden.

---

### Dokumente & Google Drive (`/app/customers/[id]` → Dokumente-Sektion)

- **CSV vs. Dokument-Trennung**: CSV/JSON → `/api/import/teleson` (Daten-Pipeline). PDFs/Dateien → `/api/documents/upload` (Datei-Anhang).
- **Supabase Storage**: Bucket `customer-documents` (privat, max 50 MB, PDF/Bild/Word/Excel/CSV). Path-Schema: `{customerId}/{timestamp}-{filename}`.
- **API-Routen**:
  - `POST /api/documents/upload` — Datei-Upload (FormData: `file`, `customer_id`, optional `name`). Auth: admin/staff.
  - `GET /api/documents/[id]` — Auth-gesicherter Download via 1h Signed URL → Redirect.
  - `DELETE /api/documents/[id]` — Löscht Storage-Datei + DB-Eintrag.
- **`customer_documents`-Tabelle**: `source ∈ {supabase_storage, google_drive, external_url}`. Integrity-Check via DB CONSTRAINT.
- **Helpers**: `lib/documents/storage.ts` — `uploadToStorage`, `createSignedUrl`, `deleteFromStorage`, `formatBytes`.

#### ⚠ Pflicht-Setup: Supabase Storage Bucket

Migration `015_storage_bucket.sql` **muss einmalig ausgeführt werden** bevor Uploads möglich sind.

```
Supabase Dashboard → SQL Editor → 015_storage_bucket.sql einfügen → Run
```

Ohne diese Migration: Upload/Download gibt HTTP 503 mit Hinweis "Storage-Bucket fehlt".  
Nach Ausführung: Upload, Download und Löschen auf `/app/customers/[id]` → Dokumente-Sektion funktionieren.

#### Google Drive Setup (vorbereitet, noch nicht live)

Client: `lib/google-drive/client.ts` — fetch-basiert, kein externes Paket. Funktionen: `isConfigured()`, `listFiles(folderId)`, `downloadFile(fileId)`, `uploadFile(...)`, `getViewUrl(fileId)`.

**Einmalige Setup-Schritte:**

1. [GCP Console](https://console.cloud.google.com) → IAM & Admin → Dienstkonten → Neues Dienstkonto erstellen
2. Schlüssel erstellen (JSON) → herunterladen
3. Google Drive API aktivieren (APIs & Dienste → Bibliothek → "Google Drive API")
4. Den gewünschten Drive-Ordner für Imports mit der `client_email` aus dem JSON teilen (Berechtigung: Betrachter oder Bearbeiter)
5. Den gewünschten Drive-Ordner für Dokumente mit der `client_email` teilen (Berechtigung: Bearbeiter)
6. In `.env.local` setzen:
   ```
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","client_email":"...","private_key":"..."}
   GOOGLE_DRIVE_IMPORT_FOLDER_ID=<Ordner-ID aus Drive-URL>
   GOOGLE_DRIVE_DOCUMENTS_FOLDER_ID=<Ordner-ID aus Drive-URL>
   ```
   Die Ordner-ID steht in der Drive-URL nach `/folders/`.

Nach diesem Setup sind `listFiles()` und `downloadFile()` sofort nutzbar (z.B. für Teleson-CSV-Import aus Drive).

---

### Export

- **CSV-Exporte** (Auth: admin/staff):
  - `GET /api/export/customers` — alle Kunden mit KNR/MALO/WEG-Identities. Optional: `?status=active|inactive|blocked|pending`. Dateiname: `kunden[-status]-YYYY-MM-DD.csv`.
  - `GET /api/export/teleson` — alle Teleson-Datensätze mit Kundennamen. Optional: `?energie=Strom&status=beliefert`. Dateiname: `teleson[-filter]-YYYY-MM-DD.csv`.
  - Beide: UTF-8 BOM (Excel-kompatibel), RFC 4180 escaping, HTTP 404 bei leerem Ergebnis.
  - Export-Buttons in `/app/customers` Toolbar: „↓ Kunden CSV" und „↓ Teleson CSV" — übergeben aktive Status- bzw. Energie-Filter an die API.
- **PDF/Druckansicht** (`lib/export/csv.ts`, kein externes Package):
  - `GET /app/customers/[id]/print` — druckoptimierte HTML-Seite mit: Stammdaten-Grid, Teleson-Tabelle (inkl. Preisvergleich, Grund/Info-Zeilen), Dokumentenliste. „Drucken / Als PDF speichern"-Button öffnet Browser-Druckdialog.
  - Link „Drucken / PDF ↗" im Breadcrumb jeder Kundendetailseite.
  - Print-CSS: `.no-print` ausgeblendet, saubere Typografie, page-break-inside: avoid auf `<tr>`.
- **CSV-Helper**: `lib/export/csv.ts` — `buildCsv(headers, rows)`, `csvHeaders(filename)`, RFC 4180 escaping.

---

## Projektstand (Stand: 2026-04-28)

### Bereits umgesetzt

| Bereich | Status |
|---|---|
| Teleson CSV/JSON-Import (dedup, idempotent, Batch-Log) | ✅ stabil |
| Notion-Import (WEG-Identity, useWegIdentity) | ✅ stabil |
| Kundenliste mit Suche, Filter (Status, Energie, Org, Objekttyp), Pagination | ✅ |
| Kundendetail mit Teleson-Tabelle, Status-Edit, Notizen, Dokumente | ✅ |
| Organisations-Hierarchie (organizations-Tabelle, organization_id + object_type auf customers) | ✅ Code, ⚠ Migration 016 ausstehend |
| Organisations-Übersicht `/app/organizations` + Detailseite `/app/organizations/[id]` | ✅ Code, ⚠ Migration 016 ausstehend |
| Import erkennt Spalte „Hausverwaltung" → auto-link zu Organization | ✅ Code, ⚠ Migration 016 ausstehend |
| Supabase Storage für Kundendokumente (Upload/Download/Delete) | ✅ Code, ⚠ Migration 015 ausstehend |
| Google Drive Client vorbereitet (kein externes Package) | ✅ vorbereitet, fehlt: Credentials in .env.local |
| CSV-Exporte (Kunden + Teleson, UTF-8 BOM, RFC 4180) | ✅ |
| PDF/Druckansicht `/app/customers/[id]/print` | ✅ |
| Dashboard mit Kennzahlen und letztem Import | ✅ |
| `teleson_records.neu_ap` NUMERIC-Konvertierung | ✅ Code, ⚠ Migration 014 ausstehend |

### Noch offen

- **Migrations 014, 015, 016 ausführen** (manuell im Supabase SQL Editor — siehe unten)
- `customers.status`-Constraint fehlt `'pending'` (Diskrepanz: Code nutzt es, DB-CHECK erlaubt es nicht) → Migration 017 nötig
- Google Drive Credentials in `.env.local` eintragen (GOOGLE_SERVICE_ACCOUNT_JSON etc.)
- Kein Bearbeitungs-Formular für Organisationen (Orgs entstehen nur via Import)
- Kein CRUD für Teleson-Records (nur Listenansicht)
- Kein Editieren/Löschen von Notizen
- Kein Kundenportal

### ⚠ Auszuführende Migrationen (Reihenfolge beachten)

```
Supabase Dashboard → SQL Editor → Neue Abfrage → SQL einfügen → Run
```

| Schritt | Datei | Was sie tut | Abhängigkeit |
|---|---|---|---|
| 1 | `014_teleson_neu_ap_numeric.sql` | `teleson_records.neu_ap` TEXT → NUMERIC(8,4); komma-sichere Konvertierung | keine |
| 2 | `015_storage_bucket.sql` | Erstellt privaten Bucket `customer-documents` (50 MB, PDF/Bild/Word/Excel/CSV) | keine |
| 3 | `016_organizations.sql` | Neue Tabelle `organizations`; ergänzt `customers.organization_id` + `customers.object_type`; backfilled WEG-Objekte; RLS | keine |

Alle drei sind voneinander **unabhängig** — technisch in beliebiger Reihenfolge ausführbar. Numerische Reihenfolge (014 → 015 → 016) empfohlen.

Alle drei sind mit `IF NOT EXISTS`/`ON CONFLICT DO NOTHING`/`USING CASE` geschrieben → sicher, falls schon teilweise ausgeführt.  
**Ausnahme 016:** `ADD CONSTRAINT customers_object_type_check`, `CREATE POLICY` und `CREATE TRIGGER` sind nicht idempotent — **nur einmal ausführen**.

### Nächster sinnvoller Schritt nach Migration

Nach erfolgreicher Ausführung aller drei Migrationen:

1. `/app/organizations` aufrufen → sollte leer aber fehlerfrei sein
2. Kundenliste `/app/customers` aufrufen → Org- und Objekttyp-Filter prüfen (WEG-Objekte sollten `object_type=weg` haben)
3. Optional: Migration 017 für `customers.status`-Constraint (`'pending'` ergänzen)
4. Optional: Organisations-Anlegen-Formular oder Import mit „Hausverwaltung"-Spalte testen

---

## Bewusst noch nicht gebaut

- Kein Kundenportal (Login für Endkunden)
- Kein FG-Finanz-Block / `fg_finanz_records`-Anbindung
- Keine Pagination für Notizen (max. 10 werden geladen)
- Keine Upsell-/Opportunity-Verwaltungs-UI
- Kein Schreibzugriff zurück nach Notion
- Kein MCP
- Keine Teleson-Record-Detailseite (nur Listenansicht in der Kunden-Detailseite)
- Kein Editieren/Löschen von Notizen

---

## Wichtige Dateipfade

```
app/
  app/
    dashboard/page.tsx          — Dashboard (Server Component)
    customers/
      page.tsx                  — Kundenliste (Server Component)
      CustomersTable.tsx        — Tabelle + Suche + Filter + Pagination (Client)
      [id]/
        page.tsx                — Kundendetail (Server Component)
        actions.ts              — Server Actions: addCustomerNote, updateCustomerStatus
        NoteForm.tsx            — Notiz-Formular (Client)
        StatusSelect.tsx        — Status-Dropdown (Client)
    organizations/
      page.tsx                  — Organisations-Übersicht (Server Component)
      [id]/page.tsx             — Organisations-Detail + Objekte-Liste (Server Component)
    imports/
      page.tsx                  — Import-Seite + History (Server Component)
      UploadForm.tsx            — CSV/JSON-Upload (Client)
      NotionImportButton.tsx    — Notion-Import-Trigger (Client)
  api/
    import/teleson/route.ts     — POST: CSV/JSON-Import
    notion/import/route.ts      — GET: Verbindungstest  POST: Notion-Import
    export/
      customers/route.ts        — GET: Kunden-CSV (opt. ?status=)
      teleson/route.ts          — GET: Teleson-CSV (opt. ?energie=&status=)
    documents/
      upload/route.ts           — POST: Datei-Upload (FormData)
      [id]/route.ts             — GET: Download (Signed URL), DELETE: Löschen
lib/
  teleson/
    importRows.ts               — mapRow, processRows, buildBatchErrorLog
    csvParser.ts                — CSV/TSV-Parser (BOM, CRLF, auto-delimiter)
  notion/client.ts              — getDatabaseInfo, queryAllPages, pageToRecord
  export/csv.ts                 — buildCsv, csvHeaders (RFC 4180, UTF-8 BOM)
  documents/storage.ts          — uploadToStorage, createSignedUrl, deleteFromStorage
  google-drive/client.ts        — listFiles, downloadFile, uploadFile (Service Account JWT)
  supabase/
    server.ts                   — SSR-Client (User-Session, RLS aktiv)
    admin.ts                    — Admin-Client (Service Role, RLS bypass)
    middleware.ts               — updateSession
middleware.ts                   — Root-Middleware für Session-Refresh
supabase/migrations/            — SQL-Migrations 001–016
```
