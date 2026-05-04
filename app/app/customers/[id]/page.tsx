import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NoteForm } from "./NoteForm"
import { StatusSelect } from "./StatusSelect"
import { DocumentsSection } from "./DocumentsSection"
import { StammdatenForm, type OrgOption } from "./StammdatenForm"
import type { DocumentRow } from "./DocumentsSection"

export const metadata = { title: "Objektdetail | UtilityHub" }

interface Props {
  params: Promise<{ id: string }>
}

// ── Visual helpers ──────────────────────────────────────────────────────────

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

const UPSELL_STATUS: Record<string, { label: string; color: string }> = {
  open:        { label: "Offen",           color: "#ffa600" },
  in_progress: { label: "In Bearbeitung",  color: "#58a6ff" },
  won:         { label: "Gewonnen",        color: "#3fb950" },
  lost:        { label: "Verloren",        color: "#8b949e" },
}

const UPSELL_PRIORITY: Record<string, { label: string; color: string }> = {
  high:   { label: "Hoch",    color: "#f85149" },
  medium: { label: "Mittel",  color: "#ffa600" },
  low:    { label: "Niedrig", color: "#8b949e" },
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

function fmtDate(val: string | null | undefined) {
  if (!val) return "—"
  return new Date(val).toLocaleDateString("de-DE")
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

function getStreet(fullName: string): string {
  const idx = fullName.indexOf(" / ")
  return idx >= 0 ? (fullName.slice(idx + 3).trim() || fullName) : fullName
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

// ── Page ────────────────────────────────────────────────────────────────────

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: customer },
    { data: identities },
    { data: telesonRecords },
    { data: fgFinanzRecords },
    { data: upsellRecords },
    { data: notes },
    { data: documents },
    { data: orgList },
  ] = await Promise.all([
    supabase.from("customers").select("*, organization:organizations!organization_id(id, name)").eq("id", id).single(),
    supabase.from("customer_identities").select("*").eq("customer_id", id).order("created_at"),
    supabase.from("teleson_records").select("*").eq("customer_id", id).order("energie").order("created_at", { ascending: false }),
    supabase.from("fg_finanz_records").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("upsell_opportunities").select("*, assigned_to:profiles!assigned_to(full_name)").eq("customer_id", id).order("status").order("created_at", { ascending: false }),
    supabase.from("customer_notes").select("id, content, is_internal, created_at, author:profiles!author_id(full_name)").eq("customer_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("customer_documents").select("id, name, title, doc_type, mime_type, size_bytes, created_at, source, visible_to_customer, uploaded_by:profiles!uploaded_by(full_name)").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("organizations").select("id, name").order("name"),
  ])

  if (!customer) notFound()

  const c          = customer as Record<string, unknown>
  const orgData    = (c.organization as { id: string; name: string } | null)
  const objType    = c.object_type as string | null
  const orgs: OrgOption[] = (orgList ?? []) as OrgOption[]

  // ── Completeness summary ────────────────────────────────────────────────
  const energieGroups = new Map<string, typeof telesonRecords>()
  for (const r of telesonRecords ?? []) {
    const key = (r.energie ?? "sonstige").toLowerCase()
    if (!energieGroups.has(key)) energieGroups.set(key, [])
    energieGroups.get(key)!.push(r)
  }

  const docCount      = (documents ?? []).length
  const docVisible    = (documents ?? []).filter(d => d.visible_to_customer).length
  const fgCount       = (fgFinanzRecords ?? []).length
  const openPotenziale = (upsellRecords ?? []).filter(r => r.status === "open").length

  // ── Key Facts (read-only summary) ───────────────────────────────────────
  const sortedTeleson = [...(telesonRecords ?? [])].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
  )
  const keyMalo  = sortedTeleson.map(r => r.malo).find(Boolean) ?? null
  const keyStrom = sortedTeleson.find(r => (r.energie ?? "").toLowerCase() === "strom") ?? null
  const keyGas   = sortedTeleson.find(r => (r.energie ?? "").toLowerCase() === "gas")   ?? null
  const stromKnr = (keyStrom?.knr as string | null) ?? null
  const gasKnr   = (keyGas?.knr   as string | null) ?? null

  // ── Stammdaten form initial ─────────────────────────────────────────────
  const stammdatenInitial = {
    full_name:        String(c.full_name ?? ""),
    email:            String(c.email ?? ""),
    phone:            String(c.phone ?? ""),
    address:          String(c.address ?? ""),
    city:             String(c.city ?? ""),
    postal_code:      String(c.postal_code ?? ""),
    object_type:      objType === "weg" ? "weg" : "privat",
    organization_id:  String(c.organization_id ?? ""),
  }

  const metaFields: [string, unknown][] = [
    ["Quelle",       c.source],
    ["Aktualisiert", fmtDate(c.updated_at as string)],
  ]

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-sm)" }}>
        <div style={{ color: "var(--text-muted)" }}>
          <a href="/app/customers" style={{ color: "var(--primary-bright)", textDecoration: "none" }}>Objekte</a>
          {" / "}
          {getStreet(customer.full_name)}
        </div>
        <a href={`/app/customers/${id}/print`} target="_blank" rel="noreferrer" style={{
          color: "var(--text-muted)", textDecoration: "none", fontSize: "var(--text-xs)",
          border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "3px 10px",
        }}>
          Drucken / PDF ↗
        </a>
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5) var(--space-6)" }}>

        {/* Row 1: Name + badges + Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>
              {getStreet(customer.full_name)}
            </h1>

            {/* UHID badge */}
            {(c.uhid as string | null) && (
              <span style={{
                background: "var(--surface-2)", color: "var(--text-muted)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                padding: "2px 8px", fontSize: "var(--text-xs)", fontWeight: 600,
                fontFamily: "monospace",
              }}>{c.uhid as string}</span>
            )}

            {/* Object type badge */}
            <span style={{
              background: "rgba(139,148,158,0.12)", color: "var(--text-muted)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
              padding: "2px 10px", fontSize: "var(--text-xs)", fontWeight: 600,
            }}>{objType === "weg" ? "WEG" : "Privat"}</span>

            {/* Hausverwaltung */}
            {orgData && (
              <span style={{
                background: "rgba(56,139,253,0.08)", color: "#58a6ff",
                border: "1px solid rgba(56,139,253,0.25)", borderRadius: "var(--radius-sm)",
                padding: "2px 10px", fontSize: "var(--text-xs)", fontWeight: 500,
              }}>🏢 {orgData.name}</span>
            )}

          </div>

          <StatusSelect customerId={id} currentStatus={customer.status} />
        </div>

        {/* Row 2: Address */}
        {((c.address_display as string | null) || (c.city as string | null)) && (
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
            {(c.address_display as string) ?? [c.address, c.city, c.postal_code].filter(Boolean).join(", ")}
          </div>
        )}

        {/* Row 3: Completeness chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--border)" }}>

          {/* Energie */}
          {energieGroups.size > 0 ? (
            [...energieGroups.entries()].map(([key, recs]) => {
              const s = ENERGIE_COLORS[key] ?? { bg: "rgba(139,148,158,0.12)", color: "var(--text-muted)" }
              return (
                <span key={key} style={{
                  background: s.bg, color: s.color, border: `1px solid ${s.color}33`,
                  borderRadius: "var(--radius-sm)", padding: "2px 9px",
                  fontSize: "var(--text-xs)", fontWeight: 600,
                }}>
                  {ENERGIE_ICONS[key] ?? "⚡"} {recs!.length} {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              )
            })
          ) : (
            <span style={{
              background: "rgba(139,148,158,0.08)", color: "var(--text-muted)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
              padding: "2px 9px", fontSize: "var(--text-xs)",
            }}>Keine Energiedaten</span>
          )}

          {/* FG Finanz */}
          <span style={{
            background: fgCount > 0 ? "rgba(167,139,250,0.1)" : "rgba(139,148,158,0.08)",
            color:      fgCount > 0 ? "#a78bfa" : "var(--text-muted)",
            border:    `1px solid ${fgCount > 0 ? "rgba(167,139,250,0.3)" : "var(--border)"}`,
            borderRadius: "var(--radius-sm)", padding: "2px 9px", fontSize: "var(--text-xs)", fontWeight: 600,
          }}>
            💼 {fgCount > 0 ? `${fgCount} FG-Finanz-Datensatz${fgCount > 1 ? "sätze" : ""}` : "Kein FG-Finanz-Bezug"}
          </span>

          {/* Dokumente */}
          <span style={{
            background: docCount > 0 ? "rgba(56,139,253,0.08)" : "rgba(139,148,158,0.08)",
            color:      docCount > 0 ? "#58a6ff" : "var(--text-muted)",
            border:    `1px solid ${docCount > 0 ? "rgba(56,139,253,0.25)" : "var(--border)"}`,
            borderRadius: "var(--radius-sm)", padding: "2px 9px", fontSize: "var(--text-xs)", fontWeight: 600,
          }}>
            📁 {docCount > 0
              ? `${docCount} Dokument${docCount > 1 ? "e" : ""}${docVisible > 0 ? ` (${docVisible} sichtbar)` : ""}`
              : "Keine Dokumente"}
          </span>

          {/* Offene Potenziale */}
          {openPotenziale > 0 && (
            <span style={{
              background: "rgba(255,166,0,0.1)", color: "#ffa600",
              border: "1px solid rgba(255,166,0,0.3)",
              borderRadius: "var(--radius-sm)", padding: "2px 9px", fontSize: "var(--text-xs)", fontWeight: 600,
            }}>
              🎯 {openPotenziale} offen{openPotenziale > 1 ? "e Potenziale" : "es Potenzial"}
            </span>
          )}
        </div>

      </div>

      {/* ── Stammdaten ───────────────────────────────────────────────────── */}
      <div style={SECTION_STYLE}>
        <div style={{ ...SECTION_HDR, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Stammdaten</h2>
          <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            {metaFields.map(([label, value]) => (
              <span key={label as string}>{label as string}: <strong style={{ color: "var(--text)", fontWeight: 500 }}>{(value as string) ?? "—"}</strong></span>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr" }}>
          <div style={{ borderRight: "1px solid var(--border)" }}>
            <StammdatenForm customerId={id} initial={stammdatenInitial} orgs={orgs} />
          </div>
          <KeyFactsCard
            uhid={(c.uhid as string | null) ?? null}
            malo={keyMalo}
            stromVersorger={(keyStrom?.neuer_versorger as string | null) ?? null}
            stromNeuAp={keyStrom?.neu_ap}
            stromKnr={stromKnr}
            gasVersorger={(keyGas?.neuer_versorger as string | null) ?? null}
            gasNeuAp={keyGas?.neu_ap}
            gasKnr={gasKnr}
          />
        </div>
      </div>

      {/* ── Teleson-Datensätze ────────────────────────────────────────────── */}
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
                        // Group separator row
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

      {/* ── FG Finanz ────────────────────────────────────────────────────── */}
      <div style={SECTION_STYLE}>
        <div style={SECTION_HDR}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>
            FG Finanz
            {fgCount > 0 && (
              <span style={{ fontWeight: 400, fontSize: "var(--text-sm)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
                ({fgCount})
              </span>
            )}
          </h2>
        </div>
        {fgCount > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Produkt", "Tarif", "Vertrag-ID", "Rechnung", "Auszahlung", "Verbrauch kWh", "Netzgebiet", "Provision €", "Prov.-Status", "Typ"].map(h => (
                    <th key={h} style={{ padding: TD, textAlign: "left", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(fgFinanzRecords ?? []).map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: TD }}><Cell v={r.produkt} /></td>
                    <td style={{ padding: TD }}><Cell v={r.tarif} /></td>
                    <td style={{ padding: TD, fontFamily: "monospace" }}><Cell v={r.vertrag_id} /></td>
                    <td style={{ padding: TD, whiteSpace: "nowrap" }}>{fmtDate(r.rechnungs_datum)}</td>
                    <td style={{ padding: TD, whiteSpace: "nowrap" }}>{fmtDate(r.auszahlungs_datum)}</td>
                    <td style={{ padding: TD }}>
                      {r.jahresverbrauch_kwh != null
                        ? <span>{Number(r.jahresverbrauch_kwh).toLocaleString("de-DE")} kWh</span>
                        : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: TD }}><Cell v={r.netzgebiet} /></td>
                    <td style={{ padding: TD }}>
                      {r.provision_betrag != null
                        ? <strong>{Number(r.provision_betrag).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</strong>
                        : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: TD }}><Cell v={r.provision_status} /></td>
                    <td style={{ padding: TD }}><Cell v={r.provision_type} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Keine FG-Finanz-Datensätze für dieses Objekt vorhanden.
          </div>
        )}
      </div>

      {/* ── Dokumente ────────────────────────────────────────────────────── */}
      <DocumentsSection
        customerId={id}
        documents={(documents ?? []) as unknown as DocumentRow[]}
      />

      {/* ── Offene Potenziale ────────────────────────────────────────────── */}
      <div style={SECTION_STYLE}>
        <div style={SECTION_HDR}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>
            Offene Potenziale
            {(upsellRecords?.length ?? 0) > 0 && (
              <span style={{ fontWeight: 400, fontSize: "var(--text-sm)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
                ({upsellRecords!.length})
              </span>
            )}
          </h2>
        </div>
        {(upsellRecords?.length ?? 0) > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Titel", "Status", "Priorität", "Zugewiesen an", "Fälligkeit", "Angelegt"].map(h => (
                    <th key={h} style={{ padding: TD, textAlign: "left", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(upsellRecords ?? []).map(r => {
                  const statusInfo = UPSELL_STATUS[r.status]   ?? { label: r.status,   color: "var(--text-muted)" }
                  const prioInfo   = UPSELL_PRIORITY[r.priority] ?? { label: r.priority, color: "var(--text-muted)" }
                  const assignee   = (r.assigned_to as { full_name?: string } | null)?.full_name ?? "—"
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: TD, fontWeight: 500 }}>{r.title}</td>
                      <td style={{ padding: TD }}>
                        <span style={{
                          background: `${statusInfo.color}18`, color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}44`,
                          borderRadius: "var(--radius-sm)", padding: "1px 8px",
                          fontSize: "var(--text-xs)", fontWeight: 600, whiteSpace: "nowrap",
                        }}>{statusInfo.label}</span>
                      </td>
                      <td style={{ padding: TD }}>
                        <span style={{ color: prioInfo.color, fontWeight: 600, fontSize: "var(--text-xs)" }}>{prioInfo.label}</span>
                      </td>
                      <td style={{ padding: TD, color: "var(--text-muted)" }}>{assignee}</td>
                      <td style={{ padding: TD, whiteSpace: "nowrap", color: "var(--text-muted)" }}>{fmtDate(r.due_date)}</td>
                      <td style={{ padding: TD, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(r.created_at).toLocaleDateString("de-DE")}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Keine offenen Potenziale für dieses Objekt erfasst.
          </div>
        )}
      </div>

{/* ── Interne Notizen ──────────────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
        <h2 style={{ fontSize: "var(--text-base)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
          Interne Notizen
          {notes && notes.length > 0 && (
            <span style={{ fontWeight: 400, fontSize: "var(--text-sm)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
              ({notes.length})
            </span>
          )}
        </h2>
        {notes && notes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
            {notes.map(n => {
              const author     = (n.author as { full_name?: string } | null)
              const authorName = author?.full_name?.trim() || "Unbekannt"
              return (
                <div key={n.id} style={{
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)",
                  fontSize: "var(--text-sm)",
                }}>
                  <p style={{ margin: 0, marginBottom: "var(--space-3)", whiteSpace: "pre-wrap" }}>{n.content}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                      {authorName}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                      {new Date(n.created_at).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <NoteForm customerId={id} />
      </div>

    </div>
  )
}

// ── Teleson row renderer (extracted to avoid repetition in grouped/flat mode) ──
function renderTelesonRow(
  r: Record<string, unknown>,
  TD: string,
) {
  const vvrKnr   = rawDataValue(r, "VVR KNR", "VVR-KNR", "Vor KNR", "Vorversorger KNR", "VorversorgerKNR")
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

// ── Key Facts read-only card ────────────────────────────────────────────────
function KeyFactsCard({
  uhid, malo, stromVersorger, stromNeuAp, stromKnr, gasVersorger, gasNeuAp, gasKnr,
}: {
  uhid:           string | null
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
    <div style={{ padding: "var(--space-3) var(--space-4)" }}>
      <h3 style={{
        fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: "var(--space-3)",
      }}>
        Aktuelle Daten
      </h3>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* 0. UHID */}
        <div style={ROW}>
          <span style={LBL}>UHID</span>
          <span style={VAL}>{uhid ?? muted}</span>
        </div>

        {/* 1. Malo */}
        <div style={ROW}>
          <span style={LBL}>Malo</span>
          <span style={VAL}>{malo ?? muted}</span>
        </div>

        {/* 2. Strom */}
        <div style={ROW}>
          <span style={LBL}>Strom</span>
          {tarifCell(stromVersorger, stromNeuAp)}
        </div>

        {/* 3. Strom KdNr */}
        <div style={ROW}>
          <span style={LBL}>Strom KdNr</span>
          {stromKnr ? <span style={CHIP}>{stromKnr}</span> : muted}
        </div>

        {/* 4. Gas */}
        <div style={ROW}>
          <span style={LBL}>Gas</span>
          {tarifCell(gasVersorger, gasNeuAp)}
        </div>

        {/* 5. Gas KdNr */}
        <div style={{ ...ROW, borderBottom: "none" }}>
          <span style={LBL}>Gas KdNr</span>
          {gasKnr ? <span style={CHIP}>{gasKnr}</span> : muted}
        </div>
      </div>
    </div>
  )
}
