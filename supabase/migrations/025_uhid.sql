-- Migration 025: UtilityHub-IDs (UHIDs)
--
-- Adds:
--   organizations.uhid  — TEXT UNIQUE NOT NULL, format HV-XXXXX
--   customers.uhid      — TEXT UNIQUE NOT NULL, format OBJ-XXXXX
--
-- Auto-assigned by BEFORE INSERT triggers using dedicated sequences.
-- Existing rows are backfilled chronologically by created_at.
--
-- Idempotent: yes (IF NOT EXISTS, DROP+CREATE for triggers, COALESCE in backfill).
-- Dependencies: 001_customers_base.sql, 016_organizations.sql

-- ── 1. Sequences ────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.org_uhid_seq      START 1;
CREATE SEQUENCE IF NOT EXISTS public.customer_uhid_seq START 1;

-- ── 2. Columns ──────────────────────────────────────────────────────────────
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS uhid TEXT;
ALTER TABLE public.customers     ADD COLUMN IF NOT EXISTS uhid TEXT;

-- UNIQUE constraints (idempotent via DO-block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'organizations_uhid_key'
                   AND conrelid = 'public.organizations'::regclass) THEN
    ALTER TABLE public.organizations ADD CONSTRAINT organizations_uhid_key UNIQUE (uhid);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'customers_uhid_key'
                   AND conrelid = 'public.customers'::regclass) THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_uhid_key UNIQUE (uhid);
  END IF;
END $$;

-- ── 3. Backfill existing rows (chronological by created_at) ────────────────
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM   public.organizations
  WHERE  uhid IS NULL
)
UPDATE public.organizations o
SET    uhid = 'HV-' || LPAD(n.rn::text, 5, '0')
FROM   numbered n
WHERE  o.id = n.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM   public.customers
  WHERE  uhid IS NULL
)
UPDATE public.customers c
SET    uhid = 'OBJ-' || LPAD(n.rn::text, 5, '0')
FROM   numbered n
WHERE  c.id = n.id;

-- ── 4. Sync sequences to continue AFTER backfilled max ─────────────────────
DO $$
DECLARE max_v INT;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(uhid FROM 4)::int), 0)
  INTO   max_v
  FROM   public.organizations WHERE uhid ~ '^HV-\d+$';
  IF max_v > 0 THEN
    PERFORM setval('public.org_uhid_seq', max_v, true);
  END IF;
END $$;

DO $$
DECLARE max_v INT;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(uhid FROM 5)::int), 0)
  INTO   max_v
  FROM   public.customers WHERE uhid ~ '^OBJ-\d+$';
  IF max_v > 0 THEN
    PERFORM setval('public.customer_uhid_seq', max_v, true);
  END IF;
END $$;

-- ── 5. Trigger functions ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_org_uhid()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.uhid IS NULL OR NEW.uhid = '' THEN
    NEW.uhid := 'HV-' || LPAD(nextval('public.org_uhid_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_customer_uhid()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.uhid IS NULL OR NEW.uhid = '' THEN
    NEW.uhid := 'OBJ-' || LPAD(nextval('public.customer_uhid_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;

-- ── 6. Triggers ────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_organizations_uhid ON public.organizations;
CREATE TRIGGER trg_organizations_uhid
  BEFORE INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_org_uhid();

DROP TRIGGER IF EXISTS trg_customers_uhid ON public.customers;
CREATE TRIGGER trg_customers_uhid
  BEFORE INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_customer_uhid();

-- ── 7. NOT NULL constraint (only when backfill 100 % done) ─────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE uhid IS NULL) THEN
    ALTER TABLE public.organizations ALTER COLUMN uhid SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.customers WHERE uhid IS NULL) THEN
    ALTER TABLE public.customers ALTER COLUMN uhid SET NOT NULL;
  END IF;
END $$;

-- ── 8. Comments ────────────────────────────────────────────────────────────
COMMENT ON COLUMN public.organizations.uhid IS 'UtilityHub-ID (HV-XXXXX), auto-assigned via BEFORE INSERT trigger';
COMMENT ON COLUMN public.customers.uhid     IS 'UtilityHub-ID (OBJ-XXXXX), auto-assigned via BEFORE INSERT trigger';
