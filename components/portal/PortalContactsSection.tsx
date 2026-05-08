import { createAdminClient } from "@/lib/supabase/admin"

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

export async function PortalContactsSection() {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from("contacts")
      .select("id, full_name, role, email, phone, photo_url, calendly_url, organizations(name)")
      .order("full_name")

    const contacts = (data ?? []) as unknown as Contact[]
    if (contacts.length === 0) return null

    return (
      <div style={{
        background:   "var(--surface)",
        border:       "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow:     "hidden",
      }}>
        <div style={{
          padding:      "var(--space-4) var(--space-6)",
          borderBottom: "1px solid var(--border)",
        }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Ihre Ansprechpartner</h2>
        </div>

        <div style={{
          padding:             "var(--space-5) var(--space-6)",
          display:             "grid",
          gridTemplateColumns: `repeat(${Math.min(contacts.length, 3)}, 1fr)`,
          gap:                 "var(--space-4)",
        }}>
          {contacts.map(c => (
            <ContactMiniCard key={c.id} contact={c} />
          ))}
        </div>
      </div>
    )
  } catch {
    return null
  }
}

function ContactMiniCard({ contact: c }: { contact: Contact }) {
  const initials = c.full_name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div style={{
      display:       "flex",
      alignItems:    "center",
      gap:           "var(--space-3)",
      background:    "var(--surface-2)",
      border:        "1px solid var(--border)",
      borderRadius:  "var(--radius-md)",
      padding:       "var(--space-4)",
    }}>
      {c.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.photo_url}
          alt=""
          style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--border)" }}
        />
      ) : (
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: "rgba(58,111,216,0.15)",
          border: "2px solid rgba(58,111,216,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "15px", fontWeight: 700, color: "var(--primary-bright)", flexShrink: 0,
        }}>
          {initials}
        </div>
      )}

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {c.full_name}
        </div>
        {c.role && (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {c.role}
          </div>
        )}
        <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)", flexWrap: "wrap" }}>
          {c.email && (
            <a href={`mailto:${c.email}`} style={{ fontSize: "10px", color: "var(--primary-bright)", textDecoration: "none", fontWeight: 500 }}>
              ✉ E-Mail
            </a>
          )}
          {c.phone && (
            <a href={`tel:${c.phone}`} style={{ fontSize: "10px", color: "var(--text-muted)", textDecoration: "none" }}>
              📞 Anrufen
            </a>
          )}
          {c.calendly_url && (
            <a href={c.calendly_url} target="_blank" rel="noreferrer" style={{ fontSize: "10px", color: "#25D366", textDecoration: "none", fontWeight: 500 }}>
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
