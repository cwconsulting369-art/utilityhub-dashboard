CREATE TABLE IF NOT EXISTS public.teleson_records (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID        REFERENCES public.customers(id)      ON DELETE SET NULL,
  import_batch_id   UUID        REFERENCES public.import_batches(id) ON DELETE SET NULL,

  -- Strukturierte Fachfelder aus Teleson-CSV/Notion
  weg               TEXT,
  energie           TEXT,
  status            TEXT,
  neuer_versorger   TEXT,
  lieferstatus      TEXT,
  vorversorger      TEXT,
  zaehlernummer     TEXT,
  malo              TEXT,
  knr               TEXT,
  grund_info        TEXT,
  belieferungsdatum DATE,
  alt_ap_ct_kwh     NUMERIC(8,4),
  neu_ap            TEXT,
  laufzeit          TEXT,
  gebunden_bis      DATE,

  -- Vollständige Originalzeile als Fallback
  raw_data          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.teleson_records                   IS 'Datensätze aus dem Teleson-System (Energiewechsel-Vertrieb)';
COMMENT ON COLUMN public.teleson_records.malo              IS 'Marktlokations-ID (MaLo)';
COMMENT ON COLUMN public.teleson_records.knr               IS 'Kundennummer im Teleson-System';
COMMENT ON COLUMN public.teleson_records.alt_ap_ct_kwh     IS 'Alter Arbeitspreis in ct/kWh';
COMMENT ON COLUMN public.teleson_records.belieferungsdatum IS 'Datum des Belieferungsbeginns';
COMMENT ON COLUMN public.teleson_records.gebunden_bis      IS 'Vertragsbindungsende';
