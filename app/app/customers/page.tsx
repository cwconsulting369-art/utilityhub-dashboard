import { createClient } from "@/lib/supabase/server"
import { CustomersTable } from "./CustomersTable"

export const metadata = { title: "Kunden | UtilityHub" }

const PAGE_SIZE = 25

interface Props {
  searchParams: Promise<{
    q?: string; page?: string; status?: string
    energie?: string; tStatus?: string
    orgId?: string; objectType?: string
  }>
}

const VALID_STATUSES  = ["active", "inactive", "blocked", "pending"]
const VALID_OBJ_TYPES = ["weg", "privat"]

const STATUS_LABELS: Record<string, string> = {
  active: "Aktiv", inactive: "Inaktiv", blocked: "Gesperrt", pending: "Ausstehend",
}
const OBJECT_TYPE_LABELS: Record<string, string> = {
  weg: "WEG", privat: "Privat",
}

export default async function CustomersPage({ searchParams }: Props) {
  const {
    q = "", page: pageStr = "1", status = "",
    energie = "", tStatus = "",
    orgId = "", objectType = "",
  } = await searchParams

  const page        = Math.max(1, parseInt(pageStr) || 1)
  const from        = (page - 1) * PAGE_SIZE
  const to          = from + PAGE_SIZE - 1
  const supabase    = await createClient()
  const escaped     = q.replace(/%/g, "\\%").replace(/_/g, "\\_")
  const safeObjType = VALID_OBJ_TYPES.includes(objectType) ? objectType : ""
  const safeOrgId   = orgId  // UUID — no allowlist needed, query will simply return 0 rows if invalid

  // ── Parallel lookups ───────────────────────────────────────────────────────
  const [
    identityResult, telesonResult, energieResult, tStatusResult,
    orgListResult,
  ] = await Promise.all([
    escaped
      ? supabase.from("customer_identities").select("customer_id").ilike("external_id", `%${escaped}%`)
      : Promise.resolve({ data: null }),

    (energie || tStatus)
      ? (() => {
          let q = supabase.from("teleson_records").select("customer_id")
          if (energie) q = q.filter("energie", "ilike", energie)
          if (tStatus) q = q.eq("status", tStatus)
          return q
        })()
      : Promise.resolve({ data: null }),

    supabase.from("teleson_records").select("energie").not("energie", "is", null),
    supabase.from("teleson_records").select("status").not("status", "is", null),
    supabase.from("organizations").select("id, name").order("name"),
  ])

  const identityIds      = [...new Set(identityResult.data?.map(d => d.customer_id) ?? [])]
  const telesonIds       = (energie || tStatus)
    ? [...new Set(telesonResult.data?.map(d => d.customer_id) ?? [])]
    : null

  // Deduplicate energie options case-insensitively
  const energieSeen = new Set<string>()
  const energieOptions: string[] = []
  for (const r of energieResult.data ?? []) {
    const key = (r.energie as string).toLowerCase()
    if (!energieSeen.has(key)) { energieSeen.add(key); energieOptions.push(r.energie as string) }
  }
  energieOptions.sort()

  const tStatusOptions   = [...new Set((tStatusResult.data ?? []).map(r => r.status as string))].sort()
  const orgOptions       = orgListResult.data ?? []

  // ── Build paginated customers query ───────────────────────────────────────
  let query = supabase
    .from("customers")
    .select(
      "id, uhid, full_name, email, phone, city, postal_code, status, source, created_at, " +
      "object_type, organization_id, address_display, " +
      "customer_identities(system, external_id), " +
      "teleson_records(energie, neuer_versorger, neu_ap, zaehlernummer, malo, status, created_at), " +
      "organizations(name), " +
      "fg_finanz_records(id), " +
      "upsell_opportunities(id, status)",
      { count: "exact" }
    )
    .not("full_name", "ilike", "% (Allgemein)")  // Hauptordner are not real objects
    .order("created_at", { ascending: false })
    .range(from, to)

  if (escaped) {
    query = identityIds.length > 0
      ? query.or(`full_name.ilike.%${escaped}%,id.in.(${identityIds.join(",")})`)
      : query.ilike("full_name", `%${escaped}%`)
  }
  if (status && VALID_STATUSES.includes(status)) {
    query = query.eq("status", status)
  }
  if (telesonIds !== null) {
    const ids = telesonIds.length > 0 ? telesonIds : ["00000000-0000-0000-0000-000000000000"]
    query = query.in("id", ids)
  }
  if (safeOrgId) {
    query = query.eq("organization_id", safeOrgId)
  }
  if (safeObjType === "weg") {
    query = query.eq("object_type", "weg")
  } else if (safeObjType === "privat") {
    query = query.or("object_type.is.null,object_type.neq.weg")
  }

  const { data: customers, count } = await query
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)

  const activeOrgName = safeOrgId
    ? (orgOptions.find(o => o.id === safeOrgId)?.name ?? safeOrgId)
    : ""
  const activeFilters = [
    q && `„${q}"`,
    status && STATUS_LABELS[status],
    energie, tStatus,
    activeOrgName,
    safeObjType && (OBJECT_TYPE_LABELS[safeObjType] ?? safeObjType),
  ].filter(Boolean).join(" · ")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Objekte</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            {count ?? 0} {activeFilters ? "Treffer" : count === 1 ? "Eintrag" : "Einträge gesamt"}
            {activeFilters && <span> · {activeFilters}</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <a
            href={`/api/export/customers${status ? `?status=${status}` : ""}`}
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "var(--space-2) var(--space-4)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", color: "var(--text-muted)", textDecoration: "none", whiteSpace: "nowrap" }}
          >↓ Kunden CSV</a>
          <a
            href={`/api/export/teleson${energie ? `?energie=${encodeURIComponent(energie)}` : ""}`}
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "var(--space-2) var(--space-4)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", color: "var(--text-muted)", textDecoration: "none", whiteSpace: "nowrap" }}
          >↓ Teleson CSV</a>
          <a
            href="/api/export/documents"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "var(--space-2) var(--space-4)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", color: "var(--text-muted)", textDecoration: "none", whiteSpace: "nowrap" }}
          >↓ Dokumente CSV</a>
          <a href="/app/imports" style={{ background: "var(--primary-bright)", color: "#fff", padding: "var(--space-2) var(--space-5)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 600, textDecoration: "none" }}>
            + Import
          </a>
        </div>
      </div>

      <CustomersTable
        key={`${q}-${orgId}-${objectType}`}
        customers={(customers ?? []) as unknown as Parameters<typeof CustomersTable>[0]["customers"]}
        total={count ?? 0}
        page={safePage}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        q={q}
        status={status}
        energie={energie}
        tStatus={tStatus}
        orgId={safeOrgId}
        objectType={safeObjType}
        energieOptions={energieOptions}
        tStatusOptions={tStatusOptions}
        orgOptions={orgOptions}
      />

    </div>
  )
}
