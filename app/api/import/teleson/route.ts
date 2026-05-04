import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { parseCsv } from "@/lib/teleson/csvParser"
import { processRows, buildBatchErrorLog } from "@/lib/teleson/importRows"

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  // Auth — must be admin or staff
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // ── Parse input ──────────────────────────────────────────────────────────
  let rows: Record<string, unknown>[]
  let filename: string | null = null
  let organizationName: string | undefined = undefined

  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null)
    if (!formData) return NextResponse.json({ error: "Ungültige FormData" }, { status: 400 })

    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Kein 'file'-Feld in FormData" }, { status: 400 })

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `Datei zu groß (max. ${MAX_FILE_BYTES / 1024 / 1024} MB)` },
        { status: 400 }
      )
    }

    filename         = file.name
    organizationName = (formData.get("organization_name") as string | null)?.trim() || undefined
    const ext        = file.name.split(".").pop()?.toLowerCase()
    const text       = await file.text()

    if (ext === "json") {
      try {
        const parsed = JSON.parse(text)
        if (!Array.isArray(parsed)) throw new Error("JSON muss ein Array sein: [{ ... }, ...]")
        rows = parsed as Record<string, unknown>[]
      } catch (e) {
        return NextResponse.json({ error: "JSON-Fehler: " + String(e) }, { status: 400 })
      }
    } else {
      // CSV or TSV
      rows = parseCsv(text) as Record<string, unknown>[]
      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Datei enthält keine Datenzeilen (Kopfzeile + mind. eine Zeile erwartet)" },
          { status: 400 }
        )
      }
    }
  } else {
    // Legacy JSON body: { rows: [...], filename?: string, organization_name?: string }
    const body = await request.json().catch(() => null)
    if (!body?.rows || !Array.isArray(body.rows) || body.rows.length === 0) {
      return NextResponse.json(
        { error: "Erwartet: FormData mit 'file' (.csv / .json) oder JSON-Body { rows: [...] }" },
        { status: 400 }
      )
    }
    rows             = body.rows as Record<string, unknown>[]
    filename         = (body.filename as string) ?? null
    organizationName = (body.organization_name as string | undefined)?.trim() || undefined
  }

  // ── Create import batch ──────────────────────────────────────────────────
  const admin = createAdminClient()

  const { data: batch, error: batchErr } = await admin
    .from("import_batches")
    .insert({
      source:      "teleson",
      filename,
      total_rows:  rows.length,
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

  // ── Process rows ─────────────────────────────────────────────────────────
  const result = await processRows(rows, batch.id, admin, { organizationName })
  const { processed, skippedMetadata, skippedIncomplete, errors, errorLog, skippedLog } = result

  // ── Finalize batch ───────────────────────────────────────────────────────
  const totalNotImported = skippedMetadata + skippedIncomplete + errors
  await admin.from("import_batches").update({
    processed_rows: processed,
    error_rows:     totalNotImported,
    status:         (processed === 0 && errors > 0) ? "failed" : "done",
    completed_at:   new Date().toISOString(),
    error_log:      buildBatchErrorLog(result),
  }).eq("id", batch.id)

  return NextResponse.json({
    batch_id:  batch.id,
    total:     rows.length,
    processed,
    skipped:   skippedMetadata + skippedIncomplete,
    errors,
    error_log: errorLog.slice(0, 20),
    skip_log:  skippedLog.slice(0, 10),
  })
}
