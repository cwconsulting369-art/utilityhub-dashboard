import { createClient } from "@/lib/supabase/server"
import { getStreet }    from "@/lib/customers/format"
import {
  FadeInRow,
  FadeInLink,
  SlideInLeft,
  CoverageBar,
} from "./DashboardAnimations"
import { DONE, OPEN } from "../roadmap/constants"

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

// Roadmap numbers from shared source
const ROADMAP_TOTAL = DONE.length + OPEN.length
const ROADMAP_PCT   = Math.round((DONE.length / ROADMAP_TOTAL) * 100)

export default async function AppDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Date boundaries for aging buckets (server-side)
  const now   = new Date()
  const d1ago  = new Date(now.getTime() - 1  * 24 * 60 * 60 * 1000)
  const d7ago  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000)
  const d30ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    { data: profile },
    { count: objectCount },
    { count: orgCount },
    { count: totalLieferstellen },
    { count: stromCount },
    { count: gasCount },
    { count: fgFinanzCount },
    { count: offenePotenziale },
    { data: recentBatches },
    { data: recentCustomers },
    { data: telesonCustomerIds },
    { data: fgFinanzCustomerIds },
    // Aging counter buckets
    { count: agingToday },
    { count: agingWeek },
    { count: agingMonth },
    { count: agingOlder },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user?.id ?? "").single(),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("teleson_records").select("*", { count: "exact", head: true }),
    supabase.from("teleson_records").select("*", { count: "exact", head: true }).ilike("energie", "strom"),
    supabase.from("teleson_records").select("*", { count: "exact", head: true }).ilike("energie", "gas"),
    supabase.from("fg_finanz_records").select("*", { count: "exact", head: true }),
    supabase.from("upsell_opportunities").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("import_batches")
      .select("id, source, filename, total_rows, processed_rows, error_rows, status, created_at, completed_at, error_log")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("customers")
      .select(
        "id, full_name, status, object_type, created_at, city, postal_code, " +
        "teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, knr, created_at), " +
        "customer_identities(system, external_id)"
      )
      .not("full_name", "ilike", "% (Allgemein)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("teleson_records").select("customer_id"),
    supabase.from("fg_finanz_records").select("customer_id"),
    // Aging: last 24h
    supabase.from("customers").select("*", { count: "exact", head: true })
      .not("full_name", "ilike", "% (Allgemein)")
      .gte("created_at", d1ago.toISOString()),
    // Aging: 1–7 days
    supabase.from("customers").select("*", { count: "exact", head: true })
      .not("full_name", "ilike", "% (Allgemein)")
      .gte("created_at", d7ago.toISOString())
      .lt("created_at", d1ago.toISOString()),
    // Aging: 7–30 days
    supabase.from("customers").select("*", { count: "exact", head: true })
      .not("full_name", "ilike", "% (Allgemein)")
      .gte("created_at", d30ago.toISOString())
      .lt("created_at", d7ago.toISOString()),
    // Aging: 30+ days
    supabase.from("customers").select("*", { count: "exact", head: true })
      .not("full_name", "ilike", "% (Allgemein)")
      .lt("created_at", d30ago.toISOString()),
  ])

  // ── Coverage metrics ──────────────────────────────────────────────────────
  const objectsWithTeleson  = new Set(telesonCustomerIds?.map(r => r.customer_id)  ?? []).size
  const objectsWithFgFinanz = new Set(fgFinanzCustomerIds?.map(r => r.customer_id) ?? []).size
  const total = objectCount ?? 0
  const telesonCovPct  = total > 0 ? Math.round(objectsWithTeleson  / total * 100) : 0
  const fgFinanzCovPct = total > 0 ? Math.round(objectsWithFgFinanz / total * 100) : 0

  const greeting = profile?.full_name ? `Guten Tag, ${profile.full_name}` : "Guten Tag"

  const kpis = [
    { icon: "⚡", value: stromCount ?? 0,      label: "Strom-Lieferstellen", color: "#58a6ff",           href: "/app/customers?energie=Strom" },
    { icon: "🔥", value: gasCount ?? 0,        label: "Gas-Lieferstellen",   color: "#ffa600",           href: "/app/customers?energie=Gas"   },
    { icon: "🏢", value: orgCount ?? 0,         label: "Hausverwaltungen",      color: "var(--text-muted)", href: "/app/customers"               },
    { icon: "💼", value: fgFinanzCount ?? 0,    label: "FG-Finanz-Verträge",  color: "#a78bfa",           href: "/app/opportunities"           },
    { icon: "🎯", value: offenePotenziale ?? 0, label: "Offene FG-Potenziale",
      color: (offenePotenziale ?? 0) > 0 ? "#ffa600" : "#3fb950", href: "/app/opportunities" },
  ]

  const coverageRows = [
    { label: "Objekte mit Energiedaten (Teleson)", count: objectsWithTeleson,  pct: telesonCovPct,  color: "#58a6ff", href: "/app/customers"    },
    { label: "Objekte mit FG-Finanz-Bezug",        count: objectsWithFgFinanz, pct: fgFinanzCovPct, color: "#a78bfa", href: "/app/opportunities" },
  ]

  const batches = (recentBatches ?? []) as BatchRow[]

  // Aging buckets for display
  const agingBuckets = [
    { label: "Letzte 24h",  count: agingToday  ?? 0, color: "#3fb950", border: "rgba(63,185,80,0.2)",   bg: "rgba(63,185,80,0.08)"   },
    { label: "1–7 Tage",    count: agingWeek   ?? 0, color: "#58a6ff", border: "rgba(88,166,255,0.2)",  bg: "rgba(88,166,255,0.08)"  },
    { label: "7–30 Tage",   count: agingMonth  ?? 0, color: "#ffa600", border: "rgba(255,166,0,0.2)",   bg: "rgba(255,166,0,0.08)"   },
    { label: "Älter 30 T.", count: agingOlder  ?? 0, color: "#8b949e", border: "rgba(139,148,158,0.2)", bg: "rgba(139,148,158,0.08)" },
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>{greeting}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Internes Data Hub Portal — Übersicht</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <a href="/app/customers" style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "var(--space-3) var(--space-5)",
            textDecoration: "none", color: "inherit", textAlign: "center",
          }}>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, lineHeight: 1 }}>{total.toLocaleString("de-DE")}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>Objekte gesamt</div>
          </a>
          <a href="/app/imports" style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "var(--space-3) var(--space-5)",
            textDecoration: "none", color: "inherit", textAlign: "center",
          }}>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, lineHeight: 1 }}>{(totalLieferstellen ?? 0).toLocaleString("de-DE")}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>Lieferstellen</div>
          </a>
        </div>
      </div>

      {/* ── MVP Fortschritt + Aging-Counter (2-Spalten) ──────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>

        {/* Roadmap-Widget */}
        <a href="/app/roadmap" style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
          textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              MVP Fortschritt
            </span>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 800, color: "var(--primary-bright)" }}>
              {ROADMAP_PCT} %
            </span>
          </div>
          <div style={{ height: "5px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ width: `${ROADMAP_PCT}%`, height: "100%", background: "var(--primary-bright)", borderRadius: "999px" }} />
          </div>
          <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-xs)" }}>
            <span>
              <span style={{ color: "#3fb950", fontWeight: 700 }}>{DONE.length}</span>
              <span style={{ color: "var(--text-muted)" }}> erledigt</span>
            </span>
            <span>
              <span style={{ color: "#ffa600", fontWeight: 700 }}>{OPEN.length}</span>
              <span style={{ color: "var(--text-muted)" }}> offen</span>
            </span>
            <span style={{ marginLeft: "auto", color: "var(--primary-bright)" }}>Zur Roadmap →</span>
          </div>
        </a>

        {/* Aging-Counter */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Objekt-Alter (Import-Datum)
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
            {agingBuckets.map(bucket => (
              <div key={bucket.label} style={{
                background: bucket.bg, border: `1px solid ${bucket.border}`,
                borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-3)",
                display: "flex", flexDirection: "column", gap: "2px",
              }}>
                <span style={{ fontSize: "var(--text-base)", fontWeight: 700, color: bucket.color, lineHeight: 1 }}>
                  {bucket.count.toLocaleString("de-DE")}
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{bucket.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-4)" }}>
        {kpis.map((kpi, idx) => (
          <FadeInLink key={kpi.label} href={kpi.href} index={idx} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)",
            display: "flex", flexDirection: "column", gap: "var(--space-2)",
            textDecoration: "none", color: "inherit",
          }}>
            <div style={{ fontSize: "20px", lineHeight: 1 }}>{kpi.icon}</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, lineHeight: 1, color: kpi.color }}>
              {kpi.value.toLocaleString("de-DE")}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{kpi.label}</div>
          </FadeInLink>
        ))}
      </div>

      {/* ── Daten-Abdeckung ─────────────────────────────────────────────────── */}
      {total > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", marginBottom: "var(--space-4)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Daten-Abdeckung
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {coverageRows.map(row => (
              <a key={row.label} href={row.href} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{row.label}</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: row.pct > 0 ? row.color : "var(--text-muted)" }}>
                    {row.count.toLocaleString("de-DE")}
                    <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: "6px" }}>
                      / {total.toLocaleString("de-DE")} ({row.pct}%)
                    </span>
                  </span>
                </div>
                <div style={{ height: "5px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                  <CoverageBar pct={row.pct} color={row.color} />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Letzte Importe ──────────────────────────────────────────────────── */}
      <SlideInLeft style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Letzte Importe</h2>
          <a href="/app/imports" style={{ fontSize: "var(--text-sm)", color: "var(--primary-bright)", textDecoration: "none" }}>Alle Importe →</a>
        </div>

        {batches.length > 0 ? batches.map((batch, idx) => {
          const summary    = parseBatchSummary(batch)
          const st         = batchStatusInfo(batch.status)
          const isNotion   = batch.filename?.startsWith("Notion:") ?? false
          const batchLabel = isNotion
            ? (batch.filename?.replace(/^Notion:\s*/, "") ?? "Notion")
            : (batch.filename ?? "—")
          const duration   = fmtDuration(batch.created_at, batch.completed_at)
          const successPct = summary && batch.total_rows > 0
            ? Math.round(summary.imported / batch.total_rows * 100)
            : null
          return (
            <div key={batch.id} style={{
              padding: "var(--space-4) var(--space-5) var(--space-4) var(--space-5)",
              borderBottom: idx < batches.length - 1 ? "1px solid var(--border)" : undefined,
              borderLeft: `3px solid ${st.color}`,
              display: "flex", flexDirection: "column", gap: "var(--space-2)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <span style={{
                  background: st.bg, color: st.color, border: `1px solid ${st.color}44`,
                  borderRadius: "var(--radius-sm)", padding: "1px 8px",
                  fontSize: "var(--text-xs)", fontWeight: 700, whiteSpace: "nowrap",
                }}>{st.label}</span>
                <span style={{
                  background: isNotion ? "rgba(139,99,255,0.12)" : "rgba(139,148,158,0.12)",
                  color: isNotion ? "#a78bfa" : "var(--text-muted)",
                  border: `1px solid ${isNotion ? "rgba(139,99,255,0.25)" : "var(--border)"}`,
                  borderRadius: "var(--radius-sm)", padding: "1px 7px",
                  fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap",
                }}>{isNotion ? "NOTION" : "DATEI"}</span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "320px" }}>
                  {batchLabel}
                </span>
              </div>
              {summary && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", fontSize: "var(--text-xs)" }}>
                  <span><span style={{ color: "var(--text-muted)" }}>Gesamt </span><strong>{batch.total_rows.toLocaleString("de-DE")}</strong></span>
                  <span><span style={{ color: "var(--text-muted)" }}>Verarbeitet </span><strong style={{ color: summary.imported > 0 ? "#3fb950" : undefined }}>{summary.imported.toLocaleString("de-DE")}</strong></span>
                  {summary.skipped !== null && summary.skipped > 0 && <span><span style={{ color: "var(--text-muted)" }}>Übersprungen </span><strong>{summary.skipped.toLocaleString("de-DE")}</strong></span>}
                  {summary.queued !== null && summary.queued > 0 && <span><span style={{ color: "var(--text-muted)" }}>In Prüfung </span><strong style={{ color: "#ffa600" }}>{summary.queued.toLocaleString("de-DE")}</strong></span>}
                  {summary.conflicts !== null && summary.conflicts > 0 && <span><span style={{ color: "var(--text-muted)" }}>Konflikte </span><strong style={{ color: "#f85149" }}>{summary.conflicts.toLocaleString("de-DE")}</strong></span>}
                  <span><span style={{ color: "var(--text-muted)" }}>Fehler </span><strong style={{ color: summary.errors > 0 ? "#f85149" : undefined }}>{summary.errors.toLocaleString("de-DE")}</strong></span>
                  {successPct !== null && <span><span style={{ color: "var(--text-muted)" }}>Erfolg </span><strong style={{ color: successPct >= 95 ? "#3fb950" : successPct >= 70 ? "#ffa600" : "#f85149" }}>{successPct}%</strong></span>}
                </div>
              )}
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "flex", gap: "var(--space-3)" }}>
                <span>{new Date(batch.created_at).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}</span>
                {duration && <span>· Dauer {duration}</span>}
              </div>
            </div>
          )
        }) : (
          <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Noch kein Import vorhanden.{" "}
            <a href="/app/imports" style={{ color: "var(--primary-bright)" }}>Import starten →</a>
          </div>
        )}
      </SlideInLeft>

      {/* ── Zuletzt hinzugefügte Objekte ───────────────────────────────────── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Zuletzt hinzugefügte Objekte</h2>
          <a href="/app/customers" style={{ fontSize: "var(--text-sm)", color: "var(--primary-bright)", textDecoration: "none" }}>Alle anzeigen →</a>
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
                        <a href={`/app/customers/${row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                          <span style={{ fontWeight: 500, color: "var(--primary-bright)" }}>{objektLabel}</span>
                        </a>
                      </td>

                      {/* Adresse */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}>
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
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "#58a6ff" }}>{stromRec.neuer_versorger}</span>
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
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "#ffa600" }}>{gasRec.neuer_versorger}</span>
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
            <a href="/app/imports" style={{ color: "var(--primary-bright)" }}>Import starten →</a>
          </div>
        )}
      </div>

    </div>
  )
}
