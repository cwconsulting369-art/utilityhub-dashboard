-- ── 022_contacts.sql ─────────────────────────────────────────────────────────
-- Introduces the contacts table for Ansprechpartner at organizations/customers.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.contacts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        REFERENCES public.organizations(id) ON DELETE SET NULL,
  customer_id     UUID        REFERENCES public.customers(id)     ON DELETE SET NULL,
  full_name       TEXT        NOT NULL,
  role            TEXT,
  email           TEXT,
  phone           TEXT,
  photo_url       TEXT,
  calendly_url    TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.contacts                 IS 'Ansprechpartner für Hausverwaltungen und Objekte';
COMMENT ON COLUMN public.contacts.organization_id IS 'FK zu organizations — zugehörige Hausverwaltung';
COMMENT ON COLUMN public.contacts.customer_id     IS 'FK zu customers — direkt zugeordnetes Objekt (optional)';
COMMENT ON COLUMN public.contacts.role            IS 'z.B. Objektbetreuer, Geschäftsführer, Buchhalter';
COMMENT ON COLUMN public.contacts.calendly_url    IS 'Direktlink zum Kalenderbuchungssystem';

-- ── Indices ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON public.contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_customer_id     ON public.contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contacts_full_name       ON public.contacts(full_name);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts: admin full"
  ON public.contacts FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "contacts: staff read"
  ON public.contacts FOR SELECT
  USING (public.get_my_role() = 'staff');

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
