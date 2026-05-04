"use client"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: "var(--primary-bright)", color: "#fff",
        border: "none", borderRadius: "var(--radius-md)",
        padding: "6px 18px", fontSize: "13px", fontWeight: 600,
        cursor: "pointer",
      }}
      className="no-print"
    >
      Drucken / Als PDF speichern
    </button>
  )
}
