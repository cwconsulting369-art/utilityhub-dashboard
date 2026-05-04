-- Migration 017: Add 'pending' to customers.status CHECK constraint
-- The code (dashboard, CustomersTable, actions.ts) already uses 'pending'
-- but the original CHECK in 001_customers_base.sql only allows
-- active | inactive | blocked. This migration fixes the discrepancy.

ALTER TABLE public.customers
  DROP CONSTRAINT IF EXISTS customers_status_check;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_status_check
    CHECK (status IN ('active', 'inactive', 'blocked', 'pending'));
