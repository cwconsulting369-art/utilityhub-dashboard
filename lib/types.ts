export type UserRole       = "admin" | "staff" | "customer"
export type EnergyType     = "ELECTRICITY" | "GAS" | "COMBINED"
export type CustomerStatus = "active" | "inactive" | "blocked"
export type ImportSource   = "teleson" | "fg_finanz" | "manual"
export type ImportStatus   = "pending" | "processing" | "done" | "failed"
export type UpsellStatus   = "open" | "in_progress" | "won" | "lost"
export type UpsellPriority = "low" | "medium" | "high"
export type DocSource      = "supabase_storage" | "google_drive" | "external_url"
export type ProvisionStatus = "pending" | "paid" | "cancelled" | "corrected"

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:    "Administrator",
  staff:    "Mitarbeiter",
  customer: "Kunde",
}

export const ENERGY_TYPE_LABELS: Record<EnergyType, string> = {
  ELECTRICITY: "Strom",
  GAS:         "Gas",
  COMBINED:    "Strom & Gas",
}

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active:   "Aktiv",
  inactive: "Inaktiv",
  blocked:  "Gesperrt",
}

export const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  pending:    "Ausstehend",
  processing: "Wird verarbeitet",
  done:       "Abgeschlossen",
  failed:     "Fehlgeschlagen",
}

export const UPSELL_STATUS_LABELS: Record<UpsellStatus, string> = {
  open:        "Offen",
  in_progress: "In Bearbeitung",
  won:         "Gewonnen",
  lost:        "Verloren",
}
