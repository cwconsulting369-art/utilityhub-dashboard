import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface SearchResult {
  type:     "object" | "org"
  id:       string
  title:    string
  subtitle: string | null
  href:     string
}

/** GET /api/search?q=... — global typeahead for staff/admin, max 5+5 results */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json([])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const esc      = q.replace(/%/g, "\\%").replace(/_/g, "\\_")
  const isNumeric = /^\d+$/.test(q)

  const baseCustomerQuery = () =>
    supabase
      .from("customers")
      .select("id, uhid, full_name, city, postal_code, address_display, status")
      .not("full_name", "ilike", "% (Allgemein)")
      .order("full_name")
      .limit(5)

  const [{ data: customers }, { data: uhidMatch }, { data: orgs }] = await Promise.all([
    baseCustomerQuery()
      .or(`full_name.ilike.%${esc}%,address_display.ilike.%${esc}%`),

    isNumeric
      ? baseCustomerQuery().eq("uhid", Number(q))
      : Promise.resolve({ data: [] as unknown[] }),

    supabase
      .from("organizations")
      .select("id, name, type")
      .ilike("name", `%${esc}%`)
      .order("name")
      .limit(5),
  ])

  const seen     = new Set<string>()
  const combined = [...(uhidMatch ?? []), ...(customers ?? [])] as typeof customers

  const results: SearchResult[] = []

  for (const c of combined ?? []) {
    if (seen.has(c!.id)) continue
    seen.add(c!.id)
    const addr     = (c!.address_display as string | null) || [c!.postal_code, c!.city].filter(Boolean).join(" ") || null
    const subtitle = [c!.uhid ? `#${c!.uhid}` : null, addr].filter(Boolean).join(" · ") || c!.status || null
    results.push({ type: "object", id: c!.id, title: c!.full_name, subtitle, href: `/app/customers/${c!.id}` })
  }

  for (const o of orgs ?? []) {
    results.push({ type: "org", id: o.id, title: o.name, subtitle: o.type ?? null, href: `/app/organizations/${o.id}` })
  }

  return NextResponse.json(results)
}
