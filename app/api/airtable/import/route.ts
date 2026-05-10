import { NextRequest, NextResponse } from "next/server"
import { createClient }    from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRecords, testConnection } from "@/lib/airtable/client"
import { syncAirtableRecords }             from "@/lib/airtable/sync"

const DEFAULT_PAT     = process.env.AIRTABLE_PAT      ?? ""
const DEFAULT_BASE_ID = process.env.AIRTABLE_BASE_ID  ?? ""
const DEFAULT_TABLE   = process.env.AIRTABLE_TABLE_ID ?? "Teleson"

/** GET — test connection with default or custom credentials */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: "Nicht autorisiert" }, { status: 401 })

  const pat     = req.nextUrl.searchParams.get("pat")     || DEFAULT_PAT
  const baseId  = req.nextUrl.searchParams.get("base_id") || DEFAULT_BASE_ID
  const tableId = req.nextUrl.searchParams.get("table_id") || DEFAULT_TABLE

  if (!pat || !baseId) return NextResponse.json({ ok: false, error: "Airtable PAT / Base-ID fehlt" })

  try {
    const info = await testConnection({ pat, baseId, tableId })
    return NextResponse.json({ ok: true, ...info })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) })
  }
}

/** POST — run full sync */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role))
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })

  const body = await req.json() as {
    organization_name?: string
    pat?:     string
    base_id?: string
    table_id?: string
  }

  const pat     = body.pat     || DEFAULT_PAT
  const baseId  = body.base_id || DEFAULT_BASE_ID
  const tableId = body.table_id || DEFAULT_TABLE

  if (!pat || !baseId) return NextResponse.json({ error: "Airtable PAT / Base-ID fehlt" }, { status: 400 })

  const admin = createAdminClient()

  const { data: batch, error: be } = await admin
    .from("import_batches")
    .insert({ source: "airtable", status: "processing", created_by: user.id })
    .select("id").single()
  if (be || !batch) return NextResponse.json({ error: "Batch anlegen: " + be?.message }, { status: 500 })

  try {
    const records = await fetchAllRecords({ pat, baseId, tableId })
    const result  = await syncAirtableRecords(records, batch.id, admin, {
      organizationName: body.organization_name,
    })

    await admin.from("import_batches").update({
      status:     "done",
      row_count:  result.total,
      finished_at: new Date().toISOString(),
    }).eq("id", batch.id)

    return NextResponse.json({
      batch_id:  batch.id,
      total:     result.total,
      imported:  result.imported,
      updated:   result.updated,
      skipped:   result.skipped,
      queued:    result.queued,
      conflicts: result.conflicts,
      errors:    result.errorLog.length,
      error_log: result.errorLog,
    })
  } catch (e) {
    await admin.from("import_batches").update({ status: "error" }).eq("id", batch.id)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
