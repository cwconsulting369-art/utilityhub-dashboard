CREATE TABLE IF NOT EXISTS public.upsell_opportunities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID        NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  assigned_to UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  status      TEXT        NOT NULL DEFAULT 'open',
  priority    TEXT        NOT NULL DEFAULT 'medium',
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT upsell_status_check
    CHECK (status IN ('open', 'in_progress', 'won', 'lost')),
  CONSTRAINT upsell_priority_check
    CHECK (priority IN ('low', 'medium', 'high'))
);

COMMENT ON TABLE public.upsell_opportunities IS 'Upsell-Chancen pro Kunde';
