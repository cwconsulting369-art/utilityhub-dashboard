import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getStreet } from "@/lib/customers/format"
import { DashboardKPICards } from "@/components/portal/DashboardKPICards"
import { DashboardObjectsTable } from "@/components/portal/DashboardObjectsTable"

export const metadata = { title: "Dashboard | UtilityHub" }

type ObjRow = {
  id: string
  full_name: string
  status: string
  object_type: string | null
  city: string | null
  postal_code: string | null
  created_at: string
  customer_identities: { system: string; external_id: string }[] | null
  teleson_records: {
    energie: string | null
    neuer_versorger: string | null
    neu_ap: number | null
    status: string | null
    malo: string | null
    zaehlernummer: string | null
    created_at: string | null
  }[] | null
}

export default async function PortalDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  /* ── Profile lookup ── */
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, customer_id, organization_id")
    .eq("id", user.id)
    .single()

  const organizationId = profile?.organization_id ?? null
  const customerId = profile?.customer_id ?? null
  const displayName = profile?.full_name ?? user.email ?? ""

  /* ── Org-Modus ── */
  let orgName: string | null = null
  let orgObjectCount = 0
  let orgStromCount = 0
  let orgGasCount = 0
  let orgFgFinanzCount = 0
  let orgObjects: ObjRow[] = []

  if (organizationId) {
    const [{ data: org }, { data: custs }] = await Promise.all([
      supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .single(),
      supabase
        .from("customers")
        .select("id")
        .eq("organization_id", organizationId),
    ])
    orgName = org?.name ?? null
    const ids = (custs ?? []).map((c) => c.id)
    orgObjectCount = ids.length

    if (ids.length > 0) {
      const [{ data: tel }, { data: recent }, { count: fgCount }] =
        await Promise.all([
          supabase
            .from("teleson_records")
            .select("energie, malo, customer_id")
            .in("customer_id", ids),
          supabase
            .from("customers")
            .select(
              "id, full_name, status, object_type, city, postal_code, created_at, " +
                "customer_identities(system, external_id), " +
                "teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, created_at)"
            )
            .eq("organization_id", organizationId)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("fg_finanz_records")
            .select("id", { count: "exact", head: true })
            .in("customer_id", ids),
        ])
      const teleson = (tel ?? []) as {
        energie: string | null
        customer_id: string
      }[]
      orgStromCount = teleson.filter(
        (r) => r.energie?.toLowerCase() === "strom"
      ).length
      orgGasCount = teleson.filter(
        (r) => r.energie?.toLowerCase() === "gas"
      ).length
      orgFgFinanzCount = fgCount ?? 0
      orgObjects = (recent ?? []) as unknown as ObjRow[]
    }
  }

  /* ── Single-Customer-Fallback ── */
  let singleName = ""
  let singleStromCount = 0
  let singleGasCount = 0
  let singleObjects: ObjRow[] = []

  if (!organizationId && customerId) {
    const [customerRes, telesonRes, objRes] = await Promise.all([
      supabase
        .from("customers")
        .select("full_name")
        .eq("id", customerId)
        .single(),
      supabase
        .from("teleson_records")
        .select("energie")
        .eq("customer_id", customerId),
      supabase
        .from("customers")
        .select(
          "id, full_name, status, object_type, city, postal_code, created_at, " +
            "customer_identities(system, external_id), " +
            "teleson_records(energie, neuer_versorger, neu_ap, status, malo, zaehlernummer, created_at)"
        )
        .eq("id", customerId)
        .limit(1),
    ])
    singleName = customerRes.data?.full_name ?? ""
    const tel = (telesonRes.data ?? []) as { energie: string | null }[]
    singleStromCount = tel.filter(
      (r) => r.energie?.toLowerCase() === "strom"
    ).length
    singleGasCount = tel.filter(
      (r) => r.energie?.toLowerCase() === "gas"
    ).length
    singleObjects = (objRes.data ?? []) as unknown as ObjRow[]
  }

  /* ── Aggregated values ── */
  const isOrg = !!organizationId
  const stromCount = isOrg ? orgStromCount : singleStromCount
  const gasCount = isOrg ? orgGasCount : singleGasCount
  const totalObjects = isOrg
    ? orgObjectCount
    : singleObjects.length > 0
      ? 1
      : 0
  const totalLiefer = stromCount + gasCount
  const objects = (isOrg ? orgObjects : singleObjects).slice(0, 5)
  const orgLabel = isOrg
    ? (orgName ?? "Ihre Hausverwaltung")
    : singleName
      ? getStreet(singleName)
      : "Ihr Objekt"
  const allOptimized = totalLiefer > 0

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "1fr 3fr",
        gap: "var(--space-6)",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* ── KPI Cards (1fr = 25%) ── */}
      <div style={{ minHeight: 0, overflow: "hidden" }}>
        <DashboardKPICards
        stromCount={stromCount}
        gasCount={gasCount}
        orgFgFinanzCount={orgFgFinanzCount}
        totalObjects={totalObjects}
        totalLiefer={totalLiefer}
        allOptimized={allOptimized}
      />
      </div>

      {/* ── Objekte Übersicht (3fr = 75%) ── */} (table-container) ── */}
      <div className="table-container" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div
          style={{
            padding: "var(--space-4) var(--space-6)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{ fontSize: "var(--text-base)", fontWeight: 700 }}
          >
            Objekte &Uuml;bersicht
          </h2>
          <a
            href="/portal/objects"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--primary-bright)",
              textDecoration: "none",
            }}
          >
            Alle anzeigen &rarr;
          </a>
        </div>

        <DashboardObjectsTable
          objects={
            objects as Parameters<typeof DashboardObjectsTable>[0]["objects"]
          }
        />

        {/* Pagination */}
        {objects.length >= 5 && (
          <div
            style={{
              padding: "var(--space-4)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <button
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
              }}
            >
              &lsaquo;
            </button>
            <button
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-md)",
                background: "var(--primary-bright)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "var(--text-sm)",
              }}
            >
              1
            </button>
            <button
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
              }}
            >
              2
            </button>
            <button
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
              }}
            >
              &rsaquo;
            </button>
          </div>
        )}
      </div>

      {/* ── Ansprechpartner ── */}
      <DBContacts />
    </div>
  )
}

async function DBContacts() {
  const supabase = await createClient()
  let contacts: { id: string; full_name: string; role: string | null; phone: string | null }[] = []
  try {
    const { data } = await supabase.from("contacts").select("id, full_name, role, phone").order("full_name")
    if (data) contacts = data
  } catch { /* ignore */ }

  if (contacts.length === 0) return null

  return (
    <div>
      <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-3)" }}>Ihre Ansprechpartner</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        {contacts.map((c) => (
          <div key={c.id} className="card" style={{ padding: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", color: "var(--accent)", flexShrink: 0 }}>
              {c.full_name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{c.full_name}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{c.role}</div>
              {c.phone && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{c.phone}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
