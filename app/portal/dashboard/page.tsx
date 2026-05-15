import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardKPICards } from "@/components/portal/DashboardKPICards"
import { DashboardObjectsTable } from "@/components/portal/DashboardObjectsTable"

export const metadata = { title: "Dashboard | UtilityHub Portal" }

/* ── Types ── */

type ObjRow = {
  id:          string
  full_name:   string
  status:      string
  object_type: string | null
  city:        string | null
  postal_code: string | null
  created_at:  string
  customer_identities: { system: string; external_id: string }[] | null
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

/* ── Page ── */

export default async function PortalDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  /* ── profile lookup ── */

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, customer_id, organization_id")
    .eq("id", user.id)
    .single()

  const displayName = profile?.full_name ?? ""
  const customerId  = profile?.customer_id ?? null
  const orgId       = profile?.organization_id ?? null
  const isOrgModus  = Boolean(orgId)

  let orgLabel = ""

  /* ── org-mode ── */

  let stromCount       = 0
  let gasCount         = 0
  let orgFgFinanzCount = 0
  let totalObjects     = 0
  let totalLiefer      = 0
  let allOptimized     = true
  let recentObjects: ObjRow[] = []

  if (isOrgModus) {
    /* org name */
    const { data: orgRow } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single()
    orgLabel = orgRow?.name ? `${orgRow.name} (Organisation)` : "Organisation"

    /* customer ids */
    const { data: custRows } = await supabase
      .from("customers")
      .select("id")
      .eq("organization_id", orgId)
    const custIds = (custRows ?? []).map(r => r.id)

    /* strom */
    if (custIds.length > 0) {
      const { count } = await supabase
        .from("teleson_records")
        .select("*", { head: true, count: "exact" })
        .eq("energie", "Strom")
        .in("customer_id", custIds)
      stromCount = count ?? 0
    }

    /* gas */
    if (custIds.length > 0) {
      const { count } = await supabase
        .from("teleson_records")
        .select("*", { head: true, count: "exact" })
        .eq("energie", "Gas")
        .in("customer_id", custIds)
      gasCount = count ?? 0
    }

    /* FG Finanz */
    if (custIds.length > 0) {
      const { count } = await supabase
        .from("fg_finanz_records")
        .select("*", { head: true, count: "exact" })
        .in("customer_id", custIds)
      orgFgFinanzCount = count ?? 0
    }

    totalObjects = custIds.length
    totalLiefer  = stromCount + gasCount

    /* recent objects */
    const { data: recent } = await supabase
      .from("customers")
      .select(
        "id, full_name, status, object_type, city, postal_code, created_at, " +
        "customer_identities(system, external_id), " +
        "teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, created_at)"
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(10)
    recentObjects = (recent as ObjRow[] | null) ?? []

  } else if (customerId) {
    /* single-customer fallback */
    orgLabel = "Meine Verträge"

    const { data: custRow } = await supabase
      .from("customers")
      .select(
        "id, full_name, status, object_type, city, postal_code, created_at, " +
        "customer_identities(system, external_id), " +
        "teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, created_at)"
      )
      .eq("id", customerId)
      .single()

    const typedRow = custRow as ObjRow | null
    if (typedRow) {
      const recs = typedRow.teleson_records ?? []
      stromCount   = recs.filter(r => r.energie?.toLowerCase() === "strom").length
      gasCount     = recs.filter(r => r.energie?.toLowerCase() === "gas").length
      totalObjects = 1
      totalLiefer  = recs.length
      recentObjects = [typedRow]
    }

    /* fg finanz */
    const { count } = await supabase
      .from("fg_finanz_records")
      .select("*", { head: true, count: "exact" })
      .eq("customer_id", customerId)
    orgFgFinanzCount = count ?? 0

  } else {
    orgLabel = "Dashboard"
  }

  /* ── fg finanz all ── */
  const { count: fgAll } = await supabase
    .from("fg_finanz_records")
    .select("*", { head: true, count: "exact" })
  const _totalFg = fgAll ?? 0

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        padding: "0 4px",
      }}
    >
      {/* ── KPI Cards (fix ~110px) ── */}
      <div style={{ flex: "0 0 108px", minHeight: 0 }}>
        <DashboardKPICards
          stromCount={stromCount}
          gasCount={gasCount}
          orgFgFinanzCount={orgFgFinanzCount}
          totalObjects={totalObjects}
          totalLiefer={totalLiefer}
          allOptimized={allOptimized}
        />
      </div>

      {/* ── Tabelle (Rest) ── */}
      <div className="table-container" style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header bar */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-bright)", margin: 0 }}>Objekte Übersicht</h2>
          <a href="/portal/objects" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>Alle anzeigen →</a>
        </div>

        {/* Table */}
        <DashboardObjectsTable objects={recentObjects} />
      </div>
    </div>
  )
}
