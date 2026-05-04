export const metadata = { title: "Incentives | UtilityHub" }

const PLANNED: { title: string; description: string }[] = [
  {
    title:       "Provisions-Tracking",
    description: "Automatische Erfassung und Nachverfolgung von Vermittlungsprovisionen je Objekt und Produkt.",
  },
  {
    title:       "Bonus-Regeln",
    description: "Konfigurierbare Regeln für Bonusauszahlungen basierend auf Abschlüssen, Volumen oder Laufzeiten.",
  },
  {
    title:       "Auswertungen",
    description: "Übersichten über Provisionen nach Zeitraum, Mitarbeiter, Produkttyp und Objektkategorie.",
  },
  {
    title:       "Export",
    description: "CSV/Excel-Export der Incentive-Daten für die Buchhaltung.",
  },
]

export default function IncentivesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>Incentives</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Provisions- und Incentive-Verwaltung
        </p>
      </div>

      {/* Status banner */}
      <div style={{
        background:   "rgba(210,153,34,0.08)", border: "1px solid rgba(210,153,34,0.25)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-4) var(--space-6)",
        display:      "flex", alignItems: "center", gap: "var(--space-3)",
      }}>
        <span style={{
          background: "rgba(210,153,34,0.15)", color: "#d4a017",
          borderRadius: "999px", padding: "2px 10px",
          fontSize: "var(--text-xs)", fontWeight: 600, whiteSpace: "nowrap",
        }}>
          In Planung
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Dieser Bereich wird in einer der nächsten Phasen ausgebaut. Folgende Funktionen sind geplant:
        </span>
      </div>

      {/* Planned features */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        {PLANNED.map(item => (
          <div key={item.title} style={{
            background:   "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
            opacity:      0.7,
          }}>
            <div style={{ fontWeight: 600, marginBottom: "var(--space-1)", fontSize: "var(--text-sm)" }}>
              {item.title}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              {item.description}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
