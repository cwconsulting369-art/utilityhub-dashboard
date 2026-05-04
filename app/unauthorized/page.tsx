import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-4)",
      textAlign: "center",
      padding: "var(--space-6)",
    }}>
      <div style={{ fontSize: "3rem" }}>🔒</div>
      <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>Kein Zugriff</h1>
      <p style={{ color: "var(--text-muted)", maxWidth: "400px" }}>
        Du hast keine Berechtigung, diese Seite aufzurufen.
      </p>
      <Link href="/login" style={{
        background: "var(--primary-bright)",
        color: "#fff",
        padding: "var(--space-3) var(--space-6)",
        borderRadius: "var(--radius-md)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
      }}>
        Zurück zur Anmeldung
      </Link>
    </div>
  )
}
