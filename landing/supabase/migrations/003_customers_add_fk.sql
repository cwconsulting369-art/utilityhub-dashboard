-- Add FK customers.assigned_to → profiles(id)
-- Deferred to 003 because profiles did not exist when customers was created in 001.

ALTER TABLE public.customers
  ADD CONSTRAINT fk_customers_assigned_to
  FOREIGN KEY (assigned_to)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

COMMENT ON COLUMN public.customers.assigned_to IS 'Zuständiger Mitarbeiter (staff oder admin)';
