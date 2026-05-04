import { NextRequest, NextResponse } from "next/server"
import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { uploadToStorage, MAX_FILE_BYTES } from "@/lib/documents/storage"

export async function POST(request: NextRequest) {
  // Auth — admin or staff only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Parse FormData
  const formData   = await request.formData().catch(() => null)
  if (!formData)   return NextResponse.json({ error: "Invalid FormData" }, { status: 400 })

  const file              = formData.get("file") as File | null
  const customerId        = formData.get("customer_id") as string | null
  const titleInput        = (formData.get("title") as string | null)?.trim() || null
  const docType           = (formData.get("doc_type") as string | null)?.trim() || null
  const visibleRaw        = formData.get("visible_to_customer")
  const visibleToCustomer = visibleRaw === "true" || visibleRaw === "1"

  const VALID_DOC_TYPES = ["vertrag", "rechnung", "vollmacht", "protokoll", "sonstiges"]
  const safeDocType = docType && VALID_DOC_TYPES.includes(docType) ? docType : null

  if (!file)       return NextResponse.json({ error: "Missing 'file'" }, { status: 400 })
  if (!customerId) return NextResponse.json({ error: "Missing 'customer_id'" }, { status: 400 })
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_FILE_BYTES / 1024 / 1024} MB)` },
      { status: 400 }
    )
  }

  // Verify customer exists
  const admin = createAdminClient()
  const { data: customer } = await admin
    .from("customers").select("id").eq("id", customerId).single()
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

  // Upload to Supabase Storage
  const buffer   = await file.arrayBuffer()
  const mimeType = file.type || "application/octet-stream"
  let storagePath: string
  try {
    storagePath = await uploadToStorage(buffer, file.name, mimeType, customerId)
  } catch (e) {
    const msg = String(e).toLowerCase()
    if (msg.includes("bucket") && (msg.includes("not found") || msg.includes("does not exist"))) {
      return NextResponse.json(
        { error: "Storage-Bucket fehlt. Bitte Migration 015 (015_storage_bucket.sql) im Supabase SQL-Editor ausführen." },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: "Upload fehlgeschlagen: " + String(e) }, { status: 500 })
  }

  // Insert into customer_documents
  const { data: doc, error: dbErr } = await admin
    .from("customer_documents")
    .insert({
      customer_id:         customerId,
      uploaded_by:         user.id,
      name:                file.name,          // original filename — always preserved
      title:               titleInput,         // optional human-readable label
      doc_type:            safeDocType,
      source:              "supabase_storage",
      storage_path:        storagePath,
      mime_type:           mimeType,
      size_bytes:          file.size,
      visible_to_customer: visibleToCustomer,
    })
    .select("id, name, title, doc_type, mime_type, size_bytes, created_at, visible_to_customer")
    .single()

  if (dbErr) {
    return NextResponse.json({ error: "DB insert failed: " + dbErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, document: doc })
}
