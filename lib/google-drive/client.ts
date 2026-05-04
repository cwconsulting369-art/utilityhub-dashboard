/**
 * Google Drive client — service account authentication via JWT / Drive REST API v3.
 * No external packages required (uses Node.js built-in crypto + native fetch).
 *
 * Required env variables (add to .env.local):
 *   GOOGLE_SERVICE_ACCOUNT_JSON  — full JSON key from GCP service account
 *   GOOGLE_DRIVE_IMPORT_FOLDER_ID    — (optional) Drive folder ID for Teleson CSV imports
 *   GOOGLE_DRIVE_DOCUMENTS_FOLDER_ID — (optional) Drive folder ID for customer documents
 *
 * Setup steps (one-time):
 *   1. GCP Console → IAM → Service Accounts → Create → download JSON key
 *   2. Share the target Drive folder(s) with the service account email
 *   3. Set GOOGLE_SERVICE_ACCOUNT_JSON in .env.local (paste the entire JSON as one line)
 */

import { createPrivateKey, createSign } from "crypto"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ServiceAccountKey {
  client_email: string
  private_key:  string
}

export interface DriveFile {
  id:           string
  name:         string
  mimeType:     string
  size:         string | null
  modifiedTime: string
  webViewLink:  string | null
}

// ── Configuration ──────────────────────────────────────────────────────────────

export function isConfigured(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON
}

export const IMPORT_FOLDER_ID    = process.env.GOOGLE_DRIVE_IMPORT_FOLDER_ID    ?? null
export const DOCUMENTS_FOLDER_ID = process.env.GOOGLE_DRIVE_DOCUMENTS_FOLDER_ID ?? null

function loadKey(): ServiceAccountKey {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error(
    "Google Drive not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON in .env.local."
  )
  return JSON.parse(raw) as ServiceAccountKey
}

// ── Auth ───────────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const key = loadKey()
  const now = Math.floor(Date.now() / 1000)

  const header  = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
  const payload = Buffer.from(JSON.stringify({
    iss:   key.client_email,
    scope: "https://www.googleapis.com/auth/drive",
    aud:   "https://oauth2.googleapis.com/token",
    iat:   now,
    exp:   now + 3600,
  })).toString("base64url")

  const signing = `${header}.${payload}`
  const signer  = createSign("RSA-SHA256")
  signer.update(signing)
  const sig = signer.sign(createPrivateKey(key.private_key)).toString("base64url")

  const res  = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion:  `${signing}.${sig}`,
    }),
  })
  const data = await res.json() as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error("Drive auth failed: " + (data.error ?? "unknown"))
  return data.access_token
}

// ── Drive API calls ────────────────────────────────────────────────────────────

/** List files in a Drive folder (max 200). Useful for listing Teleson CSV exports. */
export async function listFiles(folderId: string): Promise<DriveFile[]> {
  const token = await getAccessToken()
  const q      = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
  const fields = encodeURIComponent("files(id,name,mimeType,size,modifiedTime,webViewLink)")

  const res  = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=200`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json() as { files?: DriveFile[]; error?: unknown }
  if (!res.ok) throw new Error("Drive listFiles: " + JSON.stringify(data.error))
  return data.files ?? []
}

/**
 * Download a Drive file as ArrayBuffer.
 * Pass directly to parseCsv() for CSV imports or to uploadToStorage() for PDF mirroring.
 */
export async function downloadFile(fileId: string): Promise<ArrayBuffer> {
  const token = await getAccessToken()
  const res   = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Drive download failed: ${res.status} ${res.statusText}`)
  return res.arrayBuffer()
}

/**
 * Upload a file to a Drive folder. Returns the Drive file ID.
 * Use for mirroring customer documents to Drive (when DOCUMENTS_FOLDER_ID is set).
 */
export async function uploadFile(
  name:     string,
  buffer:   ArrayBuffer,
  mimeType: string,
  folderId: string,
): Promise<string> {
  const token    = await getAccessToken()
  const boundary = "---utilityhub_boundary_" + Date.now()

  const metaPart = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify({ name, parents: [folderId] }),
  ].join("\r\n")

  const filePart = `\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`
  const ending   = `\r\n--${boundary}--`

  const enc       = new TextEncoder()
  const metaBytes = enc.encode(metaPart)
  const fileBytes = enc.encode(filePart)
  const fileData  = new Uint8Array(buffer)
  const endBytes  = enc.encode(ending)

  const body = new Uint8Array(metaBytes.length + fileBytes.length + fileData.length + endBytes.length)
  let offset = 0
  for (const chunk of [metaBytes, fileBytes, fileData, endBytes]) {
    body.set(chunk, offset); offset += chunk.length
  }

  const res  = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  )
  const data = await res.json() as { id?: string; error?: unknown }
  if (!data.id) throw new Error("Drive upload failed: " + JSON.stringify(data.error))
  return data.id
}

/** Returns the standard Google Drive view URL for a file. */
export function getViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}
