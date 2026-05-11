-- Migration 019: Notion ↔ Supabase Sync Foundation
--
-- Adds:
--   teleson_records  — 5 new sync-tracking columns (all nullable, idempotent)
--   notion_sync_state — new table, one row per Notion page, tracks sync state
--
-- Idempotent: yes (ADD COLUMN IF NOT EXISTS, DO-blocks for constraints,
--             DROP POLICY IF EXISTS before CREATE POLICY)
-- Dependencies: 006_teleson_records.sql, 001_customers_base.sql

-- ── 1. Extend teleson_records with sync fields ────────────────────────────────

ALTER TABLE public.teleson_records
  ADD COLUMN IF NOT EXISTS notion_page_id        TEXT,
  ADD COLUMN IF NOT EXISTS notion_last_edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_synced_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_status           TEXT,
  ADD COLUMN IF NOT EXISTS sync_hash             TEXT;

COMMENT ON COLUMN public.teleson_records.notion_page_id        IS 'Notion-Page-ID — eindeutig, Link zurück zur Quelle';
COMMENT ON COLUMN public.teleson_records.notion_last_edited_at IS 'Zeitstempel der letzten Bearbeitung laut Notion';
COMMENT ON COLUMN public.teleson_records.last_synced_at        IS 'Wann n8n diesen Datensatz zuletzt synchronisiert hat';
COMMENT ON COLUMN public.teleson_records.sync_status           IS 'synced | pending | conflict | error';
COMMENT ON COLUMN public.teleson_records.sync_hash             IS 'SHA256 der letzten synced Notion-Payload — für Änderungserkennung';

-- UNIQUE on notion_page_id (idempotent via DO-block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teleson_records_notion_page_id_key'
      AND conrelid = 'public.teleson_records'::regclass
  ) THEN
    ALTER TABLE public.teleson_records
      ADD CONSTRAINT teleson_records_notion_page_id_key UNIQUE (notion_page_id);
  END IF;
END $$;

-- CHECK on sync_status (idempotent via DO-block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teleson_records_sync_status_check'
      AND conrelid = 'public.teleson_records'::regclass
  ) THEN
    ALTER TABLE public.teleson_records
      ADD CONSTRAINT teleson_records_sync_status_check
        CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error') OR sync_status IS NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teleson_records_notion_page_id
  ON public.teleson_records(notion_page_id);

CREATE INDEX IF NOT EXISTS idx_teleson_records_sync_status
  ON public.teleson_records(sync_status);

-- ── 2. notion_sync_state — one row per Notion page ────────────────────────────
--
-- This table is the authoritative sync-state tracker.
-- It is separate from teleson_records so it can exist even before
-- a match is confirmed (status = 'pending' with no customer_id yet).

CREATE TABLE IF NOT EXISTS public.notion_sync_state (
  notion_page_id        TEXT        PRIMARY KEY,
  customer_id           UUID        REFERENCES public.customers(id)      ON DELETE SET NULL,
  teleson_record_id     UUID        REFERENCES public.teleson_records(id) ON DELETE SET NULL,
  notion_last_edited_at TIMESTAMPTZ,
  last_synced_at        TIMESTAMPTZ,
  sync_status           TEXT        NOT NULL DEFAULT 'pending',
  conflict_detail       JSONB,
  sync_hash             TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT notion_sync_state_sync_status_check
    CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error'))
);

COMMENT ON TABLE  public.notion_sync_state                         IS 'Sync-State pro Notion-Page. Existiert auch wenn noch kein Match bestätigt ist.';
COMMENT ON COLUMN public.notion_sync_state.notion_page_id         IS 'Notion-Page-ID (Primary Key)';
COMMENT ON COLUMN public.notion_sync_state.customer_id            IS 'NULL solange kein Match bestätigt wurde';
COMMENT ON COLUMN public.notion_sync_state.teleson_record_id      IS 'NULL solange kein Match bestätigt wurde';
COMMENT ON COLUMN public.notion_sync_state.conflict_detail        IS 'JSONB: welches Feld, welcher Wert, von wann — nur befüllt wenn sync_status=conflict';
COMMENT ON COLUMN public.notion_sync_state.sync_hash              IS 'SHA256 der letzten synced Notion-Felder';

CREATE INDEX IF NOT EXISTS idx_notion_sync_state_customer_id
  ON public.notion_sync_state(customer_id);

CREATE INDEX IF NOT EXISTS idx_notion_sync_state_sync_status
  ON public.notion_sync_state(sync_status);

-- updated_at trigger
CREATE OR REPLACE TRIGGER trg_notion_sync_state_updated_at
  BEFORE UPDATE ON public.notion_sync_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.notion_sync_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notion_sync_state: admin full"  ON public.notion_sync_state;
CREATE POLICY "notion_sync_state: admin full"
  ON public.notion_sync_state FOR ALL
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "notion_sync_state: staff read"  ON public.notion_sync_state;
CREATE POLICY "notion_sync_state: staff read"
  ON public.notion_sync_state FOR SELECT
  USING (public.get_my_role() = 'staff');

-- n8n uses the service-role key and bypasses RLS — no policy needed for it.
