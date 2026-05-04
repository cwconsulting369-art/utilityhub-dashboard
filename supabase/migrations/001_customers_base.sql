-- customers table (no FK on assigned_to yet — resolved in 003_customers_add_fk.sql)
-- Created first to break the circular dependency with profiles.customer_id

CREATE TABLE IF NOT EXISTS public.customers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT        NOT NULL,
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  city         TEXT,
  postal_code  TEXT,
  country      TEXT        NOT NULL DEFAULT 'DE',
  status       TEXT        NOT NULL DEFAULT 'active',
  source       TEXT,
  assigned_to  UUID,       -- FK added in 003_customers_add_fk.sql
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT customers_status_check
    CHECK (status IN ('active', 'inactive', 'blocked')),
  CONSTRAINT customers_source_check
    CHECK (source IN ('teleson', 'fg_finanz', 'manual') OR source IS NULL)
);

COMMENT ON TABLE  public.customers             IS 'Kundenstammdaten (B2B/B2C)';
COMMENT ON COLUMN public.customers.source      IS 'Ursprung: teleson | fg_finanz | manual';
COMMENT ON COLUMN public.customers.assigned_to IS 'FK zu profiles(id) — wird in Migration 003 ergänzt';
