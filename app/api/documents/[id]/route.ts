import { NextRequest, NextResponse } from "next/server"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createSignedUrl, deleteFromStorage } from "@/lib/documents/storage"
import { getViewUrl } from "@/lib/google-drive/client"

interface Params { params: Promise<{ id: string }> }

// GET /api/documents/[id] — redirect to signed URL or Drive view URL
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient()
  const { data: doc } = await admin
    .from("customer_documents")
    .select("source, storage_path, google_drive_file_id, google_drive_url, name, mime_type")
    .eq("id", id)
    .single()

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (doc.source === "supabase_storage" && doc.storage_path) {
    try {
      const url = await createSignedUrl(doc.storage_path, 3600)
      return NextResponse.redirect(url)
    } catch (e) {
      const msg = String(e).toLowerCase()
      if (msg.includes("bucket") && (msg.includes("not found") || msg.includes("does not exist"))) {
        return NextResponse.json(
          { error: "Storage-Bucket fehlt. Bitte Migration 015 ausführen." },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: "Download fehlgeschlagen: " + String(e) }, { status: 500 })
    }
  }

  if (doc.source === "google_drive" && doc.google_drive_file_id) {
    return NextResponse.redirect(getViewUrl(doc.google_drive_file_id))
  }

  if (doc.source === "external_url" && doc.google_drive_url) {
    return NextResponse.redirect(doc.google_drive_url)
  }

  return NextResponse.json({ error: "No downloadable URL" }, { status: 422 })
}

// PATCH /api/documents/[id] — update visible_to_customer
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json() as { visible_to_customer?: boolean }
  if (typeof body.visible_to_customer !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("customer_documents")
    .update({ visible_to_customer: body.visible_to_customer })
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/documents/[id] — remove storage object + DB record
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: doc } = await admin
    .from("customer_documents")
    .select("source, storage_path")
    .eq("id", id)
    .single()

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Delete storage file first (if applicable)
  if (doc.source === "supabase_storage" && doc.storage_path) {
    await deleteFromStorage(doc.storage_path)
  }

  // Delete DB record
  await admin.from("customer_documents").delete().eq("id", id)

  return NextResponse.json({ ok: true })
}
