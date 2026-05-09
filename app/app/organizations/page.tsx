import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const metadata = { title: "Hausverwaltungen | UtilityHub" }

interface Props {
  searchParams: Promise<{ q?: string }>
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

export default async function OrganizationsPage({ searchParams }: Props) {
  const { q = "" } = await searchParams
  const supabase   = await createClient()
  const escaped    = q.replace(/%/g, "\\%").replace(/_/g, "\\_")

  let orgQuery = supabase.from("organizations").select("*").order("name")
  if (escaped) orgQuery = orgQuery.ilike("name", `%${escaped}%`)

  const [{ data: orgs }, { data: customerRows }] = await Promise.all([
    orgQuery,
    supabase.from("customers").select("organization_id").not("organization_id", "is", null),
  ])

  // Count customers per org in JS
  const countMap = new Map<string, number>()
  for (const c of customerRows ?? []) {
    const id = c.organization_id as string
    countMap.set(id, (countMap.get(id) ?? 0) + 1)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
            Hausverwaltungen
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            {orgs?.length ?? 0} {q ? "Treffer" : (orgs?.length === 1 ? "Eintrag" : "Einträge gesamt")}
            {q && <span> · „{q}"</span>}
          </p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Hausverwaltung suchen…"
          style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-4)",
            color: "var(--text)", fontSize: "var(--text-sm)",
            outline: "none", width: "280px",
          }}
        />
        <button type="submit" style={{
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
          color: "var(--text-muted)", fontSize: "var(--text-sm)", cursor: "pointer",
        }}>
          Suchen
        </button>
        {q && (
          <a href="/app/organizations" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textDecoration: "underline" }}>
            Zurücksetzen
          </a>
        )}
      </form>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {(orgs ?? []).length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Name", "Typ", "Status", "Objekte", "Angelegt"].map(h => (
                    <th key={h} style={{
                      padding: "var(--space-3) var(--space-4)", textAlign: "left",
                      color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(orgs ?? []).map(org => {
                  const typeColor  = org.org_type ? (ORG_TYPE_COLORS[org.org_type] ?? "var(--text-muted)") : "var(--text-muted)"
                  const typeLabel  = org.org_type ? (ORG_TYPE_LABELS[org.org_type] ?? org.org_type) : null
                  const objCount   = countMap.get(org.id) ?? 0
                  return (
                    <tr key={org.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                        <a
                          href={`/app/organizations/${org.id}`}
                          style={{ color: "var(--primary-bright)", textDecoration: "none", fontWeight: 500 }}
                        >
                          {org.name}
                        </a>
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        {typeLabel
                          ? (
                            <span style={{
                              background: `${typeColor}18`, color: typeColor,
                              border: `1px solid ${typeColor}44`,
                              borderRadius: "var(--radius-sm)",
                              padding: "1px 8px", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
                            }}>{typeLabel}</span>
                          )
                          : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>—</span>
                        }
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        <span style={{
                          color:  org.status === "active" ? "#3fb950" : "var(--text-muted)",
                          fontWeight: 500, fontSize: "var(--text-xs)",
                        }}>
                          {org.status === "active" ? "Aktiv" : "Inaktiv"}
                        </span>
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                        {objCount > 0
                          ? (
                            <a
                              href={`/app/customers?orgId=${org.id}`}
                              style={{ color: "var(--primary-bright)", textDecoration: "none", fontWeight: 600 }}
                            >
                              {objCount}
                            </a>
                          )
                          : <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>0</span>
                        }
                      </td>
                      <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(org.created_at).toLocaleDateString("de-DE")}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "var(--space-12)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            {q
              ? <><span>Keine Treffer. </span><a href="/app/organizations" style={{ color: "var(--primary-bright)" }}>Zurücksetzen</a></>
              : <span>Noch keine Hausverwaltungen vorhanden. Beim nächsten Import eine Spalte „Hausverwaltung" ergänzen.</span>
            }
          </div>
        )}
      </div>

    </div>
  )
}
