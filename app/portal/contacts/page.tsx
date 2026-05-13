import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Support | UtilityHub" }

const WA_MSG = encodeURIComponent("Guten Tag, ich habe eine Frage zu meinem Vertrag bei UtilityHub.")

const FG_CONTACTS = [
  { name: "David Wohlgemuth", role: "FG Finanz",           phone: "+49 176 61004856",  wa: `https://wa.me/4917661004856?text=${WA_MSG}`,  avatar: null },
  { name: "Tufan Icli",       role: "FG Finanz",           phone: "+49 176 57363064",  wa: `https://wa.me/4917657363064?text=${WA_MSG}`,  avatar: null },
]

const TE_CONTACTS = [
  { name: "Miguel Cieslar",   role: "Teleson / UtilityHub", phone: "+49 1512 5213451", wa: `https://wa.me/4915125213451?text=${WA_MSG}`, avatar: null },
]

/* ─────────────────────────────────────────────── */

export default async function PortalContactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  /* ── fetch contacts from DB ── */
  let dbContacts: any[] = []
  try {
    const { data } = await supabase
      .from("contacts")
      .select("id, full_name, role, email, phone, photo_url, calendly_url")
      .order("full_name")
    dbContacts = data ?? []
  } catch {
    dbContacts = []
  }

  return (
    <div style={pageWrapper}>
      {/* Ambient background orbs */}
      <div style={ambientBg} aria-hidden="true" />

      {/* Header */}
      <header style={headerSection}>
        <h1 style={pageTitle}>Support</h1>
        <p style={pageSubtitle}>Ihre Ansprechpartner f&uuml;r R&uuml;ckfragen und Termine</p>
        <div style={headerDivider} />
      </header>

      {/* ── FG Finanz Section ── */}
      <section style={section}>
        <SectionHeader label="FG Finanz" />
        <div style={cardGrid}>
          {FG_CONTACTS.map(c => (
            <GlassContactCard key={c.name} contact={c} />
          ))}
        </div>
      </section>

      {/* ── Teleson Section ── */}
      <section style={section}>
        <SectionHeader label="Teleson / UtilityHub" />
        <div style={cardGrid}>
          {TE_CONTACTS.map(c => (
            <GlassContactCard key={c.name} contact={c} />
          ))}
        </div>
      </section>

      {/* ── Dynamische Ansprechpartner aus DB ── */}
      {dbContacts.length > 0 && (
        <section style={section}>
          <SectionHeader label="Ihre Ansprechpartner" />
          <div style={cardGrid}>
            {dbContacts.map(c => (
              <GlassContactCard
                key={c.id}
                contact={{
                  name:  c.full_name ?? "",
                  role:  c.role ?? "",
                  phone: c.phone ?? "",
                  wa:    c.calendly_url ?? `https://wa.me/${(c.phone ?? "").replace(/\D/g, "")}?text=${WA_MSG}`,
                  avatar: c.photo_url ?? null,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ─── Sub-components ─── */

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={sectionHeaderWrapper}>
      <span style={sectionLabel}>{label}</span>
    </div>
  )
}

function GlassContactCard({
  contact: c,
}: {
  contact: { name: string; role: string; phone: string; wa: string; avatar: string | null }
}) {
  const initials = c.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div style={glassCard}>
      <div style={cardInner}>
        {/* Avatar with gradient ring */}
        <div style={avatarRing}>
          <div style={avatarInner}>
            {c.avatar ? (
              <img src={c.avatar} alt={c.name} style={avatarImg} />
            ) : (
              <span style={avatarFallback}>{initials}</span>
            )}
          </div>
        </div>

        {/* Info column */}
        <div style={infoColumn}>
          <div style={nameRow}>{c.name}</div>
          <div style={roleRow}>{c.role}</div>
          {c.phone && (
            <div style={phoneRow}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z" />
              </svg>
              {c.phone}
            </div>
          )}

          {/* Action buttons */}
          <div style={buttonRow}>
            <a
              href={c.wa}
              target="_blank"
              rel="noreferrer"
              style={btnWhatsApp}
              onMouseEnter={e => {
                const t = e.currentTarget
                t.style.background = "rgba(59, 130, 246, 0.1)"
                t.style.borderColor = "var(--accent)"
              }}
              onMouseLeave={e => {
                const t = e.currentTarget
                t.style.background = "transparent"
                t.style.borderColor = "rgba(59, 130, 246, 0.3)"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              WhatsApp
            </a>

            {c.phone && (
              <a
                href={`tel:${c.phone}`}
                style={btnCall}
                onMouseEnter={e => {
                  const t = e.currentTarget
                  t.style.background = "rgba(59, 130, 246, 0.1)"
                  t.style.borderColor = "var(--accent)"
                }}
                onMouseLeave={e => {
                  const t = e.currentTarget
                  t.style.background = "transparent"
                  t.style.borderColor = "rgba(59, 130, 246, 0.3)"
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z" />
                </svg>
                Anrufen
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Styles ─── */

const pageWrapper: React.CSSProperties = {
  position: "relative",
  padding: "var(--space-6)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-6)",
  minHeight: "100%",
  overflow: "hidden",
}

const ambientBg: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  background: `
    radial-gradient(ellipse 600px 400px at 80% 20%, rgba(59, 130, 246, 0.04) 0%, transparent 70%),
    radial-gradient(ellipse 500px 300px at 10% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 70%)
  `,
}

const headerSection: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
}

const pageTitle: React.CSSProperties = {
  fontSize: "var(--text-2xl)",
  fontWeight: 700,
  color: "var(--text-bright)",
  margin: 0,
  letterSpacing: "-0.02em",
}

const pageSubtitle: React.CSSProperties = {
  fontSize: "var(--text-sm)",
  color: "var(--text-muted)",
  margin: "var(--space-1) 0 0 0",
}

const headerDivider: React.CSSProperties = {
  width: "100%",
  height: "1px",
  background: "var(--border)",
  marginTop: "var(--space-4)",
}

const section: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
}

const sectionHeaderWrapper: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
}

const sectionLabel: React.CSSProperties = {
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--accent)",
  padding: "4px 10px",
  borderRadius: "var(--radius-sm)",
  background: "rgba(59, 130, 246, 0.08)",
  border: "1px solid rgba(59, 130, 246, 0.15)",
}

const cardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "var(--space-4)",
}

const glassCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.04)",
  padding: "var(--space-5)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  cursor: "default",
}

const cardInner: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: "var(--space-4)",
}

const avatarRing: React.CSSProperties = {
  width: "68px",
  height: "68px",
  borderRadius: "50%",
  flexShrink: 0,
  padding: "2px",
  background: "linear-gradient(135deg, var(--accent), #60a5fa)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}

const avatarInner: React.CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  background: "var(--surface-2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}

const avatarImg: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "50%",
}

const avatarFallback: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: "var(--text-bright)",
  letterSpacing: "0.02em",
}

const infoColumn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  flex: 1,
  minWidth: 0,
  paddingTop: "2px",
}

const nameRow: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "var(--text-sm)",
  color: "var(--text)",
  lineHeight: 1.3,
}

const roleRow: React.CSSProperties = {
  fontSize: "var(--text-xs)",
  color: "var(--text-muted)",
  lineHeight: 1.4,
}

const phoneRow: React.CSSProperties = {
  fontSize: "var(--text-xs)",
  color: "var(--text-muted)",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  lineHeight: 1.4,
}

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: "var(--space-2)",
  marginTop: "var(--space-2)",
}

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  background: "transparent",
  border: "1px solid rgba(59, 130, 246, 0.3)",
  color: "var(--accent)",
  borderRadius: "var(--radius-md)",
  padding: "8px 16px",
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
  transition: "background 0.2s ease, border-color 0.2s ease",
  flex: 1,
}

const btnWhatsApp: React.CSSProperties = { ...btnBase }

const btnCall: React.CSSProperties = { ...btnBase }
