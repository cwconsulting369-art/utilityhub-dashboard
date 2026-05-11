-- Migration 015: Supabase Storage bucket for customer documents
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → paste this file → Run
--   (or: supabase db push, if using Supabase CLI with linked project)
--
-- WHAT BECOMES LIVE AFTER EXECUTION:
--   • POST /api/documents/upload  — Mitarbeiter können PDFs, Bilder, Word- und
--     Excel-Dateien zu Kunden hochladen (max 50 MB). Dateien landen im privaten
--     Bucket "customer-documents", Metadaten in customer_documents.
--   • GET  /api/documents/[id]    — Auth-gesicherter Download via 1h Signed URL.
--   • DELETE /api/documents/[id] — Löscht Datei aus Storage + DB-Eintrag.
--   • Dokumente-Sektion auf /app/customers/[id] wird vollständig funktionsfähig.
--
-- OHNE DIESE MIGRATION:
--   Upload-Versuche liefern HTTP 503 mit dem Hinweis "Storage-Bucket fehlt".
--   Bestehende app-Logik ist vollständig vorbereitet — nur der Bucket fehlt.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-documents',
  'customer-documents',
  false,
  52428800, -- 50 MB
  ARRAY[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS (server routes use service-role which bypasses these;
-- policies are for potential future direct client access)

DROP POLICY IF EXISTS "documents storage: authenticated read" ON storage.objects;
CREATE POLICY "documents storage: authenticated read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'customer-documents');

DROP POLICY IF EXISTS "documents storage: authenticated insert" ON storage.objects;
CREATE POLICY "documents storage: authenticated insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'customer-documents');

DROP POLICY IF EXISTS "documents storage: authenticated delete" ON storage.objects;
CREATE POLICY "documents storage: authenticated delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'customer-documents');
