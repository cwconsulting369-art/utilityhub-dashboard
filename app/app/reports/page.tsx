export const metadata = { title: "Reports | UtilityHub" }

export default function ReportsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Reports</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Berichte & Auswertungen</p>
      </div>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-12)",
        textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)",
      }}>
        In Entwicklung
      </div>
    </div>
  )
}
