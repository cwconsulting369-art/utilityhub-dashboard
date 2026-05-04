import { createAdminClient } from "@/lib/supabase/admin"

export const DOCUMENTS_BUCKET = "customer-documents"
export const MAX_FILE_BYTES   = 50 * 1024 * 1024  // 50 MB

/**
 * Upload a file buffer to Supabase Storage.
 * Returns the storagePath used as the DB reference.
 * Path format: {customerId}/{timestamp}-{sanitizedFilename}
 */
export async function uploadToStorage(
  buffer:     ArrayBuffer,
  filename:   string,
  mimeType:   string,
  customerId: string,
): Promise<string> {
  const admin    = createAdminClient()
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
  const path     = `${customerId}/${Date.now()}-${safeName}`

  const { error } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false })

  if (error) throw new Error("Storage upload: " + error.message)
  return path
}

/**
 * Generate a short-lived signed URL for a private storage object.
 * Default: 1 hour expiry.
 */
export async function createSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error || !data?.signedUrl) throw new Error("SignedURL: " + error?.message)
  return data.signedUrl
}

/** Remove a file from storage. Call before deleting the DB record. */
export async function deleteFromStorage(storagePath: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.storage.from(DOCUMENTS_BUCKET).remove([storagePath])
  if (error) throw new Error("Storage delete: " + error.message)
}

/** Human-readable file size (e.g. "1.4 MB"). */
export function formatBytes(bytes: number | null): string {
  if (!bytes) return "—"
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
