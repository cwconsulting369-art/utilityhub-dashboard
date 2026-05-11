-- Append-only table — no UPDATE or DELETE allowed (enforced via RLS in 012)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action     TEXT        NOT NULL,
  table_name TEXT        NOT NULL,
  record_id  UUID,
  old_data   JSONB,
  new_data   JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT audit_logs_action_check CHECK (
    action IN (
      'created', 'updated', 'deleted',
      'imported', 'viewed',
      'portal_login', 'portal_logout'
    )
  )
);

COMMENT ON TABLE public.audit_logs IS 'Unveränderliches Audit-Log — nur INSERT erlaubt (per RLS)';
