-- 029_document_assigned.sql
-- Adds an `assigned` flag to customer_documents. Documents start as
-- unassigned (assigned=false → "Eingang"). Once an admin/staff routes
-- them to a customer or to the org's Hauptordner, assigned flips to true.

ALTER TABLE public.customer_documents
  ADD COLUMN IF NOT EXISTS assigned BOOLEAN NOT NULL DEFAULT false;

-- All existing documents start as unassigned (Eingang).
-- NOT NULL DEFAULT false already backfills; this is belt-and-suspenders.
UPDATE public.customer_documents
   SET assigned = false
 WHERE assigned IS DISTINCT FROM false;

-- Partial index for the sidebar Eingang badge / Eingang section query.
CREATE INDEX IF NOT EXISTS customer_documents_assigned_idx
  ON public.customer_documents (assigned)
  WHERE assigned = false;
