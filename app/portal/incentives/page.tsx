export const metadata = { title: "Incentives | UtilityHub" }

export default function PortalIncentivesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>Incentives</h1>
        <span style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
          color: "#ffa600", background: "rgba(255,166,0,0.1)",
          border: "1px solid rgba(255,166,0,0.3)",
          borderRadius: "var(--radius-sm)", padding: "1px 7px",
        }}>BALD</span>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-12)",
        textAlign: "center", color: "var(--text-muted)",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)", opacity: 0.5 }}>🎁</div>
        <div style={{ fontSize: "var(--text-base)", fontWeight: 500, marginBottom: "var(--space-2)", color: "var(--text)" }}>
          Empfehlungs-Programm kommt bald
        </div>
        <div style={{ fontSize: "var(--text-sm)" }}>
          Profitieren Sie demnächst von Vorteilen, wenn Sie weitere Objekte oder Hausverwaltungen empfehlen.
        </div>
      </div>

    </div>
  )
}
