-- Migration 023: Profiles → Organization link
--
-- Adds:
--   profiles.organization_id — optional FK to organizations(id)
--
-- Purpose:
--   Allow staff/admin profiles to be associated with a specific
--   Hausverwaltung (organization). Useful for filtering and access
--   scoping. Nullable — staff without org assignment remains supported.
--
-- Idempotent: yes (ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS)
-- Dependencies: 002_profiles.sql, 016_organizations.sql

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organization_id UUID
    REFERENCES public.organizations(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.organization_id
  IS 'Optionale Zuordnung zu einer Hausverwaltung (organizations.id). NULL = keine Zuordnung.';

CREATE INDEX IF NOT EXISTS idx_profiles_organization_id
  ON public.profiles(organization_id);
