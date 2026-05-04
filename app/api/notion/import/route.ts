import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getDatabaseInfo, queryAllPagesWithMeta } from "@/lib/notion/client"
import { syncNotionPages } from "@/lib/notion/sync"

const DB_ID = process.env.NOTION_DATABASE_ID ?? ""

/** GET — connection test; returns DB metadata without importing. */
export async function GET() {
  if (!DB_ID) {
    return NextResponse.json(
      { ok: false, error: "NOTION_DATABASE_ID nicht konfiguriert" },
      { status: 500 }
    )
  }
  try {
    const info = await getDatabaseInfo(DB_ID)
    return NextResponse.json({ ok: true, ...info })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 502 })
  }
}

/** POST — sync all Notion pages into Supabase via notion_sync_state + match_review_queue. */
export async function POST(request: NextRequest) {
  if (!DB_ID) {
    return NextResponse.json(
      { error: "NOTION_DATABASE_ID nicht konfiguriert" },
      { status: 500 }
    )
  }

  // Auth — must be admin or staff
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Optional batch-level Hausverwaltung override (set by import UI)
  const body = await request.json().catch(() => null) as { organization_name?: string } | null
  const organizationName = body?.organization_name?.trim() || undefined

  // Get DB title for the batch record
  let dbTitle = "Notion DB"
  try {
    const info = await getDatabaseInfo(DB_ID)
    dbTitle = info.title
  } catch {
    // non-fatal — continue with fallback title
  }

  // Fetch all pages with metadata (ID + last_edited_time + props)
  let pages: Awaited<ReturnType<typeof queryAllPagesWithMeta>>
  try {
    pages = await queryAllPagesWithMeta(DB_ID)
  } catch (e) {
    return NextResponse.json(
      { error: "Notion-Daten konnten nicht gelesen werden: " + String(e) },
      { status: 502 }
    )
  }

  if (pages.length === 0) {
    return NextResponse.json(
      { error: "Notion-Datenbank enthält keine Einträge" },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Create import batch
  const { data: batch, error: batchErr } = await admin
    .from("import_batches")
    .insert({
      source:      "teleson",
      filename:    `Notion: ${dbTitle}`.slice(0, 200),
      total_rows:  pages.length,
      status:      "processing",
      imported_by: user.id,
    })
    .select("id").single()

  if (batchErr || !batch) {
    return NextResponse.json(
      { error: "Import-Batch konnte nicht erstellt werden: " + batchErr?.message },
      { status: 500 }
    )
  }

  // Run sync
  const result = await syncNotionPages(pages, batch.id, admin, { organizationName })

  // Finalize batch
  const hasErrors = result.errorLog.length > 0
  await admin.from("import_batches").update({
    processed_rows: result.imported + result.updated,
    error_rows:     result.errorLog.length,
    status:         (result.imported === 0 && result.updated === 0 && hasErrors)
                      ? "failed"
                      : "done",
    completed_at:   new Date().toISOString(),
    error_log: {
      summary: {
        imported:           result.imported,
        updated:            result.updated,
        skipped:            result.skipped,
        queued:             result.queued,
        conflicts:          result.conflicts,
        errors:             result.errorLog.length,
        skipped_metadata:   0,
        skipped_incomplete: 0,
      },
      errors: result.errorLog.slice(0, 20),
    },
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
    error_log: result.errorLog.slice(0, 20),
  })
}
