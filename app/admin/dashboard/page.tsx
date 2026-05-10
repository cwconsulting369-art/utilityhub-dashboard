import { createClient } from "@/lib/supabase/server"
import { getStreet }    from "@/lib/customers/format"
import {
  FadeInRow,
  KPICardLink,
} from "./DashboardAnimations"
export const dynamic  = "force-dynamic"
export const metadata = { title: "Dashboard | UtilityHub Intern" }

interface BatchErrorLogSummary {
  imported:            number
  updated?:            number
  skipped?:            number
  queued?:             number
  conflicts?:          number
  skipped_metadata?:   number
  skipped_incomplete?: number
  errors:              number
}

type BatchRow = {
  id:             string
  source:         string | null
  filename:       string | null
  total_rows:     number
  processed_rows: number | null
  error_rows:     number | null
  status:         string
  created_at:     string
  completed_at:   string | null
  error_log:      { summary?: BatchErrorLogSummary } | null
}

function parseBatchSummary(batch: BatchRow | null) {
  if (!batch) return null
  const s = batch.error_log?.summary
  if (s) {
    const isNotionSync = s.updated !== undefined
    return {
      imported:  isNotionSync ? s.imported + (s.updated ?? 0) : s.imported,
      skipped:   isNotionSync ? (s.skipped ?? 0) : (s.skipped_metadata ?? 0) + (s.skipped_incomplete ?? 0),
      queued:    s.queued    ?? null,
      conflicts: s.conflicts ?? null,
      errors:    s.errors,
    }
  }
  return {
    imported:  batch.processed_rows ?? 0,
    skipped:   null as number | null,
    queued:    null as number | null,
    conflicts: null as number | null,
    errors:    batch.error_rows ?? 0,
  }
}

function fmtDuration(start: string | null, end: string | null): string {
  if (!start || !end) return ""
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms <= 0) return ""
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

function batchStatusInfo(status: string): { color: string; bg: string; label: string } {
  switch (status) {
    case "completed":  return { color: "#3fb950", bg: "rgba(63,185,80,0.1)",  label: "Abgeschlossen" }
    case "partial":    return { color: "#ffa600", bg: "rgba(255,166,0,0.1)",  label: "Teilweise"     }
    case "failed":     return { color: "#f85149", bg: "rgba(248,81,73,0.1)",  label: "Fehlerhaft"    }
    case "running":
    case "processing": return { color: "#58a6ff", bg: "rgba(56,139,253,0.1)", label: "Läuft"         }
    case "pending":    return { color: "#ffa600", bg: "rgba(255,166,0,0.1)",  label: "Ausstehend"    }
    default:           return { color: "var(--text-muted)", bg: "rgba(139,148,158,0.1)", label: status }
  }
}

const CUSTOMER_STATUS_COLOR: Record<string, string> = {
  active:   "#3fb950",
  inactive: "var(--text-muted)",
  blocked:  "#f85149",
  pending:  "#ffa600",
}

const CUSTOMER_STATUS_LABEL: Record<string, string> = {
  active: "Aktiv", inactive: "Inaktiv", blocked: "Gesperrt", pending: "Ausstehend",
}

export default async function AppDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()

  const [
    { data: profile },
    { count: objectCount },
    { count: orgCount },
    { count: totalLieferstellen },
    { count: stromCount },
    { count: gasCount },
    { count: fgFinanzCount },
    { count: offenePotenziale },
    { data: recentCustomers },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user?.id ?? "").single(),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("teleson_records").select("*", { count: "exact", head: true }),
    supabase.from("teleson_records").select("*", { count: "exact", head: true }).ilike("energie", "strom"),
    supabase.from("teleson_records").select("*", { count: "exact", head: true }).ilike("energie", "gas"),
    supabase.from("fg_finanz_records").select("*", { count: "exact", head: true }),
    supabase.from("upsell_opportunities").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("customers")
      .select(
        "id, full_name, status, object_type, created_at, city, postal_code, " +
        "teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, knr, created_at), " +
        "customer_identities(system, external_id)"
      )
      .not("full_name", "ilike", "% (Allgemein)")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const total = objectCount ?? 0

  const greeting = profile?.full_name ? `Guten Tag, ${profile.full_name}` : "Guten Tag"

  const openPot = offenePotenziale ?? 0
  const iconStyle = { fill: "none", stroke: "rgba(255,255,255,0.7)", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  const kpis = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" {...iconStyle}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
      value: stromCount ?? 0, label: "Strom-Lieferstellen",
      color: "#58a6ff", bgColor: "rgba(88,166,255,0.1)", borderColor: "rgba(88,166,255,0.3)",
      href: "/admin/customers?energie=Strom",
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" {...iconStyle}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
      value: gasCount ?? 0, label: "Gas-Lieferstellen",
      color: "#ffa600", bgColor: "rgba(255,166,0,0.1)", borderColor: "rgba(255,166,0,0.3)",
      href: "/admin/customers?energie=Gas",
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" {...iconStyle}><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21V12h6v9"/></svg>,
      value: orgCount ?? 0, label: "Hausverwaltungen",
      color: "var(--text-muted)", bgColor: "rgba(139,148,158,0.1)", borderColor: "var(--border)",
      href: "/admin/customers",
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" {...iconStyle}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      value: fgFinanzCount ?? 0, label: "FG-Finanz-Verträge",
      color: "#a78bfa", bgColor: "rgba(167,139,250,0.1)", borderColor: "rgba(167,139,250,0.3)",
      href: "/admin/opportunities",
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" {...iconStyle}><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>,
      value: openPot, label: "Offene FG-Potenziale",
      color: openPot > 0 ? "#ffa600" : "#58a6ff",
      bgColor: openPot > 0 ? "rgba(255,166,0,0.1)" : "rgba(88,166,255,0.1)",
      borderColor: openPot > 0 ? "rgba(255,166,0,0.3)" : "rgba(88,166,255,0.3)",
      href: "/admin/opportunities",
    },
  ]

  type RecentRow = {
    id: string; full_name: string; status: string
    object_type: string | null; created_at: string
    city: string | null; postal_code: string | null
    teleson_records: {
      energie:        string | null
      neuer_versorger: string | null
      neu_ap:          number | null
      status:          string | null
      malo:            string | null
      zaehlernummer:   string | null
      knr:             string | null
      created_at:      string | null
    }[] | null
    customer_identities: { system: string; external_id: string }[] | null
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* ── KPI Grid (1fr 1fr 1fr 2fr) — separate cards wie Kundenportal ────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: "var(--space-5)", alignItems: "stretch" }}>
        {kpis.slice(0, 3).map((kpi, idx) => (
          <KPICardLink key={kpi.label} href={kpi.href} index={idx}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div style={{ color: kpi.color, flexShrink: 0 }}>{kpi.icon}</div>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text)", fontWeight: 500 }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--text)", lineHeight: 1, textAlign: "center" }}>
              {kpi.value.toLocaleString("de-DE")}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text)", textAlign: "center", opacity: 0.7 }}>
              Lieferstellen
            </div>
          </KPICardLink>
        ))}

        {/* Wide summary card */}
        <KPICardLink href="/admin/customers" index={3} style={{ gap: "var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--text-3xl)", fontWeight: 800, lineHeight: 1 }}>
              {total.toLocaleString("de-DE")}
            </span>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text)", opacity: 0.7 }}>Objekte</span>
            <span style={{ color: "var(--border)" }}>|</span>
            <span style={{ fontSize: "var(--text-3xl)", fontWeight: 800, lineHeight: 1 }}>
              {(totalLieferstellen ?? 0).toLocaleString("de-DE")}
            </span>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text)", opacity: 0.7 }}>Lieferstellen</span>
          </div>
          <div style={{ display: "flex", gap: "var(--space-5)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              <span style={{ color: "#a78bfa", fontWeight: 600 }}>{fgFinanzCount ?? 0}</span> FG-Finanz
            </span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              <span style={{ color: openPot > 0 ? "#ffa600" : "#58a6ff", fontWeight: 600 }}>{openPot}</span> Potenziale offen
            </span>
          </div>
        </KPICardLink>
      </div>

      {/* ── Zuletzt hinzugefügte Objekte ─────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Zuletzt hinzugefügte Objekte</h2>
          <a href="/admin/customers" style={{ fontSize: "var(--text-sm)", color: "var(--primary-bright)", textDecoration: "none" }}>Alle anzeigen →</a>
        </div>

        {recentCustomers && recentCustomers.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    { label: "Objekt",              align: "left"  as const },
                    { label: "Adresse",             align: "left"  as const },
                    { label: "Malo",                align: "left"  as const },
                    { label: "Zählernummer",        align: "left"  as const },
                    { label: "KNR",                 align: "left"  as const },
                    { label: "⚡ Strom-Tarif",       align: "left"  as const },
                    { label: "🔥 Gas-Tarif",         align: "left"  as const },
                    { label: "Lieferstelle Status", align: "left"  as const },
                    { label: "Typ",                 align: "left"  as const },
                    { label: "Status",              align: "right" as const },
                  ].map(h => (
                    <th key={h.label} style={{
                      padding: "var(--space-3) var(--space-4)",
                      textAlign: h.align, fontWeight: 500,
                      color: "var(--text-muted)", fontSize: "var(--text-xs)",
                      whiteSpace: "nowrap",
                    }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(recentCustomers as unknown as RecentRow[]).map((row, idx) => {
                  const telesonRecs = row.teleson_records  ?? []
                  const stromRec    = telesonRecs.find(r => r.energie?.toLowerCase() === "strom") ?? null
                  const gasRec      = telesonRecs.find(r => r.energie?.toLowerCase() === "gas")   ?? null
                  const objType     = row.object_type
                  const malo        = telesonRecs.map(r => r.malo).find(Boolean) ?? null
                  const objektLabel = getStreet(row.full_name)
                  const latestRec   = [...telesonRecs].sort((a, b) =>
                    String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
                  )[0]
                  const zNrRaw      = latestRec?.zaehlernummer ?? null
                  const zNr         = zNrRaw ? ((zNrRaw.split(":").pop() ?? zNrRaw).trim() || null) : null
                  const knr         = (row.customer_identities ?? [])
                                        .find(i => i.system !== "weg" && (i.system === "knr" || i.system === "teleson"))
                                        ?.external_id ?? null
                  const statusColor = CUSTOMER_STATUS_COLOR[row.status] ?? "var(--text-muted)"
                  const statusLabel = CUSTOMER_STATUS_LABEL[row.status] ?? row.status
                  const lieferStatus = stromRec?.status ?? gasRec?.status ?? null

                  // Aging label for this row
                  const createdMs = new Date(row.created_at).getTime()
                  const ageMs     = now.getTime() - createdMs
                  const ageDays   = Math.floor(ageMs / (24 * 60 * 60 * 1000))
                  const ageLabel  = ageDays === 0 ? "Heute" : ageDays === 1 ? "Gestern" : `${ageDays}T`
                  const ageColor  = ageDays === 0 ? "#3fb950" : ageDays <= 7 ? "#58a6ff" : ageDays <= 30 ? "#ffa600" : "var(--text-muted)"

                  const monoMuted: React.CSSProperties = {
                    fontFamily: "monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)",
                  }
                  const dash = <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>

                  return (
                    <FadeInRow
                      key={row.id}
                      index={idx}
                      style={{ borderBottom: idx < (recentCustomers?.length ?? 0) - 1 ? "1px solid var(--border)" : undefined }}
                    >
                      {/* Objekt */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        <a href={`/admin/customers/${row.id}`} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none", color: "inherit" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/building-placeholder.jpg" alt="Gebäude" style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
                          <span style={{ fontWeight: 600, color: "#ffffff" }}>{objektLabel}</span>
                        </a>
                      </td>

                      {/* Adresse */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", color: "rgba(255,255,255,0.7)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}>
                        {(row.postal_code || row.city) ? (
                          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                            {row.postal_code && <span>{row.postal_code}</span>}
                            {row.city        && <span>{row.city}</span>}
                          </div>
                        ) : dash}
                      </td>

                      {/* Malo */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {malo ? <span style={monoMuted}>{malo}</span> : dash}
                      </td>

                      {/* Zählernummer */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {zNr ? <span style={monoMuted}>{zNr}</span> : dash}
                      </td>

                      {/* KNR */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {knr ? <span style={monoMuted}>{knr}</span> : dash}
                      </td>

                      {/* Strom-Tarif */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {stromRec?.neuer_versorger ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "#ffffff" }}>{stromRec.neuer_versorger}</span>
                            {stromRec.neu_ap != null && (
                              <span style={{ fontSize: "var(--text-xs)", color: "#58a6ff" }}>
                                {stromRec.neu_ap.toLocaleString("de-DE")} ct/kWh
                              </span>
                            )}
                          </div>
                        ) : dash}
                      </td>

                      {/* Gas-Tarif */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {gasRec?.neuer_versorger ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "#ffffff" }}>{gasRec.neuer_versorger}</span>
                            {gasRec.neu_ap != null && (
                              <span style={{ fontSize: "var(--text-xs)", color: "#ffa600" }}>
                                {gasRec.neu_ap.toLocaleString("de-DE")} ct/kWh
                              </span>
                            )}
                          </div>
                        ) : dash}
                      </td>

                      {/* Lieferstelle Status */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {lieferStatus ? (
                          <span style={{
                            fontSize: "var(--text-xs)", fontWeight: 600,
                            background: "rgba(139,148,158,0.1)", color: "var(--text-muted)",
                            border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                            padding: "1px 7px",
                          }}>{lieferStatus}</span>
                        ) : dash}
                      </td>

                      {/* Typ */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        <span style={{
                          background: "rgba(139,148,158,0.1)", color: "var(--text-muted)",
                          border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                          padding: "1px 7px", fontSize: "10px", fontWeight: 600,
                        }}>{objType === "weg" ? "WEG" : "Privat"}</span>
                      </td>

                      {/* Status + Alter */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap", textAlign: "right" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: statusColor }}>{statusLabel}</span>
                          <span style={{ fontSize: "10px", fontWeight: 600, color: ageColor }}>{ageLabel}</span>
                        </div>
                      </td>
                    </FadeInRow>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "var(--space-10)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Noch keine Objekte vorhanden.{" "}
            <a href="/admin/imports" style={{ color: "var(--primary-bright)" }}>Import starten →</a>
          </div>
        )}
        </div>

    </div>
  )
}
