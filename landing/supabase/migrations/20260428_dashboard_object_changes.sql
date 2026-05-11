-- Migration: Add building_manager, property_type, address_display to customers
-- Fully idempotent (ADD COLUMN IF NOT EXISTS)

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS building_manager TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS property_type    TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS address_display  TEXT;

COMMENT ON COLUMN public.customers.building_manager IS 'Zugeordneter Verwalter (Hausverwaltung)';
COMMENT ON COLUMN public.customers.property_type    IS 'Objekttyp: WEG, Wohngebäude, Gewerbe, Sonstige';
COMMENT ON COLUMN public.customers.address_display  IS 'Anzeigeadresse des Objekts';
