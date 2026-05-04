export const metadata = { title: "Nachrichten | UtilityHub" }

export default function PortalNotesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>Nachrichten</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Mitteilungen von Ihrem Verwalter
        </p>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-12)",
        textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)",
      }}>
        <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)", opacity: 0.4 }}>✉</div>
        <div style={{ fontWeight: 500, marginBottom: "var(--space-1)" }}>Keine Nachrichten vorhanden</div>
        <div style={{ fontSize: "var(--text-xs)" }}>Neue Mitteilungen erscheinen hier automatisch.</div>
      </div>

    </div>
  )
}
