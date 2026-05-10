export const metadata = { title: "Support | UtilityHub" }

export default function SupportPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>Support</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Ihr Ansprechpartner bei Fragen und Problemen
        </p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)",
      }}>

        {/* Technischer Support */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
        }}>
          <div style={{ fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-1)" }}>
            Technischer Support
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-4)" }}>
            Bei Problemen mit dem System, Importfehlern oder technischen Störungen.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <a
              href="mailto:support@utility-hub.one"
              style={{ color: "var(--primary-bright)", fontSize: "var(--text-sm)", textDecoration: "none" }}
            >
              support@utility-hub.one
            </a>
          </div>
        </div>

        {/* Fachlicher Support */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
        }}>
          <div style={{ fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-1)" }}>
            Fachlicher Support
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-4)" }}>
            Bei Fragen zu Teleson-Daten, FG Finanz, Provisionsnachverfolgung oder Objektverwaltung.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <a
              href="mailto:info@utility-hub.one"
              style={{ color: "var(--primary-bright)", fontSize: "var(--text-sm)", textDecoration: "none" }}
            >
              info@utility-hub.one
            </a>
          </div>
        </div>

      </div>

      {/* Bekannte Einschränkungen */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
      }}>
        <div style={{ fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
          Bekannte Einschränkungen (Stand: Phase 1)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {[
            { label: "FG Finanz Import", note: "Datei-Import für FG Finanz noch nicht verfügbar. Daten bitte manuell anlegen oder Notion-Sync nutzen." },
            { label: "Kunden-Login",     note: "Das Kundenportal ist noch nicht für echte Kunden-Accounts freigeschaltet." },
            { label: "Upsell-Engine",    note: "Regelbasierte automatische Potenzialerkennung ist in Vorbereitung." },
          ].map(({ label, note }) => (
            <div key={label} style={{
              display:      "flex", gap: "var(--space-4)",
              padding:      "var(--space-3) var(--space-4)",
              background:   "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
            }}>
              <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", whiteSpace: "nowrap" }}>{label}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
