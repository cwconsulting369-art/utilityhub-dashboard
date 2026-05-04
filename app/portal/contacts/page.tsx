import { redirect }          from "next/navigation"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const metadata = { title: "Ansprechpartner | UtilityHub" }

interface Contact {
  id:           string
  full_name:    string
  role:         string | null
  email:        string | null
  phone:        string | null
  photo_url:    string | null
  calendly_url: string | null
  organizations: { name: string } | null
}

const FG_FINANZ_PATTERNS = ["fg finanz", "fg-finanz", "fgfinanz"]
const TELESON_PATTERNS   = ["teleson", "utilityhub", "utility hub"]

function matchesPatterns(value: string | null | undefined, patterns: string[]): boolean {
  if (!value) return false
  const v = value.toLowerCase()
  return patterns.some(p => v.includes(p))
}

export default async function PortalContactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Support contacts are universal (FG Finanz + Teleson/UtilityHub team) and not
  // tied to the customer's own org — load via admin client (RLS bypass).
  // Only public-facing fields are selected.
  const admin = createAdminClient()
  const { data: allContacts } = await admin
    .from("contacts")
    .select("id, full_name, role, email, phone, photo_url, calendly_url, organizations(name)")
    .order("full_name")

  const contacts = (allContacts ?? []) as unknown as Contact[]

  const fgContacts: Contact[] = []
  const teContacts: Contact[] = []
  for (const c of contacts) {
    const orgName = c.organizations?.name ?? null
    if (matchesPatterns(orgName, FG_FINANZ_PATTERNS) || matchesPatterns(c.role, FG_FINANZ_PATTERNS)) {
      fgContacts.push(c)
    } else if (matchesPatterns(orgName, TELESON_PATTERNS) || matchesPatterns(c.role, TELESON_PATTERNS)) {
      teContacts.push(c)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Ansprechpartner</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Ihre Ansprechpartner für Rückfragen und Termine
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <ContactColumn title="FG Finanz"             contacts={fgContacts} />
        <ContactColumn title="Teleson / UtilityHub"  contacts={teContacts} />
      </div>

    </div>
  )
}

function ContactColumn({ title, contacts }: { title: string; contacts: Contact[] }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        padding: "var(--space-4) var(--space-5)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h2 style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{title}</h2>
        <span style={{
          fontSize: "10px", fontWeight: 700, color: "var(--text-muted)",
          background: "rgba(139,148,158,0.1)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", padding: "1px 7px",
        }}>{contacts.length}</span>
      </div>

      <div style={{ padding: "var(--space-4) var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {contacts.length > 0 ? (
          contacts.map(c => <ContactCard key={c.id} contact={c} />)
        ) : (
          <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center", padding: "var(--space-6) 0" }}>
            Noch keine Ansprechpartner hinterlegt
          </div>
        )}
      </div>
    </div>
  )
}

function ContactCard({ contact }: { contact: Contact }) {
  const c = contact
  return (
    <div style={{
      background: "var(--surface-2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "var(--space-4)",
      display: "flex", flexDirection: "column", gap: "var(--space-3)",
    }}>
      {/* Header: Foto/Initial + Name + Rolle */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        {c.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.photo_url}
            alt=""
            style={{
              width: "44px", height: "44px", borderRadius: "50%",
              objectFit: "cover", flexShrink: 0,
              border: "1px solid var(--border)",
            }}
          />
        ) : (
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "var(--surface)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-muted)",
            flexShrink: 0,
          }}>
            {c.full_name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {c.full_name}
          </div>
          {c.role && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {c.role}
            </div>
          )}
        </div>
      </div>

      {/* Kontakt-Links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--text-sm)" }}>
        {c.email && (
          <a href={`mailto:${c.email}`} style={{
            color: "var(--primary-bright)", textDecoration: "none",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            ✉ {c.email}
          </a>
        )}
        {c.phone && (
          <a href={`tel:${c.phone}`} style={{ color: "var(--text)", textDecoration: "none" }}>
            📞 {c.phone}
          </a>
        )}
        {c.calendly_url && (
          <a href={c.calendly_url} target="_blank" rel="noreferrer" style={{
            background: "#25D366", color: "#fff",
            border: "none", borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-4)",
            fontSize: "var(--text-sm)", fontWeight: 600,
            textDecoration: "none", textAlign: "center",
            marginTop: "var(--space-1)",
          }}>
            💬 WhatsApp
          </a>
        )}
        {!c.email && !c.phone && !c.calendly_url && (
          <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
            Keine Kontaktdaten hinterlegt
          </span>
        )}
      </div>
    </div>
  )
}
