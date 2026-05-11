-- Migration 028: Portal sees ALL documents of its organization
-- Removes the visible_to_customer filter from the org-level read policy
-- so portal users see Hauptordner uploads and all org-level documents,
-- not just admin-released ones.

DROP POLICY IF EXISTS "customer_documents: customer read org visible" ON public.customer_documents;
DROP POLICY IF EXISTS "customer_documents: customer read org"         ON public.customer_documents;

CREATE POLICY "customer_documents: customer read org"
  ON public.customer_documents FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE organization_id IS NOT NULL
        AND organization_id = public.get_my_org_id()
    )
  );
