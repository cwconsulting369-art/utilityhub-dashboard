export const metadata = { title: "MVP Roadmap | UtilityHub" }

const DONE: string[] = [
  "Dashboard visuell finalisiert",
  "Objekte-Liste visuell (Typ-Spalte, Hausverwaltung, Farben)",
  "Objekt-Detailseite visuell",
  "Imports-Seite visuell (Quellauswahl, History-Tabelle)",
  "Dokumente-Seite visuell (echte Datentabelle)",
  "Opportunities-Seite visuell (FG Finanz)",
  "Incentives / Support / Settings visuell",
  "Kundenportal alle Seiten (Übersicht, Dokumente, Nachrichten, Einstellungen)",
  "Portal-Dashboard mit echten Kundendaten",
  "Test-Kunde angelegt (kunde@test.de)",
  "middleware.ts Konflikt behoben",
  "allowedDevOrigins konfiguriert",
  "Objekte-Liste überarbeitet (Spalten, WEG/Privat, Malo, Zählernummer, KNR)",
  "Objekt-Detailseite überarbeitet (Stammdaten kompakt, Aktuelle Daten Box, KdNr Zuordnung)",
  "Teleson-Tabelle in Notion-Reihenfolge gebracht",
  "Dashboard Objekttabelle aktualisiert",
  "Kategorien aus UI entfernt",
  "Hausverwaltung global umbenannt",
  "Portal-Org-Zuordnung + RLS (Migrations 023 + 024)",
  "Portal-Dashboard mit echten KPIs (Objekte, Strom, Gas, FG Finanz, Potenziale)",
  "Portal-Objekte-Seite mit Detailansicht",
  "Portal-Ansprechpartner-Seite (zwei Spalten FG Finanz / Teleson)",
  "Portal-FG Finanz Placeholder-Seite",
  "Portal-Incentives Placeholder-Seite",
  "Schnell-Upload-Widget in Sidebar",
  "Kunden-Login produktiv (Test-Kunde mit Org verknüpft)",
  "Hausverwaltung Pfafflinger angelegt + alle Objekte zugeordnet",
  "UHID System eingebaut (HV-XXXXX / OBJ-XXXXX, automatisch via DB-Trigger)",
  "Hausverwaltungs-Auswahl beim Import (Notion + Datei)",
  "Kunden-Account automatisch bei neuer Hausverwaltung anlegen",
  "Credentials-Banner mit Copy-Buttons",
  "Fuzzy-Match Logik für Hausverwaltungs-Namen",
  "Adress-Mapping beim Import (WEG → Straße/Stadt/PLZ)",
  "Duplikat-Schutz beim Import (Strom+Gas → 1 Objekt)",
  "Objektname global nur Straße (Admin + Portal)",
  "Full Flow Test erfolgreich (Import → Portal → Login)",
  "sync.ts organization_id Fix",
  "Forced Password Change beim ersten Kunden-Login",
  "Dokument-Zuordnung im Admin (Upload → Objekt zuweisen)",
  "Playwright automatisches Testing Setup",
  "Kundenportal: Teleson-Daten anzeigen (Entscheidung Miguel)",
  "Mitarbeiter-Login produktiv",
  "Dashboard echte Datenlogik",
  "Dokumente 3-Stufen-Logik (Eingang → HV Allgemein → Objekt-spezifisch)",
  "Nav-Badge für unbearbeitete Dokumente im Eingang",
  "Ansprechpartner WhatsApp-Links mit vorausgefülltem Text",
  "Hausverwaltungs-Dokumente Upload-Logik (Hauptordner)",
]

const OPEN: string[] = [
  "Benutzerverwaltung in Einstellungen (Nutzer, Sperren, Passwort-Reset)",
  "Sequences zurücksetzen nach Cleanup (HV/OBJ ab 00001)",
  "UI-Polish / Full Visual Audit (professioneller, hochwertiger)",
  "FG Finanz Import-Route (/api/import/fg-finanz)",
  "Match-Review-Queue UI bauen",
  "Website / Außenauftritt (utility-hub.one)",
  "Kontakte-Seite + Tabelle (migration + UI)",
]

const FUTURE: string[] = [
  "Upsell-Erkennung basierend auf Daten (regelbasiert)",
  "Notion ↔ Supabase Auto-Sync",
  "Wochen-/Monatsreports automatisch",
  "Incentives-Logik klären und einbauen",
  "Kunden-Login Logik festlegen",
  "Mitarbeiter-Login Logik festlegen",
  "Admin-Einstellungen: Rechteverwaltung pro Account",
  "System Health Tracking (Performance, Sicherheit)",
  "Landingpage vollständig ausbauen",
  "Drag & Drop Logiken ausbauen",
]

export default function RoadmapPage() {
  const total = DONE.length + OPEN.length
  const pct   = Math.round((DONE.length / total) * 100)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>MVP Roadmap</h1>
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
              color: "var(--text-muted)", background: "rgba(139,148,158,0.1)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1px 7px",
            }}>INTERN</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
            {DONE.length} von {total} MVP-Punkten erledigt
          </p>
        </div>
        <span style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--primary-bright)" }}>
          {pct} %
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: "6px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary-bright)", borderRadius: "999px" }} />
      </div>

      {/* Erledigt + Offen */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>

        {/* Erledigt */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
        }}>
          <div style={{
            padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#3fb950" }}>Erledigt ✓</span>
            <span style={{
              fontSize: "10px", fontWeight: 700, color: "#3fb950",
              background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.25)",
              borderRadius: "var(--radius-sm)", padding: "1px 7px",
            }}>{DONE.length}</span>
          </div>
          <div style={{ padding: "var(--space-4) var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {DONE.map(item => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                <span style={{ color: "#3fb950", fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>✓</span>
                <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Offen */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
        }}>
          <div style={{
            padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#ffa600" }}>Offen</span>
            <span style={{
              fontSize: "10px", fontWeight: 700, color: "#ffa600",
              background: "rgba(255,166,0,0.1)", border: "1px solid rgba(255,166,0,0.25)",
              borderRadius: "var(--radius-sm)", padding: "1px 7px",
            }}>{OPEN.length}</span>
          </div>
          <div style={{ padding: "var(--space-4) var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {OPEN.map(item => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                <span style={{ color: "#ffa600", fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>○</span>
                <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Automatisierungen & Zukunft */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
      }}>
        <div style={{
          padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#a78bfa" }}>
            Automatisierungen &amp; Zukunft
          </span>
          <span style={{
            fontSize: "10px", fontWeight: 700, color: "#a78bfa",
            background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)",
            borderRadius: "var(--radius-sm)", padding: "1px 7px",
          }}>{FUTURE.length}</span>
        </div>
        <div style={{
          padding: "var(--space-4) var(--space-6)",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)",
        }}>
          {FUTURE.map(item => (
            <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ color: "#a78bfa", fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>◇</span>
              <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
