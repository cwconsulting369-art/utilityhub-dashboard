-- Migration 020: Match Review Queue
--
-- Adds:
--   match_review_queue — holds unconfirmed/uncertain matches from any source system
--
-- Purpose:
--   When n8n (or a future import pipeline) encounters a new record that cannot
--   be confidently matched to an existing customer, it writes a row here instead
--   of creating a duplicate customer. A staff member then reviews and accepts,
--   rejects, or merges the match.
--
-- Idempotent: yes
-- Dependencies: 001_customers_base.sql, 002_profiles.sql

CREATE TABLE IF NOT EXISTS public.match_review_queue (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Where did this unmatched record come from?
  source_system        TEXT        NOT NULL,
  source_record_id     TEXT        NOT NULL,

  -- Best-candidate match (NULL if no candidate found at all)
  proposed_customer_id UUID        REFERENCES public.customers(id) ON DELETE SET NULL,

  -- How confident is the match algorithm? 0.0–1.0
  match_score          NUMERIC(4,3),
  -- Why did the algorithm suggest this match? e.g. ['name_fuzzy','city_match','malo_exact']
  match_reason         TEXT[],

  -- Lifecycle
  status               TEXT        NOT NULL DEFAULT 'pending',

  -- Full original payload from source — preserved for review and potential re-import
  raw_data             JSONB,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Review outcome
  reviewed_by          UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at          TIMESTAMPTZ,
  review_note          TEXT,

  CONSTRAINT match_review_queue_source_system_check
    CHECK (source_system IN ('notion', 'fg_finanz', 'manual')),
  CONSTRAINT match_review_queue_status_check
    CHECK (status IN ('pending', 'accepted', 'rejected', 'merged')),
  CONSTRAINT match_review_queue_score_check
    CHECK (match_score IS NULL OR (match_score >= 0 AND match_score <= 1))
);

COMMENT ON TABLE  public.match_review_queue                       IS 'Unbestätigte / unsichere Matches aus Quellsystemen — warten auf manuelle Prüfung';
COMMENT ON COLUMN public.match_review_queue.source_system         IS 'notion | fg_finanz | manual';
COMMENT ON COLUMN public.match_review_queue.source_record_id      IS 'ID im Quellsystem (Notion-Page-ID, FG-Finanz-Vertrags-ID, …)';
COMMENT ON COLUMN public.match_review_queue.proposed_customer_id  IS 'Bester Kandidat aus der matching-Logik — kann NULL sein';
COMMENT ON COLUMN public.match_review_queue.match_score           IS '0.0–1.0 — Konfidenz des Matches. Schwelle für Auto-Match: ≥ 0.85';
COMMENT ON COLUMN public.match_review_queue.match_reason          IS 'Array der Matching-Gründe, z. B. name_fuzzy, malo_exact, city_match';
COMMENT ON COLUMN public.match_review_queue.raw_data              IS 'Vollständige Originaldaten aus dem Quellsystem — für Review und Re-Import';
COMMENT ON COLUMN public.match_review_queue.review_note           IS 'Optionale Begründung des Reviewers';

CREATE INDEX IF NOT EXISTS idx_match_review_queue_status
  ON public.match_review_queue(status);

CREATE INDEX IF NOT EXISTS idx_match_review_queue_source_system
  ON public.match_review_queue(source_system);

CREATE INDEX IF NOT EXISTS idx_match_review_queue_proposed_customer_id
  ON public.match_review_queue(proposed_customer_id);

CREATE INDEX IF NOT EXISTS idx_match_review_queue_created_at
  ON public.match_review_queue(created_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.match_review_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_review_queue: admin full"  ON public.match_review_queue;
CREATE POLICY "match_review_queue: admin full"
  ON public.match_review_queue FOR ALL
  USING (public.get_my_role() = 'admin');

-- Staff can read all pending items and update status/review fields
DROP POLICY IF EXISTS "match_review_queue: staff read"  ON public.match_review_queue;
CREATE POLICY "match_review_queue: staff read"
  ON public.match_review_queue FOR SELECT
  USING (public.get_my_role() = 'staff');

DROP POLICY IF EXISTS "match_review_queue: staff update"  ON public.match_review_queue;
CREATE POLICY "match_review_queue: staff update"
  ON public.match_review_queue FOR UPDATE
  USING (public.get_my_role() = 'staff');
