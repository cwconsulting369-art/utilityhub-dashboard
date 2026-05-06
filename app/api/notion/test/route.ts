import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDatabaseInfo } from "@/lib/notion/client"

/** POST — test connection to a custom Notion DB. Admin/staff only. */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as {
    db_id?:  string
    token?:  string
  } | null

  const dbId  = body?.db_id?.trim()
  const token = body?.token?.trim() || undefined

  if (!dbId) {
    return NextResponse.json({ ok: false, error: "db_id fehlt" }, { status: 400 })
  }

  try {
    const info = await getDatabaseInfo(dbId, token)
    return NextResponse.json({ ok: true, ...info })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 502 })
  }
}
