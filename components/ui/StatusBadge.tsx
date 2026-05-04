const MAP: Record<string, { bg: string; color: string; label: string }> = {
  active:     { bg: "rgba(46,160,67,0.15)",   color: "#3fb950", label: "Aktiv"      },
  inactive:   { bg: "rgba(139,148,158,0.15)", color: "#8b949e", label: "Inaktiv"    },
  blocked:    { bg: "rgba(248,81,73,0.15)",   color: "#f85149", label: "Gesperrt"   },
  done:       { bg: "rgba(46,160,67,0.15)",   color: "#3fb950", label: "Fertig"     },
  failed:     { bg: "rgba(248,81,73,0.15)",   color: "#f85149", label: "Fehler"     },
  processing: { bg: "rgba(210,153,34,0.15)",  color: "#d4a017", label: "Läuft"      },
  pending:    { bg: "rgba(139,148,158,0.15)", color: "#8b949e", label: "Ausstehend" },
  open:       { bg: "rgba(58,111,216,0.15)",  color: "#3a6fd8", label: "Offen"      },
}

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? { bg: "rgba(139,148,158,0.15)", color: "#8b949e", label: status }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "2px 10px", borderRadius: "999px",
      fontSize: "var(--text-xs)", fontWeight: 600,
      display: "inline-block", whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  )
}
