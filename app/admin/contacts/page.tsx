import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Kontakte | UtilityHub" }

interface SearchProps {
  searchParams: Promise<{ q?: string; orgId?: string }>
}

export default async function ContactsPage({ searchParams }: SearchProps) {
  const { q = "", orgId = "" } = await searchParams
  const supabase = await createClient()
  const escaped  = q.replace(/%/g, "\\%").replace(/_/g, "\\_")

  const [contactsResult, orgsResult] = await Promise.all([
    (() => {
      let query = supabase
        .from("contacts")
        .select("id, full_name, role, email, phone, organization_id, organizations(name)")
        .order("full_name")

      if (escaped) {
        query = query.or(`full_name.ilike.%${escaped}%,role.ilike.%${escaped}%,email.ilike.%${escaped}%`)
      }
      if (orgId) {
        query = query.eq("organization_id", orgId)
      }
      return query
    })(),
    supabase.from("organizations").select("id, name").order("name"),
  ])

  const contacts = (contactsResult.data ?? []) as unknown as {
    id: string
    full_name: string
    role: string | null
    email: string | null
    phone: string | null
    organization_id: string | null
    organizations: { name: string } | { name: string }[] | null
  }[]

  const orgOptions = (orgsResult.data ?? []) as { id: string; name: string }[]
  const activeOrg  = orgId ? (orgOptions.find(o => o.id === orgId)?.name ?? "") : ""

  const activeFilters = [q && `„${q}"`, activeOrg].filter(Boolean).join(" · ")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Kontakte</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
            {contacts.length} {activeFilters ? "Treffer" : contacts.length === 1 ? "Eintrag" : "Einträge gesamt"}
            {activeFilters && <span> · {activeFilters}</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Name, Rolle, E-Mail suchen …"
          style={{
            flex: "1 1 220px", minWidth: 0,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
            fontSize: "var(--text-sm)", color: "inherit", outline: "none",
          }}
        />
        <select
          name="orgId"
          defaultValue={orgId}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
            fontSize: "var(--text-sm)", color: "inherit",
          }}
        >
          <option value="">Alle Hausverwaltungen</option>
          {orgOptions.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            background: "var(--primary-bright)", color: "#fff",
            border: "none", borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-5)",
            fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer",
          }}
        >
          Suchen
        </button>
        {(q || orgId) && (
          <a
            href="/admin/contacts"
            style={{
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--text-sm)", color: "var(--text-muted)", textDecoration: "none",
            }}
          >
            Zurücksetzen
          </a>
        )}
      </form>

      {/* Table */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
      }}>
        {contacts.length === 0 ? (
          <div style={{
            padding: "var(--space-12)", textAlign: "center",
            color: "var(--text-muted)", fontSize: "var(--text-sm)",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)", opacity: 0.4 }}>👥</div>
            <div style={{ fontWeight: 500, marginBottom: "var(--space-1)" }}>
              {q || orgId ? "Keine Treffer gefunden" : "Noch keine Kontakte angelegt"}
            </div>
            <div style={{ fontSize: "var(--text-xs)" }}>
              {q || orgId ? "Filter anpassen oder zurücksetzen." : "Kontakte werden hier angezeigt, sobald sie hinzugefügt werden."}
            </div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "Rolle", "Hausverwaltung", "E-Mail", "Telefon"].map(h => (
                  <th key={h} style={{
                    padding: "var(--space-3) var(--space-4)",
                    textAlign: "left", fontSize: "var(--text-xs)",
                    fontWeight: 600, color: "var(--text-muted)",
                    letterSpacing: "0.04em", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, i) => (
                <tr
                  key={contact.id}
                  style={{
                    borderBottom: i < contacts.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  {/* Name */}
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{contact.full_name}</span>
                  </td>

                  {/* Rolle */}
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    {contact.role ? (
                      <span style={{
                        fontSize: "var(--text-xs)", color: "var(--text-muted)",
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)", padding: "1px 7px",
                      }}>{contact.role}</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>—</span>
                    )}
                  </td>

                  {/* Hausverwaltung */}
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    {(() => {
                      const org = Array.isArray(contact.organizations) ? contact.organizations[0] : contact.organizations
                      return org?.name ? (
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                          {org.name}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>—</span>
                      )
                    })()}
                  </td>

                  {/* E-Mail */}
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        style={{ fontSize: "var(--text-sm)", color: "var(--primary-bright)", textDecoration: "none" }}
                      >
                        {contact.email}
                      </a>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>—</span>
                    )}
                  </td>

                  {/* Telefon */}
                  <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        style={{ fontSize: "var(--text-sm)", color: "inherit", textDecoration: "none" }}
                      >
                        {contact.phone}
                      </a>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
