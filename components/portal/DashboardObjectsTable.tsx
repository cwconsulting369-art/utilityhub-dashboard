"use client"

import { motion } from "framer-motion"
import { getStreet } from "@/lib/customers/format"

interface ObjectRow {
  id: string
  full_name: string
  status: string
  object_type: string | null
  city: string | null
  postal_code: string | null
  created_at: string
  customer_identities: { system: string; external_id: string }[] | null
  teleson_records: {
    energie: string | null
    neuer_versorger: string | null
    neu_ap: number | null
    status: string | null
    malo: string | null
    zaehlernummer: string | null
    created_at: string | null
  }[] | null
}

const CUSTOMER_STATUS_COLOR: Record<string, string> = {
  active: "#3fb950", inactive: "var(--text-muted)", blocked: "#f85149", pending: "#ffa600",
}
const CUSTOMER_STATUS_LABEL: Record<string, string> = {
  active: "Aktiv", inactive: "Inaktiv", blocked: "Gesperrt", pending: "Ausstehend",
}
const monoMuted: React.CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)" }

export function DashboardObjectsTable({ objects }: { objects: ObjectRow[] }) {
  const now = new Date()
  const dash = <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
  const rowPct = objects.length > 0 ? `${100 / objects.length}%` : "auto"

  if (objects.length === 0) {
    return <div style={{ padding: "var(--space-10)", textAlign: "center", color: "var(--text-muted)" }}>Noch keine Objekte.</div>
  }

  return (
    <div style={{ overflow: "hidden", height: "100%" }}>
      <table style={{ width: "100%", height: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "var(--text-sm)", tableLayout: "fixed" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.015)" }}>
            {["Objekt","Adresse","Malo","Zählernummer","KNR","Strom-Tarif","Gas-Tarif","Lieferstelle Status","Typ","Status"].map(h => (
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 500, color: "var(--text-muted)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody style={{ height: "100%", display: "table-row-group" }}>
          {objects.map((row, idx) => {
            const recs = row.teleson_records ?? []
            const stromRec = recs.find(r => r.energie?.toLowerCase() === "strom") ?? null
            const gasRec = recs.find(r => r.energie?.toLowerCase() === "gas") ?? null
            const malo = recs.map(r => r.malo).find(Boolean) ?? null
            const latestRec = [...recs].sort((a,b) => String(b.created_at??"").localeCompare(String(a.created_at??"")))[0]
            const zNr = latestRec?.zaehlernummer ? ((latestRec.zaehlernummer.split(":").pop()??latestRec.zaehlernummer).trim()||null) : null
            const knr = (row.customer_identities??[]).find(i => i.system !== "weg" && (i.system === "knr" || i.system === "teleson"))?.external_id ?? null
            const objektLabel = getStreet(row.full_name)
            const statusColor = CUSTOMER_STATUS_COLOR[row.status] ?? "var(--text-muted)"
            const statusLabel = CUSTOMER_STATUS_LABEL[row.status] ?? row.status
            const lieferStatus = stromRec?.status ?? gasRec?.status ?? null
            const ageDays = Math.floor((now.getTime() - new Date(row.created_at).getTime()) / (24*60*60*1000))
            const ageLabel = ageDays === 0 ? "Heute" : ageDays === 1 ? "Gestern" : `${ageDays}T`
            const ageColor = ageDays === 0 ? "#3fb950" : ageDays <= 7 ? "#58a6ff" : ageDays <= 30 ? "#ffa600" : "var(--text-muted)"

            return (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.16,1,0.3,1] }}
                style={{
                  borderBottom: idx < objects.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                  height: rowPct,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                  <a href={`/portal/objects/${row.id}`} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none", color: "inherit" }}>
                    <img src="/building-placeholder.jpg" alt="Gebäude" style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-subtle)" }} />
                    <span style={{ fontWeight: 600, color: "var(--text-bright)" }}>{objektLabel}</span>
                  </a>
                </td>
                <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}>
                  {(row.postal_code || row.city) ? <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>{row.postal_code && <span>{row.postal_code}</span>}{row.city && <span>{row.city}</span>}</div> : dash}
                </td>
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{malo ? <span style={monoMuted}>{malo}</span> : dash}</td>
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{zNr ? <span style={monoMuted}>{zNr}</span> : dash}</td>
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{knr ? <span style={monoMuted}>{knr}</span> : dash}</td>
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                  {stromRec?.neuer_versorger ? <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-bright)" }}>{stromRec.neuer_versorger}</span>{stromRec.neu_ap != null && <span style={{ fontSize: "var(--text-xs)", color: "#58a6ff" }}>{stromRec.neu_ap.toLocaleString("de-DE")} ct/kWh</span>}</div> : dash}
                </td>
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                  {gasRec?.neuer_versorger ? <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-bright)" }}>{gasRec.neuer_versorger}</span>{gasRec.neu_ap != null && <span style={{ fontSize: "var(--text-xs)", color: "#f59e0b" }}>{gasRec.neu_ap.toLocaleString("de-DE")} ct/kWh</span>}</div> : dash}
                </td>
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{lieferStatus ? <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, background: "rgba(139,148,158,0.1)", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1px 7px" }}>{lieferStatus}</span> : dash}</td>
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}><span style={{ background: "rgba(139,148,158,0.1)", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1px 7px", fontSize: "10px", fontWeight: 600 }}>{row.object_type === "weg" ? "WEG" : "Privat"}</span></td>
                <td style={{ padding: "12px 16px", whiteSpace: "nowrap", textAlign: "right" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: statusColor }}>{statusLabel}</span>
                    <span style={{ fontSize: "10px", fontWeight: 600, color: ageColor }}>{ageLabel}</span>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
