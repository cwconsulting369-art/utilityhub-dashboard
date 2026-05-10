import { createAdminClient }   from "@/lib/supabase/admin"
import { createClient }        from "@/lib/supabase/server"
import { formatBytes, DOCUMENTS_BUCKET } from "@/lib/documents/storage"
import { redirect }            from "next/navigation"
import { revalidatePath }      from "next/cache"

export const dynamic = "force-dynamic"
import { DeleteDocButton }     from "./delete-button"

export const metadata = { title: "Dokumente | UtilityHub" }

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
  id:                  string
  name:                string
  description:         string | null
  mime_type:           string | null
  size_bytes:          number | null
  visible_to_customer: boolean
  source:              string
  storage_path:        string | null
  assigned:            boolean
  created_at:          string
  customer_id:         string
  customers: {
    id:              string
    full_name:       string
    organization_id: string | null
    organizations:   { id: string; name: string } | null
  } | null
  uploaded_by: { full_name: string | null } | null
}

interface CustomerOpt {
  id:              string
  full_name:       string
  organization_id: string | null
}

// ── Server action: reassign + flip assigned=true ───────────────────────────
async function assignDocument(formData: FormData) {
  "use server"
  const docId      = (formData.get("doc_id")      as string | null)?.trim()
  const customerId = (formData.get("customer_id") as string | null)?.trim()
  if (!docId || !customerId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) return

  const admin = createAdminClient()
  await admin.from("customer_documents")
    .update({ customer_id: customerId, assigned: true })
    .eq("id", docId)
  revalidatePath("/admin/documents")
}

// ── Server action: delete (storage + DB) ───────────────────────────────────
async function deleteDocument(formData: FormData) {
  "use server"
  const docId = (formData.get("doc_id") as string | null)?.trim()
  if (!docId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) return

  const admin = createAdminClient()
  const { data: doc } = await admin
    .from("customer_documents")
    .select("storage_path")
    .eq("id", docId)
    .single()

  if (doc?.storage_path) {
    await admin.storage.from(DOCUMENTS_BUCKET).remove([doc.storage_path])
  }
  await admin.from("customer_documents").delete().eq("id", docId)
  revalidatePath("/admin/documents")
}

// ── Section header (icon + title + count pill) ─────────────────────────────
function SectionHeader({ icon, title, count, accentColor }: {
  icon: string
  title: string
  count: number
  accentColor: string
}) {
  return (
    <div style={{
      padding: "var(--space-3) var(--space-6)",
      background: `${accentColor}15`,
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", gap: "var(--space-3)",
    }}>
      <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: accentColor }}>
        {icon} {title}
      </div>
      <span style={{
        background: accentColor, color: "#fff",
        borderRadius: "999px",
        padding: "1px 8px",
        fontSize: "10px", fontWeight: 700,
        minWidth: "20px", textAlign: "center", lineHeight: "14px",
      }}>
        {count}
      </span>
    </div>
  )
}

// ── One docs table (used by all three sections) ────────────────────────────
function DocsTable({ docs, hauptordner, objects }: {
  docs:        DocRow[]
  hauptordner: CustomerOpt | undefined
  objects:     CustomerOpt[]
}) {
  if (docs.length === 0) return null
  const hasOptions = !!hauptordner || objects.length > 0

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
            {[
              { label: "Dateiname",     pl: "var(--space-6)" },
              { label: "Sichtbarkeit",  pl: "var(--space-4)" },
              { label: "Größe",         pl: "var(--space-4)" },
              { label: "Hochgeladen",   pl: "var(--space-4)" },
              { label: "Datum",         pl: "var(--space-4)" },
              { label: "Zuweisen",      pl: "var(--space-4)" },
              { label: "Aktionen",      pl: "var(--space-4)" },
            ].map((h, i, arr) => (
              <th key={i} style={{
                padding:    `var(--space-2) var(--space-4) var(--space-2) ${h.pl}`,
                paddingRight: i === arr.length - 1 ? "var(--space-6)" : "var(--space-4)",
                textAlign:  "left",
                fontSize:   "var(--text-xs)",
                fontWeight: 600,
                color:      "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => {
            const { label: mLabel, color: mColor } = mimeLabel(doc.mime_type)
            const displayName  = doc.description?.trim() || doc.name
            const uploaderName = doc.uploaded_by?.full_name?.trim() ?? "—"

            return (
              <tr key={doc.id} style={{ borderBottom: "1px solid var(--border)" }}>
                {/* Dateiname */}
                <td style={{
                  padding:      "var(--space-3) var(--space-4) var(--space-3) var(--space-6)",
                  maxWidth:     "380px", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <span style={{
                      background:   `${mColor}20`, color: mColor,
                      border:       `1px solid ${mColor}44`,
                      borderRadius: "var(--radius-sm)", padding: "1px 6px",
                      fontSize:     "10px", fontWeight: 600,
                      flexShrink:   0,
                    }}>{mLabel}</span>
                    <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                      <div title={displayName} style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {displayName}
                      </div>
                      {doc.description?.trim() && doc.description.trim() !== doc.name && (
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.name}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                  <span style={{
                    fontSize: "var(--text-xs)", fontWeight: 600,
                    color: doc.visible_to_customer ? "#3fb950" : "var(--text-muted)",
                  }}>
                    {doc.visible_to_customer ? "Sichtbar" : "Intern"}
                  </span>
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {formatBytes(doc.size_bytes)}
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {uploaderName}
                </td>

                <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {new Date(doc.created_at).toLocaleDateString("de-DE")}
                </td>

                {/* Assign dropdown */}
                <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                  {hasOptions ? (
                    <form action={assignDocument} style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                      <input type="hidden" name="doc_id" value={doc.id} />
                      <select
                        name="customer_id"
                        defaultValue={
                          // Show current customer as selected if it's still in the list,
                          // otherwise the first available option.
                          (hauptordner && doc.customer_id === hauptordner.id) ||
                          objects.some(o => o.id === doc.customer_id)
                            ? doc.customer_id
                            : (hauptordner?.id ?? objects[0]?.id)
                        }
                        style={{
                          background: "var(--surface-2)", border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)", padding: "var(--space-1) var(--space-2)",
                          color: "var(--text)", fontSize: "var(--text-xs)",
                        }}
                      >
                        {hauptordner && (
                          <option value={hauptordner.id}>🏢 Hausverwaltung Allgemein</option>
                        )}
                        {objects.map(c => (
                          <option key={c.id} value={c.id}>
                            🏠 {getStreet(c.full_name)}
                          </option>
                        ))}
                      </select>
                      <button type="submit" style={{
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)", padding: "var(--space-1) var(--space-3)",
                        color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 600,
                        cursor: "pointer",
                      }}>
                        Zuweisen
                      </button>
                    </form>
                  ) : (
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>—</span>
                  )}
                </td>

                {/* Actions: Open + Delete */}
                <td style={{ padding: "var(--space-3) var(--space-6) var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", justifyContent: "flex-end" }}>
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--primary-bright)", textDecoration: "none", fontSize: "var(--text-xs)" }}
                    >
                      Öffnen ↗
                    </a>
                    <DeleteDocButton
                      action={deleteDocument}
                      docId={doc.id}
                      fileName={displayName}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()

  const [docsRes, custRes] = await Promise.all([
    admin
      .from("customer_documents")
      .select(
        `id, name, description, mime_type, size_bytes,
         visible_to_customer, source, storage_path, assigned, created_at, customer_id,
         customers!customer_id(id, full_name, organization_id,
           organizations!organization_id(id, name)
         ),
         uploaded_by:profiles!uploaded_by(full_name)`,
      )
      .order("created_at", { ascending: false })
      .limit(500),
    admin
      .from("customers")
      .select("id, full_name, organization_id")
      .order("full_name", { ascending: true }),
  ])

  const rows      = (docsRes.data ?? []) as unknown as DocRow[]
  const customers = (custRes.data ?? []) as CustomerOpt[]

  // Per-org: Hauptordner + sorted real objects
  const hauptordnerByOrg = new Map<string, CustomerOpt>()
  const objectsByOrg     = new Map<string, CustomerOpt[]>()
  for (const c of customers) {
    if (!c.organization_id) continue
    if (isHauptordner(c.full_name)) {
      hauptordnerByOrg.set(c.organization_id, c)
    } else {
      if (!objectsByOrg.has(c.organization_id)) objectsByOrg.set(c.organization_id, [])
      objectsByOrg.get(c.organization_id)!.push(c)
    }
  }

  // Group docs per org → 3 buckets
  type OrgGroup = {
    orgId:           string | null
    orgName:         string
    inboxDocs:       DocRow[]
    hvAllgemeinDocs: DocRow[]
    objectGroups:    Map<string, { customer: DocRow["customers"]; docs: DocRow[] }>
  }
  const orgGroups = new Map<string, OrgGroup>()
  for (const d of rows) {
    const orgId   = d.customers?.organization_id ?? null
    const orgName = d.customers?.organizations?.name ?? "Ohne Organisation"
    const orgKey  = orgId ?? "__none__"
    if (!orgGroups.has(orgKey)) {
      orgGroups.set(orgKey, {
        orgId, orgName,
        inboxDocs: [], hvAllgemeinDocs: [], objectGroups: new Map(),
      })
    }
    const og = orgGroups.get(orgKey)!

    if (!d.assigned) {
      og.inboxDocs.push(d)
    } else if (d.customers?.full_name && isHauptordner(d.customers.full_name)) {
      og.hvAllgemeinDocs.push(d)
    } else {
      const cKey = d.customer_id
      if (!og.objectGroups.has(cKey)) {
        og.objectGroups.set(cKey, { customer: d.customers, docs: [] })
      }
      og.objectGroups.get(cKey)!.docs.push(d)
    }
  }

  const orgGroupsArr = Array.from(orgGroups.values())
    .sort((a, b) => a.orgName.localeCompare(b.orgName))

  const totalDocs = rows.length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
            Dokumente
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
            {totalDocs} Dokumente · drei Stufen pro Hausverwaltung
          </p>
        </div>
        <a
          href="/api/export/documents"
          style={{
            background:   "var(--surface-2)", border: "1px solid var(--border)",
            padding:      "var(--space-2) var(--space-4)", borderRadius: "var(--radius-md)",
            fontSize:     "var(--text-sm)", color: "var(--text-muted)",
            textDecoration: "none", whiteSpace: "nowrap",
          }}
        >
          ↓ Export CSV
        </a>
      </div>

      {orgGroupsArr.length === 0 && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-12)",
          textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)",
        }}>
          Noch keine Dokumente vorhanden.
        </div>
      )}

      {orgGroupsArr.map(og => {
        const hauptordner = og.orgId ? hauptordnerByOrg.get(og.orgId) : undefined
        const objects     = og.orgId ? (objectsByOrg.get(og.orgId) ?? []) : []
        const objCount    = Array.from(og.objectGroups.values()).reduce((acc, x) => acc + x.docs.length, 0)
        const totalForOrg = og.inboxDocs.length + og.hvAllgemeinDocs.length + objCount

        const objectGroupEntries = Array.from(og.objectGroups.entries())
          .sort(([, a], [, b]) =>
            (a.customer?.full_name ?? "").localeCompare(b.customer?.full_name ?? ""))

        return (
          <div key={og.orgId ?? "__none__"} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", overflow: "hidden",
          }}>
            <div style={{
              padding: "var(--space-4) var(--space-6)",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-2)",
            }}>
              <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: 0 }}>
                {og.orgName}
              </h2>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
                {totalForOrg} Dokumente
              </div>
            </div>

            {/* Section 1: Eingang */}
            {og.inboxDocs.length > 0 && (
              <>
                <SectionHeader icon="📥" title="Eingang" count={og.inboxDocs.length} accentColor="#f59e0b" />
                <DocsTable docs={og.inboxDocs} hauptordner={hauptordner} objects={objects} />
              </>
            )}

            {/* Section 2: HV Allgemein */}
            {og.hvAllgemeinDocs.length > 0 && (
              <>
                <SectionHeader icon="🏢" title="HV Allgemein" count={og.hvAllgemeinDocs.length} accentColor="#58a6ff" />
                <DocsTable docs={og.hvAllgemeinDocs} hauptordner={hauptordner} objects={objects} />
              </>
            )}

            {/* Section 3: Objekt-spezifisch */}
            {objectGroupEntries.length > 0 && (
              <>
                <SectionHeader icon="🏠" title="Objekt-spezifisch" count={objCount} accentColor="#3fb950" />
                {objectGroupEntries.map(([cId, group]) => {
                  const cName = group.customer?.full_name ?? "—"
                  return (
                    <div key={cId}>
                      <div style={{
                        padding: "var(--space-2) var(--space-6)",
                        borderBottom: "1px solid var(--border)",
                        fontSize: "var(--text-xs)", fontWeight: 600,
                        color: "var(--text-muted)",
                      }}>
                        {getStreet(cName)} · {group.docs.length} {group.docs.length === 1 ? "Dokument" : "Dokumente"}
                      </div>
                      <DocsTable docs={group.docs} hauptordner={hauptordner} objects={objects} />
                    </div>
                  )
                })}
              </>
            )}

            {/* Empty org */}
            {totalForOrg === 0 && (
              <div style={{
                padding: "var(--space-6)", textAlign: "center",
                color: "var(--text-muted)", fontSize: "var(--text-sm)",
              }}>
                Keine Dokumente
              </div>
            )}
          </div>
        )
      })}

    </div>
  )
}
