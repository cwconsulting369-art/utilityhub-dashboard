-- Migration 031: Airtable ↔ Supabase Sync Foundation
--
-- Adds:
--   teleson_records     — airtable_record_id column
--   airtable_sync_state — one row per Airtable record, tracks sync state
--
-- Idempotent: yes

-- ── 1. Extend teleson_records ─────────────────────────────────────────────────

ALTER TABLE public.teleson_records
  ADD COLUMN IF NOT EXISTS airtable_record_id           TEXT,
  ADD COLUMN IF NOT EXISTS airtable_last_modified_time  TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teleson_records_airtable_record_id_key'
      AND conrelid = 'public.teleson_records'::regclass
  ) THEN
    ALTER TABLE public.teleson_records
      ADD CONSTRAINT teleson_records_airtable_record_id_key UNIQUE (airtable_record_id);
  END IF;
END $$;

-- ── 2. airtable_sync_state table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.airtable_sync_state (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_record_id          TEXT        NOT NULL UNIQUE,
  customer_id                 UUID        REFERENCES public.customers(id) ON DELETE SET NULL,
  teleson_record_id           UUID        REFERENCES public.teleson_records(id) ON DELETE SET NULL,
  airtable_last_modified_time TIMESTAMPTZ,
  last_synced_at              TIMESTAMPTZ,
  sync_status                 TEXT        NOT NULL DEFAULT 'synced'
                              CHECK (sync_status IN ('synced','pending','conflict','error')),
  sync_hash                   TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.airtable_sync_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "airtable_sync_admin_all" ON public.airtable_sync_state;
CREATE POLICY "airtable_sync_admin_all"
  ON public.airtable_sync_state
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );
