-- Migration 030: Onboarding-Nudge-Tracking in profiles
--
-- Adds:
--   profiles.onboarding_nudge_sent_at TIMESTAMPTZ — wann die 48h-Inaktivitäts-Email gesendet wurde
--
-- Idempotent: yes (ADD COLUMN IF NOT EXISTS)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_nudge_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.onboarding_nudge_sent_at IS
  'Zeitstempel der letzten gesendeten Onboarding-Nudge-Email. NULL = noch keine gesendet.';
