import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/** GET /api/customers/search?q=... — staff-only typeahead, max 6 results */
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

  const escaped = q.replace(/%/g, "\\%").replace(/_/g, "\\_")
  const { data } = await supabase
    .from("customers")
    .select("id, full_name, city, address_display")
    .ilike("full_name", `%${escaped}%`)
    .order("full_name")
    .limit(6)

  return NextResponse.json(data ?? [])
}
