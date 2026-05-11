CREATE TABLE IF NOT EXISTS public.fg_finanz_records (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         UUID        REFERENCES public.customers(id)      ON DELETE SET NULL,
  import_batch_id     UUID        REFERENCES public.import_batches(id) ON DELETE SET NULL,

  -- Strukturierte Fachfelder (FG Finanz = Provisions-/Abrechnungssystem)
  vertrag_id          TEXT,
  rechnungs_datum     DATE,
  auszahlungs_datum   DATE,
  produkt             TEXT,
  tarif               TEXT,
  jahresverbrauch_kwh NUMERIC(12,2),
  netzgebiet          TEXT,
  provision_betrag    NUMERIC(10,2),
  provision_status    TEXT,
  provision_type      TEXT,

  -- Vollständige Originalzeile als Fallback
  raw_data            JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fg_provision_status_check
    CHECK (provision_status IN ('pending', 'paid', 'cancelled', 'corrected') OR provision_status IS NULL),
  CONSTRAINT fg_provision_type_check
    CHECK (provision_type IN ('einmalig', 'monatlich', 'jaehrlich') OR provision_type IS NULL)
);

COMMENT ON TABLE  public.fg_finanz_records                    IS 'Abrechnungs- und Provisionsdaten aus FG Finanz';
COMMENT ON COLUMN public.fg_finanz_records.provision_betrag   IS 'Provisionsbetrag in EUR';
COMMENT ON COLUMN public.fg_finanz_records.jahresverbrauch_kwh IS 'Jahresverbrauch in kWh';
