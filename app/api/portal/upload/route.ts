import { NextRequest, NextResponse } from "next/server"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { uploadToStorage, MAX_FILE_BYTES } from "@/lib/documents/storage"

// Portal-Schnell-Upload: erlaubt customer-Rolle, weist Dokument automatisch
// dem eigenen customer_id zu, setzt visible_to_customer=false (Internal-Review).

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, customer_id")
    .eq("id", user.id)
    .single()
  if (!profile || profile.role !== "customer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!profile.customer_id) {
    return NextResponse.json(
      { error: "Ihrem Konto ist noch kein Objekt zugeordnet. Bitte wenden Sie sich an den Support." },
      { status: 400 }
    )
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: "Invalid FormData" }, { status: 400 })

  const file       = formData.get("file") as File | null
  const titleInput = (formData.get("title") as string | null)?.trim() || null
  if (!file) return NextResponse.json({ error: "Bitte eine Datei wählen." }, { status: 400 })
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `Datei zu groß (max. ${MAX_FILE_BYTES / 1024 / 1024} MB).` },
      { status: 400 }
    )
  }

  const customerId = profile.customer_id
  const buffer     = await file.arrayBuffer()
  const mimeType   = file.type || "application/octet-stream"

  let storagePath: string
  try {
    storagePath = await uploadToStorage(buffer, file.name, mimeType, customerId)
  } catch (e) {
    const msg = String(e).toLowerCase()
    if (msg.includes("bucket") && (msg.includes("not found") || msg.includes("does not exist"))) {
      return NextResponse.json(
        { error: "Storage-Bucket fehlt — bitte Support kontaktieren." },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: "Upload fehlgeschlagen: " + String(e) }, { status: 500 })
  }

  const admin = createAdminClient()
  const { error: dbErr } = await admin
    .from("customer_documents")
    .insert({
      customer_id:         customerId,
      uploaded_by:         user.id,
      name:                file.name,
      description:         titleInput,  // user-supplied title stored as description (no `title` column)
      source:              "supabase_storage",
      storage_path:        storagePath,
      mime_type:           mimeType,
      size_bytes:          file.size,
      visible_to_customer: false,  // Internal-Review erforderlich
      assigned:            false,  // landet im Eingang, bis ein Admin es zuweist
    })

  if (dbErr) {
    return NextResponse.json({ error: "Speichern fehlgeschlagen: " + dbErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
