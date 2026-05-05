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

  const mainContact  = teContacts[0] ?? null
  const sideContacts = fgContacts

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Support</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Ihre Ansprechpartner für Rückfragen und Termine
        </p>
      </div>

      {/* 2-Spalten-Layout: ~40% links (FG-Finanz), ~60% rechts (Hauptansprechpartner) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "var(--space-5)", alignItems: "start" }}>

        {/* Linke Spalte: Tufan + David (FG Finanz) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {sideContacts.length > 0 ? (
            sideContacts.map(c => <ContactCard key={c.id} contact={c} photoSize={72} />)
          ) : (
            <EmptyCard text="Keine FG-Finanz-Ansprechpartner hinterlegt" />
          )}
        </div>

        {/* Rechte Spalte: Miguel (Hauptansprechpartner) */}
        <div>
          {mainContact ? (
            <ContactCard contact={mainContact} photoSize={96} featured />
          ) : (
            <EmptyCard text="Kein Hauptansprechpartner hinterlegt" />
          )}
        </div>

      </div>
    </div>
  )
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "var(--space-6)",
      color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center",
    }}>
      {text}
    </div>
  )
}

function ContactCard({ contact: c, photoSize = 60, featured = false }: {
  contact:   Contact
  photoSize?: number
  featured?:  boolean
}) {
  return (
    <div style={{
      background: "var(--surface)", border: `1px solid ${featured ? "rgba(63,185,80,0.3)" : "var(--border)"}`,
      borderRadius: "var(--radius-lg)",
      padding: featured ? "var(--space-6)" : "var(--space-5)",
      display: "flex", flexDirection: "column", gap: "var(--space-4)",
    }}>
      {/* Avatar + Name + Rolle */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        {c.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.photo_url}
            alt=""
            style={{
              width: `${photoSize}px`, height: `${photoSize}px`,
              borderRadius: "50%", objectFit: "cover", flexShrink: 0,
              border: "2px solid var(--border)",
            }}
          />
        ) : (
          <div style={{
            width: `${photoSize}px`, height: `${photoSize}px`,
            borderRadius: "50%",
            background: featured ? "rgba(63,185,80,0.15)" : "var(--surface-2)",
            border: `2px solid ${featured ? "rgba(63,185,80,0.3)" : "var(--border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: `${Math.round(photoSize * 0.35)}px`, fontWeight: 700,
            color: featured ? "#3fb950" : "var(--text-muted)",
            flexShrink: 0,
          }}>
            {c.full_name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          {featured && (
            <div style={{
              fontSize: "10px", fontWeight: 700, color: "#3fb950",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px",
            }}>
              Hauptansprechpartner
            </div>
          )}
          <div style={{
            fontWeight: 700,
            fontSize: featured ? "var(--text-lg)" : "var(--text-base)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {c.full_name}
          </div>
          {c.role && (
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "2px" }}>
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
