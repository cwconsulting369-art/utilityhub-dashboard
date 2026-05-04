"use client"

export function DeleteDocButton({
  action,
  docId,
  fileName,
}: {
  action: (formData: FormData) => Promise<void>
  docId: string
  fileName: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Dokument "${fileName}" wirklich löschen?\nDies kann nicht rückgängig gemacht werden.`)) {
          e.preventDefault()
        }
      }}
      style={{ display: "inline" }}
    >
      <input type="hidden" name="doc_id" value={docId} />
      <button
        type="submit"
        style={{
          background: "transparent",
          border: "1px solid #f8514944",
          borderRadius: "var(--radius-sm)",
          padding: "var(--space-1) var(--space-3)",
          color: "#f85149",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        🗑 Löschen
      </button>
    </form>
  )
}
