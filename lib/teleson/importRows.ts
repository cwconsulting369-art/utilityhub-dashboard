import type { SupabaseClient } from "@supabase/supabase-js"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ErrorEntry {
  row:   number
  knr?:  string
  name?: string
  error: string
}

export type SkipReason =
  | "metadata"    // Rule 1: no KNR, MALO, or Energie → legend/contact row
  | "incomplete"  // Rule 2: (reserved) Energie present but no meaningful contract data

export interface SkipEntry {
  row:    number
  reason: SkipReason
  weg?:   string
  name?:  string
}

export interface ImportResult {
  processed:         number  // rows successfully written to DB
  skippedMetadata:   number  // Rule 1 skips (legend/metadata rows)
  skippedIncomplete: number  // Rule 2 skips (reserved for future use)
  errors:            number  // rows that failed during DB insert
  errorLog:          ErrorEntry[]
  skippedLog:        SkipEntry[]
}

/**
 * Structured summary stored in import_batches.error_log (JSONB).
 * Separates intentional skips from real processing errors.
 */
export interface BatchErrorLog {
  summary: {
    imported:           number
    skipped_metadata:   number
    skipped_incomplete: number
    errors:             number
  }
  skipped?: SkipEntry[]   // up to 50 skip entries
  errors?:  ErrorEntry[]  // up to 20 error entries
}

export interface ProcessOptions {
  /**
   * Use WEG as a tertiary identity lookup/upsert when KNR and MALO are absent.
   * Enable for Notion imports (WEG = building address, stable across re-imports).
   * Leave off for CSV imports (WEG = channel name like "Online"/"Telefon" — not unique per customer).
   */
  useWegIdentity?: boolean

  /**
   * Batch-level organization name. All rows will be linked to this organization
   * (looked up by name case-insensitively, created with org_type='hausverwaltung' if not found).
   * Row-level "Hausverwaltung" column takes precedence when both are present.
   */
  organizationName?: string
}

// ── Skip rules (applied in order before any DB writes) ───────────────────────
//
//  Rule 1 — Metadata / legend rows
//  Condition:  no KNR  AND  no MALO  AND  no Energie
//  Reason:     Notion DBs often contain explanatory rows mixed with contract data.
//              Examples seen in production:
//                "Abkürzungen der Preise", "B = Brutto Preis (inkl. allem)",
//                "Geb: 09.07.1971", "StNr: 15325800329", "Strom2025!"
//              These rows carry no contract data and must never become customers.
//
//  Rule 2 — Incomplete rows  (RESERVED — not yet enforced)
//  Condition:  Energie present  BUT  no KNR, MALO, WEG  AND  full_name = "Unbekannt"
//  Reason:     Row has some energy data but cannot be attributed to any customer.
//              Currently skipped count is always 0; enforce when confirmed needed.
//
// ─────────────────────────────────────────────────────────────────────────────

// ── mapRow ────────────────────────────────────────────────────────────────────

/**
 * Parse a WEG-Adresse string into structured address fields.
 * Format: "[PLZ ]City / Street" — splits on the FIRST " / ".
 *
 * Examples:
 *   "94072 Bad Füssing / Hibinger Str. 10a" → { postal_code: "94072", city: "Bad Füssing", address: "Hibinger Str. 10a" }
 *   "Bad Füssing / Hibinger Str. 10a"       → { postal_code: null,    city: "Bad Füssing", address: "Hibinger Str. 10a" }
 *   "Online" / null / no separator          → null (not an address)
 */
function parseWegAddress(weg: string | null): {
  address:         string
  city:            string | null
  postal_code:     string | null
  address_display: string
} | null {
  if (!weg) return null
  const slashIdx = weg.indexOf(" / ")
  if (slashIdx < 0) return null

  const leftPart = weg.slice(0, slashIdx).trim()
  const street   = weg.slice(slashIdx + 3).trim()
  if (!street) return null

  let postal_code: string | null
  let city:        string | null
  if (/^\d{5}/.test(leftPart)) {
    postal_code = leftPart.slice(0, 5)
    city        = leftPart.slice(5).trim() || null
  } else {
    postal_code = null
    city        = leftPart || null
  }

  let address_display = street
  if (city)        address_display += ", " + city
  if (postal_code) address_display += " " + postal_code

  return { address: street, city, postal_code, address_display }
}

/**
 * Maps a raw row (CSV, JSON, or Notion-flattened) → structured fields.
 * Covers all known Teleson, Notion, and FG-export column name variants.
 */
export function mapRow(raw: Record<string, unknown>) {
  const str = (...keys: string[]): string | null => {
    for (const k of keys) {
      const v = raw[k]
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim()
    }
    return null
  }
  const num = (...keys: string[]): number | null => {
    const s = str(...keys)
    if (!s) return null
    const n = parseFloat(s.replace(",", "."))
    return isNaN(n) ? null : n
  }
  const date = (...keys: string[]): string | null => {
    const s = str(...keys)
    if (!s) return null
    // DD.MM.YYYY → ISO
    const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`
    // Already ISO or ISO-prefixed
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
    return null
  }

  // Split first/last name columns (some exports)
  const firstName = str("Vorname", "Vorname/Rufname", "First Name", "Firstname")
  const lastName  = str("Nachname", "Familienname", "Last Name", "Lastname", "Name (Nachname)")
  const splitName = [firstName, lastName].filter(Boolean).join(" ") || null

  // KNr (Notion) / KNR (CSV) / K-Nr / Kundennummer
  const knr = str("KNR", "KNr", "Knr", "knr", "K-Nr", "Kundennummer", "Kunden-Nr", "K.Nr.")

  // MALO variants
  const malo = str(
    "MALO", "Malo", "malo", "MaLo", "MaLo-ID",
    "Marktlokation", "Marktlokations-ID", "Marktlokationsnummer"
  )

  const organization_name = str(
    "Hausverwaltung", "Organisation", "Org", "Verwaltung",
    "Bestandshalter", "Hausverwaltung / Organisation"
  )

  const wegRaw  = str("WEG", "Weg", "weg", "Objekt", "Vertriebsweg", "Kanal")
  const wegAddr = parseWegAddress(wegRaw)

  return {
    organization_name,
    customer: {
      // WEG is used as fallback customer name for Notion imports (no dedicated Name column)
      full_name: str(
        "Name", "Kundenname", "Kunde", "Vollständiger Name", "Vor- und Nachname",
        "Firmenname", "Firma", "Unternehmensname", "WEG", "Objekt"
      ) ?? splitName ?? "Unbekannt",
      email: str(
        "E-Mail", "Email", "email", "E-mail", "E-Mail-Adresse", "Mailadresse", "Mail"
      ),
      phone: str(
        "Telefon", "Tel", "Telefonnummer", "Phone",
        "Mobilnummer", "Handynummer", "Mobil", "Mobiltelefon"
      ),
      // WEG-parsed address fields take precedence; fall back to dedicated columns when WEG isn't an address
      address:         wegAddr ? wegAddr.address     : str("Adresse", "Straße", "Strasse", "Straße und Hausnummer", "Straße / Hausnummer", "Anschrift"),
      city:            wegAddr ? wegAddr.city        : str("Stadt", "Ort", "Gemeinde", "Wohnort", "Lieferort"),
      postal_code:     wegAddr ? wegAddr.postal_code : str("PLZ", "Postleitzahl", "Postleitzahl (PLZ)"),
      address_display: wegAddr?.address_display ?? null,
    },
    knr,
    malo,
    teleson: {
      // WEG is the title column in Notion → also maps to weg
      weg:               wegRaw,
      energie:           str("Energie", "energie", "Energy", "Sparte", "Energieart"),
      status:            str("Status", "status", "Bearbeitungsstatus"),
      neuer_versorger:   str(
        "Neuer Versorger", "Versorger neu", "Versorger", "Versorger (neu)",
        "Versorger_neu", "Neuer Lieferant", "Zielversorger"
      ),
      lieferstatus:      str(
        "Lieferstatus", "Lieferanten-Status", "Lieferbeginn Status", "Lieferstart-Status"
      ),
      vorversorger:      str(
        "Vorversorger", "Versorger alt", "Versorger (alt)", "Versorger_alt",
        "Alter Versorger", "Bisheriger Versorger", "Aktueller Versorger"
      ),
      zaehlernummer:     str(
        "Zählernummer", "Zaehler", "Zähler", "Zählernr", "Zaehlernummer",
        "Zähler-Nr", "Zähler-Nummer", "Zählpunktnummer"
      ),
      malo,
      knr,
      grund_info:        str(
        "Grund / Info", "Grund Info", "Grund/Info", "Grund", "Info", "Anmerkung", "Grund-Info",
        "Bemerkung", "Hinweis", "Notiz"
      ),
      belieferungsdatum: date(
        "Belieferungsdatum", "Lieferdatum", "Lieferbeginn",
        "Belieferungstermin", "Belieferung ab", "Lieferbeginn Datum", "Belieferungs-Datum"
      ),
      alt_ap_ct_kwh:     num(
        "Alt AP ct/kWh", "Alt AP", "AP alt", "Arbeitspreis alt",
        "AP alt (ct/kWh)", "Alter Arbeitspreis", "AP bisherig"
      ),
      neu_ap:            num(
        "Neu AP", "AP neu", "Arbeitspreis neu", "AP neu (ct/kWh)", "Neuer Arbeitspreis"
      ),
      laufzeit:          str(
        "Laufzeit", "Vertragslaufzeit", "Mindestlaufzeit", "Vertragsdauer"
      ),
      gebunden_bis:      date(
        "Gebunden bis", "Bindung bis", "Vertrag bis", "Vertragsende",
        "Laufzeit bis", "Gebunden Bis", "Bindungsdatum"
      ),
      raw_data: raw,
    },
  }
}

// ── findOrCreateOrganization ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function findOrCreateOrganization(admin: SupabaseClient<any>, name: string): Promise<string | null> {
  const { data: existing } = await admin
    .from("organizations").select("id").ilike("name", name).limit(1)
  if (existing?.[0]?.id) return existing[0].id

  const { data: created } = await admin
    .from("organizations")
    .insert({ name, org_type: "hausverwaltung" })
    .select("id").single()
  return created?.id ?? null
}

// ── processRows ───────────────────────────────────────────────────────────────

/**
 * Processes rows into Supabase: creates customers, upserts identities, inserts teleson_records.
 * Idempotent via customer_identities unique constraint (system, external_id).
 * Applies skip rules before any DB writes; returns separate counters per category.
 */
export async function processRows(
  rows: Record<string, unknown>[],
  batchId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any>,
  options: ProcessOptions = {},
): Promise<ImportResult> {
  let processed         = 0
  let skippedMetadata   = 0
  let skippedIncomplete = 0  // Rule 2 reserved — always 0 until enforced
  let errors            = 0
  const errorLog:   ErrorEntry[] = []
  const skippedLog: SkipEntry[]  = []
  // Cache: org name (lowercase) → org UUID or "" (not found/failed)
  const orgCache = new Map<string, string>()

  for (let i = 0; i < rows.length; i++) {
    const mapped = mapRow(rows[i])

    // ── Rule 1: Metadata / legend rows ──────────────────────────────────────
    // Skip rows that carry no identifying data (KNR / MALO) and no contract
    // signal (Energie). These are Notion "notes" rows mixed into the DB.
    if (!mapped.knr && !mapped.malo && !mapped.teleson.energie) {
      skippedMetadata++
      skippedLog.push({
        row:    i + 1,
        reason: "metadata",
        weg:    mapped.teleson.weg  ?? undefined,
        name:   mapped.customer.full_name !== "Unbekannt"
                  ? mapped.customer.full_name : undefined,
      })
      continue
    }

    // ── Rule 2 placeholder ───────────────────────────────────────────────────
    // (not enforced — reserved for future: rows with Energie but no attributable customer)

    // ── Resolve organization (before customer lookup so it can be included in INSERT) ──
    const rawOrgName = (mapped.organization_name ?? options.organizationName)?.trim() || null
    let resolvedOrgId: string | null = null
    if (rawOrgName) {
      const cacheKey = rawOrgName.toLowerCase()
      const cached = orgCache.get(cacheKey)
      if (cached !== undefined) {
        resolvedOrgId = cached || null
      } else {
        resolvedOrgId = await findOrCreateOrganization(admin, rawOrgName)
        orgCache.set(cacheKey, resolvedOrgId ?? "")
      }
    }
    const resolvedObjectType = (options.useWegIdentity && mapped.teleson.weg) ? "weg" : null

    try {
      // 1. Find existing customer (KNR → teleson, MALO → malo, WEG → weg, full_name fallback)
      let customerId: string | null = null
      const wegNorm = mapped.teleson.weg?.trim().toLowerCase() || null

      if (mapped.knr) {
        const { data: identity } = await admin
          .from("customer_identities")
          .select("customer_id")
          .eq("system", "teleson")
          .eq("external_id", mapped.knr)
          .maybeSingle()
        if (identity) customerId = identity.customer_id
      }
      if (!customerId && mapped.malo) {
        const { data: identity } = await admin
          .from("customer_identities")
          .select("customer_id")
          .eq("system", "malo")
          .eq("external_id", mapped.malo)
          .maybeSingle()
        if (identity) customerId = identity.customer_id
      }
      if (!customerId && options.useWegIdentity && wegNorm) {
        const { data: identity } = await admin
          .from("customer_identities")
          .select("customer_id")
          .eq("system", "weg")
          .eq("external_id", wegNorm)
          .maybeSingle()
        if (identity) customerId = identity.customer_id
      }

      // 1b. Fallback: case-insensitive full_name match on customers.
      // Catches Strom + Gas rows of the same WEG (full_name = WEG-Adresse for Notion imports),
      // even when the WEG identity hasn't been registered yet for this customer.
      // Skipped for the "Unbekannt" placeholder to avoid lumping all unnamed rows together.
      if (!customerId && mapped.customer.full_name && mapped.customer.full_name !== "Unbekannt") {
        const { data: existingCustomer } = await admin
          .from("customers")
          .select("id")
          .ilike("full_name", mapped.customer.full_name)
          .limit(1)
        if (existingCustomer?.[0]) customerId = existingCustomer[0].id
      }

      // 2. Create customer if not found
      const extraFields: Record<string, unknown> = {}
      if (resolvedOrgId)    extraFields.organization_id = resolvedOrgId
      if (resolvedObjectType) extraFields.object_type   = resolvedObjectType

      if (!customerId) {
        const { data: newCustomer, error: custErr } = await admin
          .from("customers")
          .insert({ ...mapped.customer, source: "teleson", status: "active", ...extraFields })
          .select("id").single()
        if (custErr || !newCustomer) throw new Error("Kunde anlegen: " + custErr?.message)
        customerId = newCustomer.id
      } else if (Object.keys(extraFields).length > 0) {
        // Link existing customer to org / set object_type
        await admin.from("customers").update(extraFields).eq("id", customerId)
      }

      // 3. Upsert identities (idempotent)
      if (mapped.knr) {
        await admin.from("customer_identities").upsert(
          { customer_id: customerId, system: "teleson", external_id: mapped.knr, label: "KNR" },
          { onConflict: "system,external_id" }
        )
      }
      if (mapped.malo) {
        await admin.from("customer_identities").upsert(
          { customer_id: customerId, system: "malo", external_id: mapped.malo, label: "MALO" },
          { onConflict: "system,external_id" }
        )
      }
      if (options.useWegIdentity && wegNorm) {
        await admin.from("customer_identities").upsert(
          { customer_id: customerId, system: "weg", external_id: wegNorm, label: "WEG" },
          { onConflict: "system,external_id" }
        )
      }

      // 4. Upsert teleson record (idempotent by KNR → MALO → no-key fallback)
      //
      // Dedup scope:
      //   KNR  — primary key for all Teleson contracts; deduplicated for both CSV and Notion.
      //   MALO — fallback when KNR absent; deduplicated for both CSV and Notion.
      //   WEG  — NOT used as a dedup key in CSV mode.
      //          In CSV exports, WEG = Vertriebskanal ("Online", "Telefon") — not unique per customer.
      //          In Notion imports (useWegIdentity: true), WEG is the building address and IS unique;
      //          it is handled via customer_identities lookup above (step 1), not here.
      //   No-key rows (no KNR, no MALO) — always inserted; no reliable dedup possible.
      //          These are rare in well-formed Teleson exports (Rule 1 filters most of them).
      //
      // This pre-check avoids duplicates without requiring a DB unique constraint on teleson_records.
      let existingId: string | null = null
      if (mapped.knr) {
        const { data: rows } = await admin
          .from("teleson_records").select("id").eq("knr", mapped.knr).limit(1)
        existingId = rows?.[0]?.id ?? null
      }
      if (!existingId && mapped.malo) {
        const { data: rows } = await admin
          .from("teleson_records").select("id").eq("malo", mapped.malo).limit(1)
        existingId = rows?.[0]?.id ?? null
      }

      const recordPayload = {
        ...mapped.teleson,
        customer_id:     customerId,
        import_batch_id: batchId,
      }

      if (existingId) {
        const { error: updateErr } = await admin
          .from("teleson_records").update(recordPayload).eq("id", existingId)
        if (updateErr) throw new Error("Datensatz aktualisieren: " + updateErr.message)
      } else {
        const { error: insertErr } = await admin
          .from("teleson_records").insert(recordPayload)
        if (insertErr) throw new Error("Datensatz speichern: " + insertErr.message)
      }

      processed++
    } catch (e) {
      errors++
      errorLog.push({
        row:   i + 1,
        knr:   mapped.knr ?? undefined,
        name:  mapped.customer.full_name !== "Unbekannt" ? mapped.customer.full_name : undefined,
        error: String(e),
      })
    }
  }

  return { processed, skippedMetadata, skippedIncomplete, errors, errorLog, skippedLog }
}

// ── buildBatchErrorLog ────────────────────────────────────────────────────────

/** Builds the structured JSONB object stored in import_batches.error_log. */
export function buildBatchErrorLog(result: ImportResult): BatchErrorLog | null {
  const hasDetails = result.skippedLog.length > 0 || result.errorLog.length > 0
  const allZero    = result.skippedMetadata === 0 && result.skippedIncomplete === 0 && result.errors === 0

  if (allZero && !hasDetails) return null  // clean run — store null, not an empty object

  const log: BatchErrorLog = {
    summary: {
      imported:           result.processed,
      skipped_metadata:   result.skippedMetadata,
      skipped_incomplete: result.skippedIncomplete,
      errors:             result.errors,
    },
  }
  if (result.skippedLog.length > 0) log.skipped = result.skippedLog.slice(0, 50)
  if (result.errorLog.length   > 0) log.errors  = result.errorLog.slice(0, 20)

  return log
}
