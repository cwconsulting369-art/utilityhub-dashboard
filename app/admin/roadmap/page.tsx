import { DONE, OPEN, FUTURE } from "./constants"

export const metadata = { title: "MVP Roadmap | UtilityHub" }

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
