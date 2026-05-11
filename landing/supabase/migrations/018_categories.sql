-- Migration 018: Categories and customer_categories
--
-- Adds:
--   categories            — tag/label system with optional parent_id hierarchy and hex color
--   customer_categories   — M:N join between customers and categories
--
-- RLS: admin = full, staff = full on customer_categories, read-only on categories.

-- ── categories ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  parent_id  UUID        REFERENCES public.categories(id) ON DELETE SET NULL,
  color      TEXT        NOT NULL DEFAULT '#8b949e',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.categories           IS 'Kategorien/Tags für Kunden. parent_id = Oberkategorie.';
COMMENT ON COLUMN public.categories.color     IS 'Hex-Farbe für Badge-Anzeige, z.B. #3fb950';
COMMENT ON COLUMN public.categories.parent_id IS 'Nullable FK auf eigene Tabelle — max. 1 Hierarchieebene empfohlen';

-- ── customer_categories ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_categories (
  customer_id UUID        NOT NULL REFERENCES public.customers(id)  ON DELETE CASCADE,
  category_id UUID        NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, category_id)
);

COMMENT ON TABLE public.customer_categories IS 'Zuweisung von Kategorien zu Kunden (M:N)';

-- ── Indices ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_categories_parent_id
  ON public.categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_customer_categories_customer_id
  ON public.customer_categories(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_categories_category_id
  ON public.customer_categories(category_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_categories ENABLE ROW LEVEL SECURITY;

-- categories: admin full, staff read
DROP POLICY IF EXISTS "categories: admin full" ON public.categories;
CREATE POLICY "categories: admin full"
  ON public.categories FOR ALL
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "categories: staff read" ON public.categories;
CREATE POLICY "categories: staff read"
  ON public.categories FOR SELECT
  USING (public.get_my_role() = 'staff');

-- customer_categories: admin + staff full (both assign/remove categories)
DROP POLICY IF EXISTS "customer_categories: admin full" ON public.customer_categories;
CREATE POLICY "customer_categories: admin full"
  ON public.customer_categories FOR ALL
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "customer_categories: staff full" ON public.customer_categories;
CREATE POLICY "customer_categories: staff full"
  ON public.customer_categories FOR ALL
  USING (public.get_my_role() = 'staff');
