-- profiles table — extends auth.users, references customers (now safe, customers exists)

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT        NOT NULL DEFAULT 'customer',
  customer_id UUID        REFERENCES public.customers(id) ON DELETE SET NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'staff', 'customer'))
);

COMMENT ON TABLE  public.profiles             IS 'Erweiterung von auth.users — Rolle und Kundenzuordnung';
COMMENT ON COLUMN public.profiles.role        IS 'admin | staff | customer';
COMMENT ON COLUMN public.profiles.customer_id IS 'Nur bei role=customer: Verweis auf customers(id). Nullable.';
