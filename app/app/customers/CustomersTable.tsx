"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { getStreet } from "@/lib/customers/format"

interface Identity { system: string; external_id: string }

interface TelesonSummary {
  energie:        string | null
  neuer_versorger: string | null
  neu_ap:          string | null
  zaehlernummer:  string | null
  malo:           string | null
  status:         string | null
  created_at:     string | null
}

export interface CustomerRow {
  id:                   string
  uhid:                 string | null
  full_name:            string
  email:                string | null
  phone:                string | null
  city:                 string | null
  postal_code:          string | null
  address_display:      string | null
  status:               string
  source:               string | null
  created_at:           string
  object_type:          string | null
  customer_identities:  Identity[] | null
  teleson_records:      TelesonSummary[] | null
  organizations:        { name: string } | null
  fg_finanz_records:    { id: string }[] | null
  upsell_opportunities: { id: string; status: string }[] | null
}

const ENERGIE_COLORS: Record<string, string> = {
  strom: "#58a6ff", gas: "#ffa600", wärme: "#f85149", wasser: "#3fb950",
}

function fmtAp(val: string | null): string {
  if (!val) return ""
  const n = parseFloat(String(val).replace(",", "."))
  if (isNaN(n)) return ""
  return n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " ct"
}

function MonoCell({ value }: { value: string | null }) {
  if (!value) return <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
  return <span style={{ fontFamily: "monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{value}</span>
}

function TarifCell({ records, energie }: { records: TelesonSummary[] | null; energie: string }) {
  const match = (records ?? []).find(r => r.energie?.toLowerCase() === energie.toLowerCase())
  if (!match) return <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
  const color  = ENERGIE_COLORS[energie.toLowerCase()] ?? "var(--text-muted)"
  const apText = fmtAp(match.neu_ap)
  return (
    <div style={{ fontSize: "var(--text-xs)", lineHeight: 1.4, color }}>
      {match.neuer_versorger && (
        <div style={{ fontWeight: 600 }}>{match.neuer_versorger}</div>
      )}
      {apText && (
        <div>{apText}</div>
      )}
      {!match.neuer_versorger && !apText && (
        <span style={{ color: "var(--text-muted)" }}>—</span>
      )}
    </div>
  )
}

function LieferstelleCell({ records }: { records: TelesonSummary[] | null }) {
  const first = (records ?? []).find(r => r.zaehlernummer || r.malo)
  const val   = first?.zaehlernummer ?? first?.malo
  if (!val) return <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
  return <span style={{ fontFamily: "monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{val}</span>
}

function TelesonStatusCell({ records }: { records: TelesonSummary[] | null }) {
  const statuses = [...new Set((records ?? []).map(r => r.status).filter((s): s is string => !!s))]
  if (!statuses.length) return <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {statuses.slice(0, 2).map(s => (
        <span key={s} style={{
          fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap",
          color: "var(--text-muted)",
        }}>{s}</span>
      ))}
      {statuses.length > 2 && (
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>+{statuses.length - 2}</span>
      )}
    </div>
  )
}

function PotenzialCell({ records }: { records: { id: string; status: string }[] | null }) {
  const open = (records ?? []).filter(r => r.status === "open").length
  if (!open) return <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, color: "#ffa600" }}>
      {open} offen
    </span>
  )
}

interface OrgOption { id: string; name: string }

interface Props {
  customers:         CustomerRow[]
  total:             number
  page:              number
  pageSize:          number
  totalPages:        number
  q:                 string
  status:            string
  energie:           string
  tStatus:           string
  orgId:             string
  objectType:        string
  energieOptions:    string[]
  tStatusOptions:    string[]
  orgOptions:        OrgOption[]
}

const STATUS_FILTERS: { value: string; label: string; color: string }[] = [
  { value: "",         label: "Alle",       color: "var(--text-muted)" },
  { value: "active",   label: "Aktiv",      color: "#3fb950"           },
  { value: "inactive", label: "Inaktiv",    color: "#8b949e"           },
  { value: "blocked",  label: "Gesperrt",   color: "#f85149"           },
  { value: "pending",  label: "Ausstehend", color: "#8b949e"           },
]

interface UrlParams {
  q?: string; status?: string; energie?: string; tStatus?: string
  orgId?: string; objectType?: string; page?: number
}

function pageUrl(p: UrlParams): string {
  const params = new URLSearchParams()
  if (p.q)          params.set("q",          p.q)
  if (p.status)     params.set("status",     p.status)
  if (p.energie)    params.set("energie",    p.energie)
  if (p.tStatus)    params.set("tStatus",    p.tStatus)
  if (p.orgId)      params.set("orgId",      p.orgId)
  if (p.objectType) params.set("objectType", p.objectType)
  if (p.page && p.page > 1) params.set("page", String(p.page))
  const qs = params.toString()
  return `/app/customers${qs ? `?${qs}` : ""}`
}

const SELECT_STYLE: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", padding: "var(--space-1) var(--space-3)",
  color: "var(--text)", fontSize: "var(--text-xs)", cursor: "pointer", outline: "none",
}

const NAV_BTN: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", padding: "var(--space-1) var(--space-4)",
  color: "var(--text)", fontSize: "var(--text-sm)",
  textDecoration: "none", whiteSpace: "nowrap",
}

export function CustomersTable({
  customers, total, page, pageSize, totalPages,
  q, status, energie, tStatus, orgId, objectType,
  energieOptions, tStatusOptions, orgOptions,
}: Props) {
  const router  = useRouter()
  const mounted = useRef(false)
  const [input, setInput] = useState(q)

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    const timer = setTimeout(() => {
      router.push(pageUrl({ q: input, status, energie, tStatus, orgId, objectType, page: 1 }))
    }, 350)
    return () => clearTimeout(timer)
  }, [input]) // eslint-disable-line react-hooks/exhaustive-deps

  const from      = (page - 1) * pageSize + 1
  const to        = Math.min(page * pageSize, total)
  const hasFilter = !!(q || status || energie || tStatus || orgId || objectType)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center" }}>

        <input
          type="search"
          placeholder="Name, Objekt oder KNR suchen…"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ ...SELECT_STYLE, padding: "var(--space-2) var(--space-4)", fontSize: "var(--text-sm)", width: "260px" }}
        />

        {orgOptions.length > 0 && (
          <select
            value={orgId}
            onChange={e => router.push(pageUrl({ q: input, status, energie, tStatus, orgId: e.target.value, objectType, page: 1 }))}
            style={{ ...SELECT_STYLE, color: orgId ? "var(--text)" : "var(--text-muted)" }}
          >
            <option value="">Alle Hausverwaltungen</option>
            {orgOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}

        <select
          value={objectType}
          onChange={e => router.push(pageUrl({ q: input, status, energie, tStatus, orgId, objectType: e.target.value, page: 1 }))}
          style={{ ...SELECT_STYLE, color: objectType ? "var(--text)" : "var(--text-muted)" }}
        >
          <option value="">Alle Typen</option>
          <option value="weg">WEG</option>
          <option value="privat">Privat</option>
        </select>

        <select
          value={energie}
          onChange={e => router.push(pageUrl({ q: input, status, energie: e.target.value, tStatus, orgId, objectType, page: 1 }))}
          style={{ ...SELECT_STYLE, color: energie ? "var(--text)" : "var(--text-muted)" }}
        >
          <option value="">Alle Energiearten</option>
          {energieOptions.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        <select
          value={tStatus}
          onChange={e => router.push(pageUrl({ q: input, status, energie, tStatus: e.target.value, orgId, objectType, page: 1 }))}
          style={{ ...SELECT_STYLE, color: tStatus ? "var(--text)" : "var(--text-muted)" }}
        >
          <option value="">Alle Teleson-Status</option>
          {tStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => {
            const isActive = status === f.value
            return (
              <a key={f.value} href={pageUrl({ q: input, status: f.value, energie, tStatus, orgId, objectType, page: 1 })} style={{
                background:     isActive ? `${f.color}22` : "var(--surface-2)",
                border:         `1px solid ${isActive ? f.color : "var(--border)"}`,
                borderRadius:   "999px", padding: "3px 12px",
                fontSize:       "var(--text-xs)", fontWeight: isActive ? 700 : 500,
                color:          isActive ? f.color : "var(--text-muted)",
                textDecoration: "none", whiteSpace: "nowrap",
              }}>{f.label}</a>
            )
          })}
        </div>

        {hasFilter && (
          <a href="/app/customers" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textDecoration: "underline" }}>
            Zurücksetzen
          </a>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {customers.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Objekt", "UHID", "Adresse", "Hausverwaltung", "Malo", "Zählernummer", "KNR", "Strom", "Gas", "Potenzial", "Typ", "Status"].map(h => (
                    <th key={h} style={{ padding: "var(--space-3) var(--space-4)", textAlign: "left", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => {
                  const knr   = c.customer_identities?.find(i => i.system === "knr" || i.system === "teleson")?.external_id ?? null
                  const malo  = (c.teleson_records ?? []).map(r => r.malo).find(Boolean) ?? null
                  const latestRec = [...(c.teleson_records ?? [])].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0]
                  const zNrRaw = latestRec?.zaehlernummer ?? null
                  const zNr    = zNrRaw ? ((zNrRaw.split(":").pop() ?? zNrRaw).trim() || null) : null
                  // Objekt: extract street part after the slash (tolerates "\n" or any whitespace).
                  const objektLabel = getStreet(c.full_name)
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>

                      {/* Objekt */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        <a href={`/app/customers/${c.id}`} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none", color: "inherit" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/building-placeholder.jpg" alt="Gebäude" style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
                          <span style={{ fontWeight: 600, color: "#ffffff" }}>{objektLabel}</span>
                        </a>
                      </td>

                      {/* UHID */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        {c.uhid
                          ? <span style={{ fontFamily: "monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{c.uhid}</span>
                          : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
                        }
                      </td>

                      {/* Adresse — PLZ on top, city below */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}>
                        {(c.postal_code || c.city) ? (
                          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                            {c.postal_code && <span>{c.postal_code}</span>}
                            {c.city        && <span>{c.city}</span>}
                          </div>
                        ) : <span style={{ opacity: 0.4 }}>—</span>}
                      </td>

                      {/* Hausverwaltung */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        {c.organizations?.name
                          ? <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{c.organizations.name}</span>
                          : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
                        }
                      </td>

                      {/* Malo */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <MonoCell value={malo} />
                      </td>

                      {/* Zählernummer */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <MonoCell value={zNr} />
                      </td>

                      {/* KNR */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <MonoCell value={knr} />
                      </td>

                      {/* Strom */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <TarifCell records={c.teleson_records} energie="strom" />
                      </td>

                      {/* Gas */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <TarifCell records={c.teleson_records} energie="gas" />
                      </td>

                      {/* Potenzial */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <PotenzialCell records={c.upsell_opportunities} />
                      </td>

                      {/* Typ */}
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        <span style={{
                          background: "rgba(139,148,158,0.1)", color: "var(--text-muted)",
                          border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                          padding: "1px 7px", fontSize: "10px", fontWeight: 600,
                        }}>
                          {c.object_type === "weg" ? "WEG" : "Privat"}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <StatusBadge status={c.status} />
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "var(--space-12)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            {hasFilter
              ? <><span>Keine Treffer. </span><a href="/app/customers" style={{ color: "var(--primary-bright)" }}>Filter zurücksetzen</a></>
              : <><span>Noch keine Objekte vorhanden. </span><a href="/app/imports" style={{ color: "var(--primary-bright)" }}>Teleson-Import starten →</a></>
            }
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-sm)" }}>
          <span style={{ color: "var(--text-muted)" }}>
            {from}–{to} von {total} · Seite {page} / {totalPages}
          </span>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            {page > 1
              ? <a href={pageUrl({ q, status, energie, tStatus, orgId, objectType, page: page - 1 })} style={NAV_BTN}>← Zurück</a>
              : <span style={{ ...NAV_BTN, opacity: 0.3, cursor: "default" }}>← Zurück</span>}
            {page < totalPages
              ? <a href={pageUrl({ q, status, energie, tStatus, orgId, objectType, page: page + 1 })} style={NAV_BTN}>Weiter →</a>
              : <span style={{ ...NAV_BTN, opacity: 0.3, cursor: "default" }}>Weiter →</span>}
          </div>
        </div>
      )}

    </div>
  )
}
