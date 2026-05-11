CREATE TABLE IF NOT EXISTS public.customer_identities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID        NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  system      TEXT        NOT NULL,
  external_id TEXT        NOT NULL,
  label       TEXT,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (system, external_id)
);

COMMENT ON TABLE  public.customer_identities             IS 'Externe System-IDs eines Kunden (teleson, fg_finanz, malo, knr, …)';
COMMENT ON COLUMN public.customer_identities.system      IS 'System-Bezeichner: teleson | fg_finanz | malo | knr | internal';
COMMENT ON COLUMN public.customer_identities.external_id IS 'ID im externen System';
