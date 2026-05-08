import { redirect }          from "next/navigation"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const metadata = { title: "Support | UtilityHub" }

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

export default async function PortalContactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()
  const { data: allContacts } = await admin
    .from("contacts")
    .select("id, full_name, role, email, phone, photo_url, calendly_url, organizations(name)")
    .order("full_name")

  const contacts = (allContacts ?? []) as unknown as Contact[]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Support</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Ihre Ansprechpartner für Rückfragen und Termine
        </p>
      </div>

      {contacts.length === 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-12)",
          textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)", opacity: 0.4 }}>👥</div>
          Noch keine Ansprechpartner hinterlegt.
        </div>
      ) : (
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap:                 "var(--space-5)",
        }}>
          {contacts.map(c => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function ContactCard({ contact: c }: { contact: Contact }) {
  const initials = c.full_name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()
  const orgName  = c.organizations?.name ?? null

  return (
    <div style={{
      background:    "var(--surface)",
      border:        "1px solid var(--border)",
      borderRadius:  "var(--radius-lg)",
      padding:       "var(--space-5)",
      display:       "flex",
      flexDirection: "column",
      gap:           "var(--space-4)",
    }}>
      {/* Avatar + Name + Rolle */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        {c.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.photo_url}
            alt=""
            style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--border)" }}
          />
        ) : (
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "rgba(58,111,216,0.15)",
            border: "2px solid rgba(58,111,216,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: 700, color: "var(--primary-bright)", flexShrink: 0,
          }}>
            {initials}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--text-base)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {c.full_name}
          </div>
          {c.role && (
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "2px" }}>
              {c.role}
            </div>
          )}
          {orgName && (
            <div style={{
              fontSize: "10px", color: "var(--text-muted)", marginTop: "4px",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", padding: "1px 6px",
              display: "inline-block",
            }}>
              {orgName}
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
            display: "flex", alignItems: "center", gap: "var(--space-2)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            {c.email}
          </a>
        )}
        {c.phone && (
          <a href={`tel:${c.phone}`} style={{
            color: "var(--text)", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "var(--space-2)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z"/>
            </svg>
            {c.phone}
          </a>
        )}
        {c.calendly_url && (
          <a href={c.calendly_url} target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)",
            background: "#25D366", color: "#fff",
            borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
            fontSize: "var(--text-sm)", fontWeight: 600, textDecoration: "none",
            marginTop: "var(--space-1)",
          }}>
            💬 WhatsApp / Termin
          </a>
        )}
        {!c.email && !c.phone && !c.calendly_url && (
          <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>Keine Kontaktdaten hinterlegt</span>
        )}
      </div>
    </div>
  )
}
