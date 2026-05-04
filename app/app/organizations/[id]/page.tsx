import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/ui/StatusBadge"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("organizations").select("name").eq("id", id).single()
  return { title: data?.name ? `${data.name} | UtilityHub` : "Hausverwaltung" }
}

const ORG_TYPE_LABELS: Record<string, string> = {
  hausverwaltung: "Hausverwaltung",
  bestandshalter: "Bestandshalter",
  privat:         "Privat",
  sonstige:       "Sonstige",
}

const ORG_TYPE_COLORS: Record<string, string> = {
  hausverwaltung: "#58a6ff",
  bestandshalter: "#3fb950",
  privat:         "#ffa600",
  sonstige:       "var(--text-muted)",
}

const OBJECT_TYPE_LABELS: Record<string, string> = {
  weg: "WEG", mfh: "MFH", efh: "EFH", gewerbe: "Gewerbe", sonstige: "Sonstige",
}

const ENERGIE_COLORS: Record<string, string> = {
  strom: "#58a6ff", gas: "#ffa600", wärme: "#f85149", wasser: "#3fb950",
}

export default async function OrgDetailPage({ params }: Props) {
  const { id }   = await params
  const supabase = await createClient()

  const [{ data: org }, { data: objects }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", id).single(),
    supabase
      .from("customers")
      .select(
        "id, full_name, object_type, status, source, created_at, " +
        "customer_identities(system, external_id), " +
        "teleson_records(energie)"
      )
      .eq("organization_id", id)
      .order("full_name"),
  ])

  if (!org) notFound()

  const typeColor = org.org_type ? (ORG_TYPE_COLORS[org.org_type] ?? "var(--text-muted)") : "var(--text-muted)"
  const typeLabel = org.org_type ? (ORG_TYPE_LABELS[org.org_type] ?? org.org_type) : null

  const contactFields: [string, string | null][] = [
    ["E-Mail",  org.email],
    ["Telefon", org.phone],
    ["Adresse", org.address],
    ["Stadt",   org.city],
    ["PLZ",     org.postal_code],
    ["Land",    org.country !== "DE" ? org.country : null],
  ]
  const hasContact = contactFields.some(([, v]) => v)

  // Cast to access typed sub-arrays
  type ObjRow = {
    id: string
    full_name: string
    object_type: string | null
    status: string
    source: string | null
    created_at: string
    customer_identities: { system: string; external_id: string }[]
    teleson_records: { energie: string | null }[]
  }
  const typedObjects = (objects ?? []) as unknown as ObjRow[]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
        <a href="/app/organizations" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Hausverwaltungen</a>
        <span>›</span>
        <span style={{ color: "var(--text)" }}>{org.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{org.name}</h1>
            {typeLabel && (
              <span style={{
                background: `${typeColor}18`, color: typeColor,
                border: `1px solid ${typeColor}44`,
                borderRadius: "var(--radius-sm)",
                padding: "2px 10px", fontSize: "11px", fontWeight: 600,
              }}>{typeLabel}</span>
            )}
            <span style={{
              color:    org.status === "active" ? "#3fb950" : "var(--text-muted)",
              fontSize: "var(--text-xs)", fontWeight: 500,
            }}>
              {org.status === "active" ? "Aktiv" : "Inaktiv"}
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            {typedObjects.length} {typedObjects.length === 1 ? "Objekt" : "Objekte"} zugeordnet
          </p>
        </div>
        <a
          href={`/app/customers?orgId=${org.id}`}
          style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)",
            color: "var(--text-muted)", textDecoration: "none",
          }}
        >
          In Kundenliste anzeigen →
        </a>
      </div>

      {/* Stammdaten */}
      {hasContact && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
          <h2 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--space-4)" }}>
            Kontaktdaten
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--space-4)" }}>
            {contactFields.filter(([, v]) => v).map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "2px" }}>{label}</div>
                <div style={{ fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objects table */}
      <div>
        <h2 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--space-3)" }}>
          Zugeordnete Objekte ({typedObjects.length})
        </h2>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          {typedObjects.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Name / Objekt", "Typ", "Energie", "Status", "KNR", "Datensätze", "Angelegt"].map(h => (
                      <th key={h} style={{
                        padding: "var(--space-3) var(--space-4)", textAlign: "left",
                        color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {typedObjects.map(obj => {
                    const knrList   = obj.customer_identities.filter(i => i.system === "teleson").map(i => i.external_id)
                    const typeLabel = obj.object_type ? (OBJECT_TYPE_LABELS[obj.object_type] ?? obj.object_type) : null
                    const energieList = [...new Set(obj.teleson_records.map(r => r.energie).filter((e): e is string => !!e))]
                    return (
                      <tr key={obj.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                          <a href={`/app/customers/${obj.id}`} style={{ color: "var(--primary-bright)", textDecoration: "none", fontWeight: 500 }}>
                            {obj.full_name}
                          </a>
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                          {typeLabel
                            ? (
                              <span style={{
                                background: "rgba(139,148,158,0.1)", color: "var(--text-muted)",
                                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                                padding: "1px 7px", fontSize: "10px", fontWeight: 600,
                              }}>{typeLabel}</span>
                            )
                            : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
                          }
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                          {energieList.length > 0
                            ? (
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                {energieList.map(e => {
                                  const color = ENERGIE_COLORS[e.toLowerCase()] ?? "var(--text-muted)"
                                  return (
                                    <span key={e} style={{
                                      background: `${color}20`, color,
                                      border: `1px solid ${color}44`,
                                      borderRadius: "var(--radius-sm)",
                                      padding: "1px 6px", fontSize: "10px", fontWeight: 600,
                                    }}>{e}</span>
                                  )
                                })}
                              </div>
                            )
                            : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
                          }
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                          <StatusBadge status={obj.status} />
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)", fontFamily: "monospace", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          {knrList.length > 0 ? knrList.join(", ") : "—"}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", textAlign: "center" }}>
                          {obj.teleson_records.length > 0
                            ? <span style={{ fontWeight: 600, color: "var(--text)" }}>{obj.teleson_records.length}</span>
                            : <span style={{ opacity: 0.4 }}>0</span>
                          }
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          {new Date(obj.created_at).toLocaleDateString("de-DE")}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "var(--space-10)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              Noch keine Objekte zugeordnet.
            </div>
          )}
        </div>
      </div>

      {/* Meta */}
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", opacity: 0.6 }}>
        Angelegt: {new Date(org.created_at).toLocaleDateString("de-DE")}
        {org.updated_at && org.updated_at !== org.created_at &&
          <span> · Aktualisiert: {new Date(org.updated_at).toLocaleDateString("de-DE")}</span>
        }
      </div>

    </div>
  )
}
