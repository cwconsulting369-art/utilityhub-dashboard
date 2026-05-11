-- Migration 026: Forced password change on first login
--
-- Adds:
--   profiles.password_changed BOOLEAN NOT NULL DEFAULT false
--
-- Effect:
--   New customer accounts get password_changed = false → portal proxy
--   redirects them to /portal/change-password until they set their own
--   password. Existing customer profiles are reset to false (defensive).
--
-- Idempotent: yes (ADD COLUMN IF NOT EXISTS, UPDATE filters)
-- Dependencies: 002_profiles.sql

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_changed BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.password_changed IS
  'Set true when the user has changed their initial password. Customer accounts with false get redirected to /portal/change-password.';

-- Defensive: reset for all existing customer profiles so they hit the
-- forced-change flow on next login. Admin/staff are unaffected.
UPDATE public.profiles
SET    password_changed = false
WHERE  role = 'customer';
