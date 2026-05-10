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

  const esc = q.replace(/%/g, "\\%").replace(/_/g, "\\_")

  const [{ data: customers }, { data: orgs }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, full_name, city, postal_code, status")
      .ilike("full_name", `%${esc}%`)
      .order("full_name")
      .limit(5),

    supabase
      .from("organizations")
      .select("id, name, type")
      .ilike("name", `%${esc}%`)
      .order("name")
      .limit(5),
  ])

  const results: SearchResult[] = []

  for (const c of customers ?? []) {
    const subtitle = [c.postal_code, c.city].filter(Boolean).join(" ") || c.status || null
    results.push({ type: "object", id: c.id, title: c.full_name, subtitle, href: `/app/customers/${c.id}` })
  }

  for (const o of orgs ?? []) {
    results.push({ type: "org", id: o.id, title: o.name, subtitle: o.type ?? null, href: `/app/organizations/${o.id}` })
  }

  return NextResponse.json(results)
}
