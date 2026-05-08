import { redirect }     from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Support | UtilityHub" }

const WA_MSG = encodeURIComponent("Guten Tag, ich habe eine Frage zu meinem Vertrag bei UtilityHub.")

const FG_CONTACTS = [
  { name: "David Wohlgemuth", role: "FG Finanz", phone: "+49 176 61004856", wa: `https://wa.me/4917661004856?text=${WA_MSG}` },
  { name: "Tufan Icli",       role: "FG Finanz", phone: "+49 176 57363064", wa: `https://wa.me/4917657363064?text=${WA_MSG}` },
]

const TE_CONTACTS = [
  { name: "Miguel Cieslar", role: "Teleson / UtilityHub", phone: "+49 1512 5213451", wa: `https://wa.me/4915125213451?text=${WA_MSG}` },
]

export default async function PortalContactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Top 2 Felder */}
      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Support</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Ihre Ansprechpartner für Rückfragen und Termine
        </p>
      </div>

      {/* 2-Spalten-Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)", alignItems: "start" }}>

        {/* Links: FG Finanz */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
        }}>
          <div style={{
            padding: "var(--space-4) var(--space-5)",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: "var(--space-2)",
          }}>
            <span style={{ fontSize: "16px" }}>💼</span>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>FG Finanz</h2>
          </div>
          <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {FG_CONTACTS.map(c => (
              <ContactCard key={c.name} contact={c} accentColor="#a78bfa" accentBg="rgba(167,139,250,0.12)" />
            ))}
          </div>
        </div>

        {/* Rechts: Teleson / UtilityHub */}
        <div style={{
          background: "var(--surface)", border: "1px solid rgba(63,185,80,0.3)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
        }}>
          <div style={{
            padding: "var(--space-4) var(--space-5)",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: "var(--space-2)",
          }}>
            <span style={{ fontSize: "16px" }}>⚡</span>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Teleson / UtilityHub</h2>
            <span style={{
              fontSize: "10px", fontWeight: 700, color: "#3fb950",
              background: "rgba(63,185,80,0.12)", border: "1px solid rgba(63,185,80,0.3)",
              borderRadius: "999px", padding: "1px 8px", marginLeft: "auto",
            }}>Hauptansprechpartner</span>
          </div>
          <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {TE_CONTACTS.map(c => (
              <ContactCard key={c.name} contact={c} accentColor="#3fb950" accentBg="rgba(63,185,80,0.12)" featured />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function ContactCard({
  contact: c,
  accentColor,
  accentBg,
  featured = false,
}: {
  contact:     { name: string; role: string; phone: string; wa: string }
  accentColor: string
  accentBg:    string
  featured?:   boolean
}) {
  const initials = c.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div style={{
      background:   featured ? accentBg : "var(--surface-2)",
      border:       `1px solid ${featured ? accentColor + "44" : "var(--border)"}`,
      borderRadius: "var(--radius-md)",
      padding:      "var(--space-4)",
      display:      "flex",
      flexDirection: "column",
      gap:          "var(--space-3)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
          background: accentBg,
          border: `2px solid ${accentColor}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "15px", fontWeight: 700, color: accentColor,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{c.name}</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>{c.role}</div>
        </div>
      </div>

      <a href={`tel:${c.phone}`} style={{
        fontSize: "var(--text-sm)", color: "var(--text-muted)",
        textDecoration: "none", display: "flex", alignItems: "center", gap: "var(--space-2)",
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z"/>
        </svg>
        {c.phone}
      </a>

      <a href={c.wa} target="_blank" rel="noreferrer" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)",
        background: "#25D366", color: "#fff",
        borderRadius: "var(--radius-md)", padding: "var(--space-2) var(--space-4)",
        fontSize: "var(--text-sm)", fontWeight: 600, textDecoration: "none",
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
        WhatsApp schreiben
      </a>
    </div>
  )
}
