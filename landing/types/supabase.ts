// Placeholder types — regenerate after connecting Supabase project:
// npx supabase gen types typescript --linked > types/supabase.ts

import type {
  UserRole, CustomerStatus, ImportSource, ImportStatus,
  UpsellStatus, UpsellPriority, DocSource, ProvisionStatus,
} from "@/lib/types"

export interface Profile {
  id:          string
  full_name:   string | null
  role:        UserRole
  customer_id: string | null
  is_active:   boolean
  created_at:  string
  updated_at:  string
}

export interface Customer {
  id:          string
  full_name:   string
  email:       string | null
  phone:       string | null
  address:     string | null
  city:        string | null
  postal_code: string | null
  country:     string
  status:      CustomerStatus
  source:      ImportSource | null
  assigned_to: string | null
  created_at:  string
  updated_at:  string
}

export interface CustomerIdentity {
  id:          string
  customer_id: string
  system:      string
  external_id: string
  label:       string | null
  meta:        Record<string, unknown> | null
  created_at:  string
}

export interface ImportBatch {
  id:             string
  source:         ImportSource
  filename:       string | null
  total_rows:     number
  processed_rows: number
  error_rows:     number
  status:         ImportStatus
  imported_by:    string | null
  created_at:     string
  completed_at:   string | null
  error_log:      Record<string, unknown> | null
}

export interface TelesonRecord {
  id:                string
  customer_id:       string | null
  import_batch_id:   string | null
  weg:               string | null
  energie:           string | null
  status:            string | null
  neuer_versorger:   string | null
  lieferstatus:      string | null
  vorversorger:      string | null
  zaehlernummer:     string | null
  malo:              string | null
  knr:               string | null
  grund_info:        string | null
  belieferungsdatum: string | null
  alt_ap_ct_kwh:     number | null
  neu_ap:            string | null
  laufzeit:          string | null
  gebunden_bis:      string | null
  raw_data:          Record<string, unknown> | null
  created_at:        string
}

export interface FgFinanzRecord {
  id:                  string
  customer_id:         string | null
  import_batch_id:     string | null
  vertrag_id:          string | null
  rechnungs_datum:     string | null
  auszahlungs_datum:   string | null
  produkt:             string | null
  tarif:               string | null
  jahresverbrauch_kwh: number | null
  netzgebiet:          string | null
  provision_betrag:    number | null
  provision_status:    ProvisionStatus | null
  provision_type:      string | null
  raw_data:            Record<string, unknown> | null
  created_at:          string
}

export interface CustomerDocument {
  id:                   string
  customer_id:          string
  uploaded_by:          string | null
  name:                 string
  description:          string | null
  source:               DocSource
  storage_path:         string | null
  google_drive_file_id: string | null
  google_drive_url:     string | null
  mime_type:            string | null
  size_bytes:           number | null
  visible_to_customer:  boolean
  created_at:           string
}

export interface UpsellOpportunity {
  id:          string
  customer_id: string
  assigned_to: string | null
  title:       string
  description: string | null
  status:      UpsellStatus
  priority:    UpsellPriority
  due_date:    string | null
  created_at:  string
  updated_at:  string
}

export interface AuditLog {
  id:         string
  actor_id:   string | null
  action:     string
  table_name: string
  record_id:  string | null
  old_data:   Record<string, unknown> | null
  new_data:   Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface CustomerNote {
  id:          string
  customer_id: string
  author_id:   string | null
  content:     string
  is_internal: boolean
  created_at:  string
  updated_at:  string
}
