import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Support | UtilityHub" }

const WA = encodeURIComponent("Guten Tag, ich habe eine Frage zu meinem Vertrag bei UtilityHub.")

const CONTACTS = [
  { name: "David Wohlgemuth", role: "FG Finanz", phone: "+49 176 61004856", wa: `https://wa.me/4917661004856?text=${WA}` },
  { name: "Tufan Icli", role: "FG Finanz", phone: "+49 176 57363064", wa: `https://wa.me/4917657363064?text=${WA}` },
  { name: "Miguel Cieslar", role: "Teleson / UtilityHub", phone: "+49 1512 5213451", wa: `https://wa.me/4915125213451?text=${WA}` },
]

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let dbContacts: { id: string; full_name: string; role: string | null; phone: string | null; calendly_url: string | null }[] = []
  try {
    const { data } = await supabase.from("contacts").select("id, full_name, role, phone, calendly_url").order("full_name")
    if (data) dbContacts = data
  } catch {
    /* ignore */
  }

  const allContacts = [
    ...CONTACTS.map((c, i) => ({ id: `static-${i}`, ...c })),
    ...dbContacts
      .filter((db) => !CONTACTS.some((s) => s.phone === db.phone))
      .map((db) => ({
        id: db.id,
        name: db.full_name,
        role: db.role ?? "Ansprechpartner",
        phone: db.phone ?? "",
        wa: db.calendly_url ?? (db.phone ? `https://wa.me/${db.phone.replace(/\D/g, "")}?text=${WA}` : ""),
      })),
  ]

  return (
    <div style={{ padding: "var(--space-6)", position: "relative", minHeight: "100%" }}>
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 600px 400px at 80% 20%, rgba(59,130,246,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 500px 300px at 10% 80%, rgba(139,92,246,0.03) 0%, transparent 70%)
          `,
        }}
      />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-bright)", margin: 0, letterSpacing: "-0.02em" }}>
          Support
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
          Ihre Ansprechpartner f&uuml;r R&uuml;ckfragen und Termine
        </p>
        <div style={{ width: "100%", height: "1px", background: "var(--border)", marginTop: "16px" }} />
      </div>

      {/* FG Finanz */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: "var(--space-6)" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--accent)",
            padding: "4px 10px",
            borderRadius: "6px",
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.15)",
            display: "inline-block",
            marginBottom: "12px",
          }}
        >
          FG Finanz
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {allContacts
            .filter((c) => c.role?.includes("FG Finanz"))
            .map((c) => (
              <Card key={c.id} contact={c} />
            ))}
        </div>
      </div>

      {/* Teleson */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: "var(--space-6)" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--accent)",
            padding: "4px 10px",
            borderRadius: "6px",
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.15)",
            display: "inline-block",
            marginBottom: "12px",
          }}
        >
          Teleson / UtilityHub
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {allContacts
            .filter((c) => !c.role?.includes("FG Finanz"))
            .map((c) => (
              <Card key={c.id} contact={c} />
            ))}
        </div>
      </div>
    </div>
  )
}

function Card({ contact: c }: { contact: { name: string; role: string; phone: string; wa: string } }) {
  const initials = c.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.04)",
        padding: "20px",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "16px",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          flexShrink: 0,
          padding: "2px",
          background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "18px",
            color: "var(--text-bright)",
          }}
        >
          {initials}
        </div>
      </div>

      {/* Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>{c.name}</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.role}</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z" />
          </svg>
          {c.phone}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <a
            href={c.wa}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#3b82f6",
              borderRadius: "6px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            WhatsApp
          </a>
          <a
            href={`tel:${c.phone}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#3b82f6",
              borderRadius: "6px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z" />
            </svg>
            Anrufen
          </a>
        </div>
      </div>
    </div>
  )
}
