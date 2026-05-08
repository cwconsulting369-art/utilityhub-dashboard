import { createClient } from "@/lib/supabase/server"
import { formatBytes }  from "@/lib/documents/storage"
import { redirect }     from "next/navigation"
import { DocumentRow }  from "@/components/portal/DocumentRow"

export const metadata = { title: "Meine Dokumente | UtilityHub" }

function getStreet(fullName: string): string {
  const idx = fullName.indexOf(" / ")
  return idx >= 0 ? (fullName.slice(idx + 3).trim() || fullName) : fullName
}

function isHauptordner(fullName: string): boolean {
  return / \(Allgemein\)$/.test(fullName)
}

function mimeLabel(mime: string | null): { label: string; color: string } {
  if (!mime) return { label: "FILE", color: "var(--text-muted)" }
  if (mime === "application/pdf")                                    return { label: "PDF",  color: "#f85149" }
  if (mime.startsWith("image/"))                                     return { label: "BILD", color: "#58a6ff" }
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime === "text/csv")
                                                                     return { label: "CSV",  color: "#3fb950" }
  if (mime.includes("word"))                                         return { label: "WORD", color: "#58a6ff" }
  return { label: "FILE", color: "var(--text-muted)" }
}

interface DocRow {
  id:          string
  name:        string
  description: string | null
  mime_type:   string | null
  size_bytes:  number | null
  created_at:  string
  customer_id: string
  customers:   { id: string; full_name: string } | null
}

export default async function PortalDocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // RLS (migration 028) gates this to docs whose customer.organization_id = my org
  const { data: docs } = await supabase
    .from("customer_documents")
    .select(`
      id, name, description, mime_type, size_bytes, created_at, customer_id,
      customers!customer_id(id, full_name)
    `)
    .order("created_at", { ascending: false })

  const rows = (docs ?? []) as unknown as DocRow[]

  // Group by customer
  type Group = { customer: DocRow["customers"]; docs: DocRow[] }
  const groups = new Map<string, Group>()
  for (const d of rows) {
    if (!groups.has(d.customer_id)) {
      groups.set(d.customer_id, { customer: d.customers, docs: [] })
    }
    groups.get(d.customer_id)!.docs.push(d)
  }

  // Sort: Hauptordner (Eingang) first, then street alphabetical
  const groupArr = Array.from(groups.entries()).sort(([, a], [, b]) => {
    const aName = a.customer?.full_name ?? ""
    const bName = b.customer?.full_name ?? ""
    const aHO   = isHauptordner(aName)
    const bHO   = isHauptordner(bName)
    if (aHO !== bHO) return aHO ? -1 : 1
    return aName.localeCompare(bName)
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
          Meine Dokumente
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          {rows.length === 0
            ? "Noch keine Dokumente vorhanden."
            : `${rows.length} ${rows.length === 1 ? "Dokument" : "Dokumente"} · gruppiert nach Objekt`}
        </p>
      </div>

      {rows.length === 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-12)",
          textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)",
        }}>
          Es wurden noch keine Dokumente für Sie hinterlegt.
          Nutze die Upload-Box in der Seitenleiste, um Dateien an UtilityHub zu schicken.
        </div>
      ) : (
        groupArr.map(([cId, group]) => {
          const cName = group.customer?.full_name ?? "—"
          const ho    = isHauptordner(cName)
          const label = ho ? "📥 Eingang" : getStreet(cName)

          return (
            <div key={cId} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", overflow: "hidden",
            }}>
              <div style={{
                padding: "var(--space-4) var(--space-6)",
                borderBottom: "1px solid var(--border)",
                background: ho ? "rgba(63,185,80,0.05)" : "var(--surface-2)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <h2 style={{
                  fontSize: "var(--text-base)", fontWeight: 700, margin: 0,
                  color: ho ? "#3fb950" : "var(--text)",
                }}>
                  {label}
                </h2>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {group.docs.length} {group.docs.length === 1 ? "Dokument" : "Dokumente"}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {group.docs.map(doc => {
                  const { label: mLabel, color: mColor } = mimeLabel(doc.mime_type)
                  const displayName = doc.description?.trim() || doc.name
                  return (
                    <DocumentRow
                      key={doc.id}
                      mLabel={mLabel}
                      mColor={mColor}
                      displayName={displayName}
                      fileName={doc.name}
                      description={doc.description}
                      sizeLabel={formatBytes(doc.size_bytes)}
                      dateLabel={new Date(doc.created_at).toLocaleDateString("de-DE")}
                      docId={doc.id}
                    />
                  )
                })}
              </div>
            </div>
          )
        })
      )}

    </div>
  )
}
