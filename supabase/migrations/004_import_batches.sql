CREATE TABLE IF NOT EXISTS public.import_batches (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source         TEXT        NOT NULL,
  filename       TEXT,
  total_rows     INTEGER     NOT NULL DEFAULT 0,
  processed_rows INTEGER     NOT NULL DEFAULT 0,
  error_rows     INTEGER     NOT NULL DEFAULT 0,
  status         TEXT        NOT NULL DEFAULT 'pending',
  imported_by    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ,
  error_log      JSONB,

  CONSTRAINT import_batches_source_check
    CHECK (source IN ('teleson', 'fg_finanz', 'manual')),
  CONSTRAINT import_batches_status_check
    CHECK (status IN ('pending', 'processing', 'done', 'failed'))
);

COMMENT ON TABLE public.import_batches IS 'Tracking aller CSV-Datenimporte nach Quelle';
