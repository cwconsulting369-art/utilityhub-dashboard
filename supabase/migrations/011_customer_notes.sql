CREATE TABLE IF NOT EXISTS public.customer_notes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID        NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  author_id   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  content     TEXT        NOT NULL,
  is_internal BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.customer_notes             IS 'Notizen zu Kunden';
COMMENT ON COLUMN public.customer_notes.is_internal IS 'true = nur intern sichtbar; false = im Kundenportal sichtbar';
