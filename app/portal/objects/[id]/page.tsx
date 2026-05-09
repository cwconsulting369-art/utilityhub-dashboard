import { notFound, redirect } from "next/navigation"
import { createClient }      from "@/lib/supabase/server"
import { StatusBadge }       from "@/components/ui/StatusBadge"
import { formatBytes }       from "@/lib/documents/storage"
import { getStreet }         from "@/lib/customers/format"

export const metadata = { title: "Objektdetail | UtilityHub" }

interface Props { params: Promise<{ id: string }> }

// ── Visual helpers (kopiert aus admin um Portal self-contained zu halten) ──

const ENERGIE_COLORS: Record<string, { bg: string; color: string }> = {
  strom:  { bg: "rgba(56,139,253,0.15)",  color: "#58a6ff" },
  gas:    { bg: "rgba(255,166,0,0.15)",   color: "#ffa600" },
  wärme:  { bg: "rgba(248,81,73,0.12)",   color: "#f85149" },
  wasser: { bg: "rgba(63,185,80,0.12)",   color: "#3fb950" },
}

const TELESON_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  beliefert:    { bg: "rgba(63,185,80,0.12)",  color: "#3fb950" },
  "in wechsel": { bg: "rgba(255,166,0,0.12)",  color: "#ffa600" },
  wechsel:      { bg: "rgba(255,166,0,0.12)",  color: "#ffa600" },
  neuanlage:    { bg: "rgba(56,139,253,0.12)", color: "#58a6ff" },
  abgemeldet:   { bg: "rgba(248,81,73,0.12)",  color: "#f85149" },
  kündigung:    { bg: "rgba(248,81,73,0.12)",  color: "#f85149" },
  storniert:    { bg: "rgba(248,81,73,0.12)",  color: "#f85149" },
}

const ENERGIE_ICONS: Record<string, string> = {
  strom: "⚡", gas: "🔥", wärme: "♨", wasser: "💧",
}

function telesonStatusBadge(status: string | null) {
  if (!status) return <span style={{ color: "var(--text-muted)" }}>—</span>
  const s = TELESON_STATUS_COLORS[status.toLowerCase()] ?? { bg: "rgba(139,148,158,0.12)", color: "var(--text-muted)" }
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.color}44`,
      borderRadius: "var(--radius-sm)", padding: "1px 8px",
      fontSize: "var(--text-xs)", fontWeight: 600, whiteSpace: "nowrap",
    }}>{status}</span>
  )
}

function energieBadge(energie: string | null) {
  if (!energie) return null
  const key   = energie.toLowerCase()
  const style = ENERGIE_COLORS[key] ?? { bg: "rgba(139,148,158,0.15)", color: "var(--text-muted)" }
  return (
    <span style={{
      background: style.bg, color: style.color, border: `1px solid ${style.color}33`,
      borderRadius: "var(--radius-sm)", padding: "1px 8px",
      fontSize: "var(--text-xs)", fontWeight: 600, whiteSpace: "nowrap",
    }}>{energie}</span>
  )
}

function fmtAp(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—"
  const n = parseFloat(String(val).replace(",", "."))
  if (isNaN(n)) return String(val)
  return n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " ct/kWh"
}

function Cell({ v }: { v: unknown }) {
  const s = v === null || v === undefined || v === "" ? null : String(v)
  if (!s) return <span style={{ color: "var(--text-muted)" }}>—</span>
  return <>{s}</>
}

function stripZnPrefix(val: unknown): string | null {
  if (val === null || val === undefined || val === "") return null
  const s = String(val)
  return (s.split(":").pop() ?? s).trim() || null
}

function rawDataValue(r: Record<string, unknown>, ...keys: string[]): unknown {
  const rd = r.raw_data as Record<string, unknown> | null | undefined
  if (!rd) return null
  for (const k of keys) {
    const v = rd[k]
    if (v !== null && v !== undefined && v !== "") return v
  }
  return null
}

function mimeLabel(mime: string | null): { label: string; color: string } {
  if (!mime) return { label: "FILE", color: "var(--text-muted)" }
  if (mime === "application/pdf")         return { label: "PDF",  color: "#f85149" }
  if (mime.startsWith("image/"))          return { label: "BILD", color: "#58a6ff" }
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime === "text/csv")
    return { label: "CSV",  color: "#3fb950" }
  if (mime.includes("word"))              return { label: "WORD", color: "#58a6ff" }
  return { label: "FILE", color: "var(--text-muted)" }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function PortalObjectDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [
    { data: customer },
    { data: telesonRecords },
    { data: documents },
  ] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("teleson_records").select("*").eq("customer_id", id).order("energie").order("created_at", { ascending: false }),
    supabase.from("customer_documents")
      .select("id, name, title, mime_type, size_bytes, created_at")
      .eq("customer_id", id)
      .eq("visible_to_customer", true)
      .order("created_at", { ascending: false }),
  ])

  if (!customer) notFound()

  const c       = customer as Record<string, unknown>
  const objType = c.object_type as string | null

  // ── Teleson groups for the table separators ────────────────────────────
  const energieGroups = new Map<string, typeof telesonRecords>()
  for (const r of telesonRecords ?? []) {
    const key = (r.energie ?? "sonstige").toLowerCase()
    if (!energieGroups.has(key)) energieGroups.set(key, [])
    energieGroups.get(key)!.push(r)
  }

  // ── Aktuelle Daten data ────────────────────────────────────────────────
  const sortedTeleson = [...(telesonRecords ?? [])].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
  )
  const keyMalo  = sortedTeleson.map(r => r.malo).find(Boolean) ?? null
  const keyStrom = sortedTeleson.find(r => (r.energie ?? "").toLowerCase() === "strom") ?? null
  const keyGas   = sortedTeleson.find(r => (r.energie ?? "").toLowerCase() === "gas")   ?? null
  const stromKnr = (keyStrom?.knr as string | null) ?? null
  const gasKnr   = (keyGas?.knr   as string | null) ?? null

  const SECTION_STYLE: React.CSSProperties = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)", overflow: "hidden",
  }
  const SECTION_HDR: React.CSSProperties = {
    padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)",
  }
  const TD = "var(--space-3) var(--space-4)"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
        <a href="/portal/objects" style={{ color: "var(--primary-bright)", textDecoration: "none" }}>Objekte</a>
        {" / "}
        {getStreet(customer.full_name as string)}
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/building-placeholder.jpg" alt="Gebäude" style={{ width: "56px", height: "56px", borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>
              {getStreet(customer.full_name as string)}
            </h1>
            <span style={{
              background: "rgba(139,148,158,0.12)", color: "var(--text-muted)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
              padding: "2px 10px", fontSize: "var(--text-xs)", fontWeight: 600,
            }}>{objType === "weg" ? "WEG" : "Privat"}</span>
          </div>

          {/* Read-only status (no dropdown) */}
          <StatusBadge status={customer.status as string} />
        </div>

      </div>

      {/* ── Aktuelle Daten ───────────────────────────────────────────────── */}
      <div style={SECTION_STYLE}>
        <div style={SECTION_HDR}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Aktuelle Daten</h2>
        </div>
        <KeyFactsCard
          malo={keyMalo}
          stromVersorger={(keyStrom?.neuer_versorger as string | null) ?? null}
          stromNeuAp={keyStrom?.neu_ap}
          stromKnr={stromKnr}
          gasVersorger={(keyGas?.neuer_versorger as string | null) ?? null}
          gasNeuAp={keyGas?.neu_ap}
          gasKnr={gasKnr}
        />
      </div>

      {/* ── Teleson-Datensätze ───────────────────────────────────────────── */}
      <div style={SECTION_STYLE}>
        <div style={SECTION_HDR}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>
            Teleson-Datensätze
            {(telesonRecords?.length ?? 0) > 0 && (
              <span style={{ fontWeight: 400, fontSize: "var(--text-sm)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
                ({telesonRecords!.length})
              </span>
            )}
          </h2>
        </div>

        {(telesonRecords?.length ?? 0) > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Energie", "Status", "Neuer Versorger", "Lieferstatus", "Vorversorger",
                    "Zählernummer", "Malo", "VVR KNR", "KNR", "Grund/Info",
                    "Belieferung ab", "Verbrauch kWh", "Alt-AP", "Neu-AP", "Laufzeit", "Gebunden bis",
                  ].map(h => (
                    <th key={h} style={{ padding: TD, textAlign: "left", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {energieGroups.size > 1
                  ? [...energieGroups.entries()].flatMap(([key, recs]) => {
                      const s = ENERGIE_COLORS[key] ?? { bg: "rgba(139,148,158,0.08)", color: "var(--text-muted)" }
                      return [
                        <tr key={`sep-${key}`}>
                          <td colSpan={16} style={{
                            padding: "6px var(--space-4)",
                            background: s.bg,
                            borderBottom: "1px solid var(--border)",
                            borderTop: "1px solid var(--border)",
                            fontSize: "11px", fontWeight: 700, color: s.color,
                            letterSpacing: "0.04em",
                          }}>
                            {ENERGIE_ICONS[key] ?? "⚡"} {key.toUpperCase()} ({recs!.length})
                          </td>
                        </tr>,
                        ...(recs ?? []).map(r => renderTelesonRow(r, TD)),
                      ]
                    })
                  : (telesonRecords ?? []).map(r => renderTelesonRow(r, TD))
                }
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Keine Teleson-Datensätze für dieses Objekt vorhanden.
          </div>
        )}
      </div>

      {/* ── Dokumente (read-only, nur sichtbare) ──────────────────────────── */}
      <div style={SECTION_STYLE}>
        <div style={SECTION_HDR}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>
            Dokumente
            {(documents?.length ?? 0) > 0 && (
              <span style={{ fontWeight: 400, fontSize: "var(--text-sm)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
                ({documents!.length})
              </span>
            )}
          </h2>
        </div>

        {(documents?.length ?? 0) > 0 ? (
          <div style={{ padding: "var(--space-4) var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {(documents ?? []).map(doc => {
              const { label, color } = mimeLabel(doc.mime_type)
              const displayName      = doc.title?.trim() || doc.name
              return (
                <div key={doc.id} style={{
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
                  fontSize: "var(--text-sm)",
                }}>
                  <span style={{
                    background: `${color}20`, color, border: `1px solid ${color}44`,
                    borderRadius: "var(--radius-sm)", padding: "1px 6px",
                    fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
                  }}>{label}</span>

                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayName}
                  </span>

                  <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {formatBytes(doc.size_bytes)} · {new Date(doc.created_at).toLocaleDateString("de-DE")}
                  </span>

                  <a href={`/api/documents/${doc.id}`} target="_blank" rel="noreferrer" style={{
                    color: "var(--primary-bright)", textDecoration: "none", fontSize: "var(--text-xs)",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    Öffnen ↗
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Noch keine Dokumente verfügbar.
          </div>
        )}
      </div>

    </div>
  )
}

// ── Aktuelle-Daten-Card ─────────────────────────────────────────────────────

function KeyFactsCard({
  malo, stromVersorger, stromNeuAp, stromKnr, gasVersorger, gasNeuAp, gasKnr,
}: {
  malo:           string | null
  stromVersorger: string | null
  stromNeuAp:     unknown
  stromKnr:       string | null
  gasVersorger:   string | null
  gasNeuAp:       unknown
  gasKnr:         string | null
}) {
  const ROW: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    gap: "var(--space-3)", padding: "var(--space-2) 0",
    borderBottom: "1px solid var(--border)",
  }
  const LBL: React.CSSProperties = {
    color: "var(--text-muted)", fontSize: "var(--text-xs)",
    textTransform: "uppercase", letterSpacing: "0.04em",
  }
  const VAL: React.CSSProperties = {
    fontSize: "var(--text-sm)", fontWeight: 500,
    fontFamily: "monospace",
    textAlign: "right",
  }
  const CHIP: React.CSSProperties = {
    background: "rgba(255,166,0,0.1)", color: "#ffa600",
    border: "1px solid rgba(255,166,0,0.3)",
    borderRadius: "var(--radius-sm)", padding: "1px 7px",
    fontSize: "var(--text-xs)", fontFamily: "monospace", fontWeight: 500,
    whiteSpace: "nowrap",
  }
  const muted = <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>—</span>
  const apHasValue = (v: unknown) => v !== null && v !== undefined && v !== ""

  function tarifCell(versorger: string | null, neuAp: unknown) {
    if (!versorger && !apHasValue(neuAp)) return muted
    return (
      <div style={{ textAlign: "right" }}>
        {versorger && (
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{versorger}</div>
        )}
        {apHasValue(neuAp) && (
          <div style={{ fontSize: "var(--text-xs)", color: "#3fb950", fontWeight: 600 }}>
            {fmtAp(neuAp)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: "var(--space-3) var(--space-6)" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={ROW}>
          <span style={LBL}>Malo</span>
          <span style={VAL}>{malo ?? muted}</span>
        </div>

        <div style={ROW}>
          <span style={LBL}>Strom</span>
          {tarifCell(stromVersorger, stromNeuAp)}
        </div>

        <div style={ROW}>
          <span style={LBL}>Strom KdNr</span>
          {stromKnr ? <span style={CHIP}>{stromKnr}</span> : muted}
        </div>

        <div style={ROW}>
          <span style={LBL}>Gas</span>
          {tarifCell(gasVersorger, gasNeuAp)}
        </div>

        <div style={{ ...ROW, borderBottom: "none" }}>
          <span style={LBL}>Gas KdNr</span>
          {gasKnr ? <span style={CHIP}>{gasKnr}</span> : muted}
        </div>
      </div>
    </div>
  )
}

// ── Teleson row renderer ────────────────────────────────────────────────────

function renderTelesonRow(r: Record<string, unknown>, TD: string) {
  const vvrKnr    = rawDataValue(r, "VVR KNR", "VVR-KNR", "Vor KNR", "Vorversorger KNR", "VorversorgerKNR")
                ?? r.vvr_knr ?? null
  const verbrauch = rawDataValue(r, "Verbrauch kWh", "Verbrauch", "Jahresverbrauch", "Jahresverbrauch kWh")
                ?? r.jahresverbrauch_kwh ?? null
  return (
    <tr key={r.id as string} style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: TD }}>{energieBadge(r.energie as string | null) ?? "—"}</td>
      <td style={{ padding: TD }}>{telesonStatusBadge(r.status as string | null)}</td>
      <td style={{ padding: TD }}><Cell v={r.neuer_versorger} /></td>
      <td style={{ padding: TD }}><Cell v={r.lieferstatus} /></td>
      <td style={{ padding: TD }}><Cell v={r.vorversorger} /></td>
      <td style={{ padding: TD, fontFamily: "monospace" }}><Cell v={stripZnPrefix(r.zaehlernummer)} /></td>
      <td style={{ padding: TD, fontFamily: "monospace" }}><Cell v={r.malo} /></td>
      <td style={{ padding: TD, fontFamily: "monospace" }}><Cell v={vvrKnr} /></td>
      <td style={{ padding: TD, fontFamily: "monospace" }}><Cell v={r.knr} /></td>
      <td style={{ padding: TD }}><Cell v={r.grund_info} /></td>
      <td style={{ padding: TD, whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
        {r.belieferungsdatum ? new Date(r.belieferungsdatum as string).toLocaleDateString("de-DE") : "—"}
      </td>
      <td style={{ padding: TD, whiteSpace: "nowrap" }}>
        {verbrauch != null
          ? <span>{Number(verbrauch).toLocaleString("de-DE")} kWh</span>
          : <span style={{ color: "var(--text-muted)" }}>—</span>}
      </td>
      <td style={{ padding: TD, whiteSpace: "nowrap" }}>
        <span style={{ color: "#f85149", fontSize: "var(--text-xs)" }}>
          {fmtAp(r.alt_ap_ct_kwh)}
        </span>
      </td>
      <td style={{ padding: TD, whiteSpace: "nowrap" }}>
        <strong style={{ color: "#3fb950", fontSize: "var(--text-xs)" }}>{fmtAp(r.neu_ap)}</strong>
      </td>
      <td style={{ padding: TD }}><Cell v={r.laufzeit} /></td>
      <td style={{ padding: TD, whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
        {r.gebunden_bis ? new Date(r.gebunden_bis as string).toLocaleDateString("de-DE") : "—"}
      </td>
    </tr>
  )
}
