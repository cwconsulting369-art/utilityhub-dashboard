-- Migration 027: Hauptordner customer per organization
-- Goal: every profile linked to an organization has a customer_id
-- pointing to a per-org "Hauptordner" customer, so portal uploads
-- can always use profile.customer_id as the target.

-- 1) Create a Hauptordner customer for every org that doesn't have one yet.
INSERT INTO customers (organization_id, full_name, source, status, country)
SELECT
  o.id,
  o.name || ' (Allgemein)',
  'manual',
  'active',
  'DE'
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1
  FROM customers c
  WHERE c.organization_id = o.id
    AND c.full_name = o.name || ' (Allgemein)'
);

-- 2) Backfill profiles.customer_id for any customer-role profile that has
--    organization_id but no customer_id, pointing it at its Hauptordner.
WITH hauptordner AS (
  SELECT DISTINCT ON (organization_id) id, organization_id
  FROM customers
  WHERE source = 'manual'
    AND full_name LIKE '% (Allgemein)'
  ORDER BY organization_id, created_at ASC
)
UPDATE profiles p
SET customer_id = h.id
FROM hauptordner h
WHERE p.customer_id IS NULL
  AND p.organization_id IS NOT NULL
  AND p.organization_id = h.organization_id;
