import { createClient }                from "@/lib/supabase/server"
import { redirect }                    from "next/navigation"
import { getStreet }                   from "@/lib/customers/format"
import { DashboardKPICards }           from "@/components/portal/DashboardKPICards"
import { DashboardObjectsTable }       from "@/components/portal/DashboardObjectsTable"
import { PortalContactsSection }       from "@/components/portal/PortalContactsSection"

export const metadata = { title: "Dashboard | UtilityHub" }

const PAGE_SIZE = 10

type ObjRow = {
  id:          string
  full_name:   string
  status:      string
  object_type: string | null
  city:        string | null
  postal_code: string | null
  teleson_records: {
    energie:         string | null
    neuer_versorger: string | null
    neu_ap:          number | null
    status:          string | null
    malo:            string | null
    zaehlernummer:   string | null
    created_at:      string | null
  }[] | null
}

export default async function PortalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page   = Math.max(1, parseInt(pageStr ?? "1", 10))
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, customer_id, organization_id")
    .eq("id", user.id)
    .single()

  const organizationId = profile?.organization_id ?? null
  const customerId     = profile?.customer_id     ?? null

  // ── Org-Modus ─────────────────────────────────────────────────────────────
  let orgName: string | null = null
  let orgObjectCount   = 0
  let orgStromCount    = 0
  let orgGasCount      = 0
  let orgFgFinanzCount = 0
  let orgObjects: ObjRow[] = []
  let totalPages = 1

  if (organizationId) {
    const [{ data: org }, { data: custs }] = await Promise.all([
      supabase.from("organizations").select("name").eq("id", organizationId).single(),
      supabase.from("customers").select("id").eq("organization_id", organizationId),
    ])
    orgName        = org?.name ?? null
    const ids      = (custs ?? []).map(c => c.id)
    orgObjectCount = ids.length
    totalPages     = Math.max(1, Math.ceil(orgObjectCount / PAGE_SIZE))

    if (ids.length > 0) {
      const [{ data: tel }, { data: recent }, { count: fgCount }] = await Promise.all([
        supabase.from("teleson_records").select("energie, malo, customer_id").in("customer_id", ids),
        supabase.from("customers")
          .select(
            "id, full_name, status, object_type, city, postal_code, " +
            "teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, created_at)"
          )
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1),
        supabase.from("fg_finanz_records")
          .select("id", { count: "exact", head: true })
          .in("customer_id", ids),
      ])
      const teleson    = (tel ?? []) as { energie: string | null; customer_id: string }[]
      orgStromCount    = teleson.filter(r => r.energie?.toLowerCase() === "strom").length
      orgGasCount      = teleson.filter(r => r.energie?.toLowerCase() === "gas").length
      orgFgFinanzCount = fgCount ?? 0
      orgObjects       = (recent ?? []) as unknown as ObjRow[]
    }
  }

  // ── Single-Customer-Fallback ───────────────────────────────────────────────
  let singleName       = ""
  let singleStromCount = 0
  let singleGasCount   = 0
  let singleObjects: ObjRow[] = []

  if (!organizationId && customerId) {
    const [customerRes, telesonRes, objRes] = await Promise.all([
      supabase.from("customers").select("full_name").eq("id", customerId).single(),
      supabase.from("teleson_records").select("energie").eq("customer_id", customerId),
      supabase.from("customers")
        .select("id, full_name, status, object_type, city, postal_code, teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, created_at)")
        .eq("id", customerId)
        .limit(1),
    ])
    singleName        = customerRes.data?.full_name ?? ""
    const tel         = (telesonRes.data ?? []) as { energie: string | null }[]
    singleStromCount  = tel.filter(r => r.energie?.toLowerCase() === "strom").length
    singleGasCount    = tel.filter(r => r.energie?.toLowerCase() === "gas").length
    singleObjects     = (objRes.data ?? []) as unknown as ObjRow[]
  }

  const isOrg        = !!organizationId
  const stromCount   = isOrg ? orgStromCount    : singleStromCount
  const gasCount     = isOrg ? orgGasCount      : singleGasCount
  const totalObjects = isOrg ? orgObjectCount   : (singleObjects.length > 0 ? 1 : 0)
  const totalLiefer  = stromCount + gasCount
  const objects      = isOrg ? orgObjects       : singleObjects
  const allOptimized = totalLiefer > 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* KPI Cards — in Rahmen */}
      <div style={{
        background:   "var(--surface)",
        border:       "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding:      "var(--space-5) var(--space-6)",
      }}>
        <DashboardKPICards
          stromCount={stromCount}
          gasCount={gasCount}
          orgFgFinanzCount={orgFgFinanzCount}
          totalObjects={totalObjects}
          totalLiefer={totalLiefer}
          allOptimized={allOptimized}
        />
      </div>

      {/* Objekte Übersicht */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{
          padding:        "var(--space-4) var(--space-6)",
          borderBottom:   "1px solid var(--border)",
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
        }}>
          <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Objekte Übersicht</h2>
          <a href="/portal/objects" style={{ fontSize: "var(--text-sm)", color: "var(--primary-bright)", textDecoration: "none" }}>
            Alle anzeigen →
          </a>
        </div>

        <DashboardObjectsTable objects={objects as Parameters<typeof DashboardObjectsTable>[0]["objects"]} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding:        "var(--space-4)",
            borderTop:      "1px solid var(--border)",
            display:        "flex",
            justifyContent: "center",
            alignItems:     "center",
            gap:            "var(--space-2)",
          }}>
            {page > 1 && (
              <a href={`?page=${page - 1}`} style={{
                width: "32px", height: "32px", borderRadius: "var(--radius-md)",
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text-muted)", cursor: "pointer", fontSize: "var(--text-sm)",
                display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
              }}>‹</a>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <a key={p} href={`?page=${p}`} style={{
                width: "32px", height: "32px", borderRadius: "var(--radius-md)",
                background: p === page ? "var(--primary-bright)" : "transparent",
                border: p === page ? "none" : "1px solid var(--border)",
                color: p === page ? "#fff" : "var(--text-muted)",
                fontWeight: p === page ? 700 : 400,
                fontSize: "var(--text-sm)",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none",
              }}>{p}</a>
            ))}

            {page < totalPages && (
              <a href={`?page=${page + 1}`} style={{
                width: "32px", height: "32px", borderRadius: "var(--radius-md)",
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text-muted)", cursor: "pointer", fontSize: "var(--text-sm)",
                display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
              }}>›</a>
            )}
          </div>
        )}
      </div>

      {/* Ansprechpartner */}
      <PortalContactsSection />

    </div>
  )
}
