-- Migration 014: Convert neu_ap column from TEXT to NUMERIC(8,4)
-- Handles German decimal format (comma as separator) safely

ALTER TABLE teleson_records
ADD COLUMN neu_ap_numeric NUMERIC(8,4);

UPDATE teleson_records
SET neu_ap_numeric =
  CASE
    WHEN neu_ap IS NULL OR CAST(neu_ap AS TEXT) = '' THEN NULL
    WHEN CAST(neu_ap AS TEXT) ~ '^[0-9,\.]+$' THEN
      CAST(REPLACE(CAST(neu_ap AS TEXT), ',', '.') AS NUMERIC(8,4))
    ELSE NULL
  END;

ALTER TABLE teleson_records
DROP COLUMN neu_ap;

ALTER TABLE teleson_records
RENAME COLUMN neu_ap_numeric TO neu_ap;

ALTER TABLE teleson_records
ALTER COLUMN neu_ap SET DEFAULT NULL;
