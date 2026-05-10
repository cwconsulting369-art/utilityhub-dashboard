import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface SearchResult {
  type:     "object"
  id:       string
  title:    string
  subtitle: string | null
  href:     string
}

/** GET /api/portal/search?q=... — scoped typeahead for portal customers, max 8 results */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json([])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, customer_id")
    .eq("id", user.id)
    .single()

  const esc = q.replace(/%/g, "\\%").replace(/_/g, "\\_")

  let query = supabase
    .from("customers")
    .select("id, full_name, city, postal_code, address_display")
    .or(`full_name.ilike.%${esc}%,address_display.ilike.%${esc}%`)
    .order("full_name")
    .limit(8)

  if (profile?.organization_id) {
    query = query.eq("organization_id", profile.organization_id)
  } else if (profile?.customer_id) {
    query = query.eq("id", profile.customer_id)
  } else {
    return NextResponse.json([])
  }

  const { data: customers, error } = await query

  if (error) {
    console.error("[portal/search] Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results: SearchResult[] = (customers ?? []).map(c => ({
    type:     "object",
    id:       c.id,
    title:    c.full_name,
    subtitle: (c.address_display as string | null) || [c.postal_code, c.city].filter(Boolean).join(" ") || null,
    href:     `/portal/objects/${c.id}`,
  }))

  return NextResponse.json(results)
}
