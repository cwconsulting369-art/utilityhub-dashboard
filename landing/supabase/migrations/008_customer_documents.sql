CREATE TABLE IF NOT EXISTS public.customer_documents (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id           UUID        NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  uploaded_by           UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  name                  TEXT        NOT NULL,
  description           TEXT,

  -- Herkunft des Dokuments
  source                TEXT        NOT NULL DEFAULT 'supabase_storage',

  -- Supabase Storage (nur wenn source = 'supabase_storage')
  storage_path          TEXT,

  -- Google Drive (nur wenn source = 'google_drive')
  google_drive_file_id  TEXT,
  google_drive_url      TEXT,

  -- Gemeinsame Metadaten
  mime_type             TEXT,
  size_bytes            INTEGER,
  visible_to_customer   BOOLEAN     NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT customer_documents_source_check
    CHECK (source IN ('supabase_storage', 'google_drive', 'external_url')),
  CONSTRAINT customer_documents_storage_integrity CHECK (
    (source = 'supabase_storage' AND storage_path         IS NOT NULL) OR
    (source = 'google_drive'     AND google_drive_file_id IS NOT NULL) OR
    (source = 'external_url')
  )
);

COMMENT ON TABLE  public.customer_documents                      IS 'Dokumente: Supabase Storage oder Google Drive';
COMMENT ON COLUMN public.customer_documents.source               IS 'supabase_storage | google_drive | external_url';
COMMENT ON COLUMN public.customer_documents.visible_to_customer  IS 'true = im Kundenportal sichtbar';
