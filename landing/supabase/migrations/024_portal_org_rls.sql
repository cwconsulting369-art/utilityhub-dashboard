-- Migration 024: Portal — organization-based RLS for customer role
--
-- Adds:
--   public.get_my_org_id() helper
--   "customer read org" SELECT policies on:
--     - customers
--     - customer_identities
--     - teleson_records
--     - customer_documents (still respects visible_to_customer)
--     - upsell_opportunities
--     - organizations
--
-- Effect:
--   Customer-role users with profiles.organization_id set can read ALL
--   customers (and related rows) belonging to that organization — IN ADDITION
--   to their own customer_id row (existing policies remain).
--
-- Notes:
--   - All new policies are SELECT-only. No write paths added.
--   - customer_documents keeps the visible_to_customer = true filter.
--   - get_my_org_id() returns NULL if the profile has no organization_id;
--     since `col = NULL` is FALSE in SQL, users without an org assignment
--     still see no extra rows.
--
-- Idempotent: yes
--   - CREATE OR REPLACE for the helper function
--   - DROP POLICY IF EXISTS before each CREATE POLICY
--   - CREATE INDEX IF NOT EXISTS
--
-- Dependencies: 012_rls_policies.sql, 016_organizations.sql, 023_profiles_organization.sql

-- ── Helper ──────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

COMMENT ON FUNCTION public.get_my_org_id()
  IS 'Returns organization_id of the current authenticated user from profiles. NULL if not assigned. Used by org-scoped customer-role RLS policies.';

-- ── customers ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "customers: customer read org" ON public.customers;
CREATE POLICY "customers: customer read org"
  ON public.customers FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND organization_id = public.get_my_org_id()
  );

-- ── customer_identities ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "customer_identities: customer read org" ON public.customer_identities;
CREATE POLICY "customer_identities: customer read org"
  ON public.customer_identities FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE organization_id IS NOT NULL
        AND organization_id = public.get_my_org_id()
    )
  );

-- ── teleson_records ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "teleson_records: customer read org" ON public.teleson_records;
CREATE POLICY "teleson_records: customer read org"
  ON public.teleson_records FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE organization_id IS NOT NULL
        AND organization_id = public.get_my_org_id()
    )
  );

-- ── customer_documents ─────────────────────────────────────────────────────
-- Still respects visible_to_customer — internal documents remain hidden.

DROP POLICY IF EXISTS "customer_documents: customer read org visible" ON public.customer_documents;
CREATE POLICY "customer_documents: customer read org visible"
  ON public.customer_documents FOR SELECT
  USING (
    visible_to_customer = true
    AND customer_id IN (
      SELECT id FROM public.customers
      WHERE organization_id IS NOT NULL
        AND organization_id = public.get_my_org_id()
    )
  );

-- ── upsell_opportunities ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "upsell_opportunities: customer read org" ON public.upsell_opportunities;
CREATE POLICY "upsell_opportunities: customer read org"
  ON public.upsell_opportunities FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE organization_id IS NOT NULL
        AND organization_id = public.get_my_org_id()
    )
  );

-- ── organizations ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "organizations: customer read own" ON public.organizations;
CREATE POLICY "organizations: customer read own"
  ON public.organizations FOR SELECT
  USING (id = public.get_my_org_id());

-- ── Index to support the IN-subquery checks ────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_customers_organization_id
  ON public.customers(organization_id);
