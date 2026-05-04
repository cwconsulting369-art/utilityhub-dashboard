-- Enable RLS on all application tables
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleson_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fg_finanz_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes     ENABLE ROW LEVEL SECURITY;

-- ── Helper functions ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.get_my_customer_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT customer_id FROM public.profiles WHERE id = auth.uid()
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────

CREATE POLICY "profiles: admin full"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "profiles: own read and update"
  ON public.profiles FOR ALL
  USING (id = auth.uid());

-- ── customers ─────────────────────────────────────────────────────────────────

CREATE POLICY "customers: admin full"
  ON public.customers FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "customers: staff read all"
  ON public.customers FOR SELECT
  USING (public.get_my_role() = 'staff');

CREATE POLICY "customers: staff update assigned"
  ON public.customers FOR UPDATE
  USING (public.get_my_role() = 'staff' AND assigned_to = auth.uid());

CREATE POLICY "customers: customer read own"
  ON public.customers FOR SELECT
  USING (id = public.get_my_customer_id());

-- ── customer_identities ───────────────────────────────────────────────────────

CREATE POLICY "customer_identities: admin full"
  ON public.customer_identities FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "customer_identities: staff read"
  ON public.customer_identities FOR SELECT
  USING (public.get_my_role() = 'staff');

CREATE POLICY "customer_identities: customer read own"
  ON public.customer_identities FOR SELECT
  USING (customer_id = public.get_my_customer_id());

-- ── import_batches ────────────────────────────────────────────────────────────

CREATE POLICY "import_batches: admin full"
  ON public.import_batches FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "import_batches: staff select"
  ON public.import_batches FOR SELECT
  USING (public.get_my_role() = 'staff');

CREATE POLICY "import_batches: staff insert"
  ON public.import_batches FOR INSERT
  WITH CHECK (public.get_my_role() = 'staff');

-- ── teleson_records ───────────────────────────────────────────────────────────

CREATE POLICY "teleson_records: admin full"
  ON public.teleson_records FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "teleson_records: staff read"
  ON public.teleson_records FOR SELECT
  USING (public.get_my_role() = 'staff');

-- ── fg_finanz_records ─────────────────────────────────────────────────────────

CREATE POLICY "fg_finanz_records: admin full"
  ON public.fg_finanz_records FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "fg_finanz_records: staff read"
  ON public.fg_finanz_records FOR SELECT
  USING (public.get_my_role() = 'staff');

-- ── customer_documents ────────────────────────────────────────────────────────

CREATE POLICY "customer_documents: admin full"
  ON public.customer_documents FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "customer_documents: staff full"
  ON public.customer_documents FOR ALL
  USING (public.get_my_role() = 'staff');

CREATE POLICY "customer_documents: customer read own visible"
  ON public.customer_documents FOR SELECT
  USING (
    customer_id = public.get_my_customer_id()
    AND visible_to_customer = true
  );

-- ── upsell_opportunities ──────────────────────────────────────────────────────

CREATE POLICY "upsell_opportunities: admin full"
  ON public.upsell_opportunities FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "upsell_opportunities: staff full"
  ON public.upsell_opportunities FOR ALL
  USING (public.get_my_role() = 'staff');

-- ── audit_logs ────────────────────────────────────────────────────────────────

CREATE POLICY "audit_logs: admin read"
  ON public.audit_logs FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "audit_logs: insert only"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ── customer_notes ────────────────────────────────────────────────────────────

CREATE POLICY "customer_notes: admin full"
  ON public.customer_notes FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "customer_notes: staff full"
  ON public.customer_notes FOR ALL
  USING (public.get_my_role() = 'staff');

CREATE POLICY "customer_notes: customer read own non-internal"
  ON public.customer_notes FOR SELECT
  USING (
    customer_id = public.get_my_customer_id()
    AND is_internal = false
  );
