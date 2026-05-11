-- ── 016_organizations.sql ────────────────────────────────────────────────────
-- Introduces the Organization / Object hierarchy.
--
-- Adds:
--   organizations       — new table for Hausverwaltungen / Bestandshalter
--   customers.organization_id — FK to organizations (nullable, ON DELETE SET NULL)
--   customers.object_type     — WEG | MFH | EFH | Gewerbe | Sonstige (nullable)
--
-- Backfills:
--   customers.object_type = 'weg' for all customers that have a customer_identities
--   row with system = 'weg' (Notion-imported WEG objects).
--
-- RLS: admin = full, staff = read only (same pattern as other tables).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── New table: organizations ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.organizations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  org_type     TEXT,
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  city         TEXT,
  postal_code  TEXT,
  country      TEXT        NOT NULL DEFAULT 'DE',
  status       TEXT        NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT organizations_status_check
    CHECK (status IN ('active', 'inactive')),
  CONSTRAINT organizations_org_type_check
    CHECK (org_type IN ('hausverwaltung', 'bestandshalter', 'privat', 'sonstige') OR org_type IS NULL)
);

COMMENT ON TABLE  public.organizations          IS 'Übergeordnete Organisationsebene: Hausverwaltungen, Bestandshalter, etc.';
COMMENT ON COLUMN public.organizations.org_type IS 'hausverwaltung | bestandshalter | privat | sonstige';

-- ── Extend customers ─────────────────────────────────────────────────────────

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS object_type     TEXT;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_object_type_check
    CHECK (object_type IN ('weg', 'mfh', 'efh', 'gewerbe', 'sonstige') OR object_type IS NULL);

COMMENT ON COLUMN public.customers.organization_id IS 'FK zu organizations — übergeordnete Hausverwaltung / Bestandshalter';
COMMENT ON COLUMN public.customers.object_type     IS 'weg | mfh | efh | gewerbe | sonstige';

-- ── Indices ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_organizations_name          ON public.organizations(name);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id   ON public.customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_object_type       ON public.customers(object_type);

-- ── Backfill: WEG objects ─────────────────────────────────────────────────────
-- Any customer with a customer_identities row system='weg' is a WEG object
-- (imported from Notion with useWegIdentity: true). Set object_type='weg' now.

UPDATE public.customers c
SET    object_type = 'weg'
WHERE  c.object_type IS NULL
  AND  EXISTS (
    SELECT 1 FROM public.customer_identities ci
    WHERE  ci.customer_id = c.id
      AND  ci.system = 'weg'
  );

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations: admin full"
  ON public.organizations FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "organizations: staff read"
  ON public.organizations FOR SELECT
  USING (public.get_my_role() = 'staff');

-- ── updated_at trigger (same pattern as customers) ────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
