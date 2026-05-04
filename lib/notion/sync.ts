/**
 * Notion → Supabase sync engine.
 *
 * Decision tree per page:
 *   1. Skip metadata rows (no KNR, MALO, Energie)
 *   2. Skip if conflict is pending human review
 *   3. Skip if hash + last_edited_at unchanged
 *   4. Match by: notion_page_id (direct) → KNR (secure) → MALO (secure)
 *   5. Secure match  → update teleson_record + notion_sync_state (synced)
 *   6. WEG-only / no match → match_review_queue + notion_sync_state (pending)
 *
 * processRows() in importRows.ts is intentionally not modified — it handles
 * CSV/JSON imports and must not acquire Notion-specific behaviour.
 */

import { createHash } from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import { mapRow, findOrCreateOrganization } from "@/lib/teleson/importRows"
import type { NotionPageWithMeta } from "./client"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SyncResult {
  total:     number
  imported:  number  // previously unlinked record now confirmed and written
  updated:   number  // already-linked record updated with fresh Notion data
  skipped:   number  // no change detected or metadata row
  queued:    number  // no secure match → sent to match_review_queue
  conflicts: number  // conflict awaiting human review — not touched
  errorLog:  { pageId: string; knr?: string; error: string }[]
}

// ── Hash ──────────────────────────────────────────────────────────────────────

function computeHash(props: Record<string, string>): string {
  const stable = JSON.stringify(
    Object.entries(props)
      .filter(([, v]) => v !== "")
      .sort(([a], [b]) => a.localeCompare(b))
  )
  return createHash("sha256").update(stable).digest("hex")
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface SyncOptions {
  /**
   * Batch-level Hausverwaltung override. Used when the Notion row itself
   * has no "Hausverwaltung"/"Organisation" column. Row-level value still
   * wins when present.
   */
  organizationName?: string
}

export async function syncNotionPages(
  pages:   NotionPageWithMeta[],
  batchId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin:   SupabaseClient<any>,
  options: SyncOptions = {},
): Promise<SyncResult> {
  const result: SyncResult = {
    total: pages.length, imported: 0, updated: 0,
    skipped: 0, queued: 0, conflicts: 0, errorLog: [],
  }
  const now = new Date().toISOString()
  const orgCache = new Map<string, string>()

  for (const { pageId, lastEditedAt, props } of pages) {
    try {
      const mapped = mapRow(props)

      // ── 1. Skip metadata / legend rows ──────────────────────────────────
      if (!mapped.knr && !mapped.malo && !mapped.teleson.energie) {
        result.skipped++
        continue
      }

      const hash = computeHash(props)

      // ── 2. Load existing sync state ──────────────────────────────────────
      const { data: syncState } = await admin
        .from("notion_sync_state")
        .select("sync_status, sync_hash, notion_last_edited_at, teleson_record_id, customer_id")
        .eq("notion_page_id", pageId)
        .maybeSingle()

      // ── 3. Skip if conflict is pending human resolution ──────────────────
      if (syncState?.sync_status === "conflict") {
        result.conflicts++
        continue
      }

      // ── 4. Skip if nothing changed ───────────────────────────────────────
      if (
        syncState?.sync_status === "synced" &&
        syncState.sync_hash         === hash &&
        syncState.notion_last_edited_at === lastEditedAt
      ) {
        result.skipped++
        continue
      }

      // ── 5. Match — collect ALL candidate customer IDs to detect ambiguity ─
      // Priority for record-binding (existingRecordId): notion_page_id → KNR → MALO.
      // WEG identity provides a customer hint only (no record bind).
      let existingRecordId:   string | null = null
      let existingCustomerId: string | null = null
      const candidateCustomerIds = new Set<string>()

      // 5a. Direct link (already synced in a previous run)
      const { data: byPage } = await admin
        .from("teleson_records")
        .select("id, customer_id")
        .eq("notion_page_id", pageId)
        .maybeSingle()
      if (byPage) {
        existingRecordId   = byPage.id
        existingCustomerId = byPage.customer_id
        candidateCustomerIds.add(byPage.customer_id)
      }

      // 5b. KNR
      if (mapped.knr) {
        const { data: byKnr } = await admin
          .from("teleson_records")
          .select("id, customer_id")
          .eq("knr", mapped.knr)
          .maybeSingle()
        if (byKnr) {
          if (!existingRecordId) {
            existingRecordId   = byKnr.id
            existingCustomerId = byKnr.customer_id
          }
          candidateCustomerIds.add(byKnr.customer_id)
        }
      }

      // 5c. MALO
      if (mapped.malo) {
        const { data: byMalo } = await admin
          .from("teleson_records")
          .select("id, customer_id")
          .eq("malo", mapped.malo)
          .maybeSingle()
        if (byMalo) {
          if (!existingRecordId) {
            existingRecordId   = byMalo.id
            existingCustomerId = byMalo.customer_id
          }
          candidateCustomerIds.add(byMalo.customer_id)
        }
      }

      // 5d. WEG identity — customer hint only, no record bind
      if (mapped.teleson.weg) {
        const wegNorm = mapped.teleson.weg.trim().toLowerCase()
        const { data: wegIdentity } = await admin
          .from("customer_identities")
          .select("customer_id")
          .eq("system", "weg")
          .eq("external_id", wegNorm)
          .maybeSingle()
        if (wegIdentity) candidateCustomerIds.add(wegIdentity.customer_id)
      }

      // ── 6. Ambiguous match (multiple distinct customers) → queue ─────────
      // Only queues when KNR/MALO/WEG point to DIFFERENT customers — that's a
      // data inconsistency that needs human resolution.
      // 0 candidates or 1 candidate are handled in step 7 (create or use).
      if (candidateCustomerIds.size > 1) {
        const proposedId = Array.from(candidateCustomerIds)[0]

        const { data: existingQueueEntry } = await admin
          .from("match_review_queue")
          .select("id, status")
          .eq("source_system",    "notion")
          .eq("source_record_id", pageId)
          .maybeSingle()

        if (!existingQueueEntry) {
          await admin.from("match_review_queue").insert({
            source_system:        "notion",
            source_record_id:     pageId,
            proposed_customer_id: proposedId,
            match_score:          null,
            match_reason:         ["ambiguous_match"],
            status:               "pending",
            raw_data:             props,
          })
        } else if (existingQueueEntry.status === "pending") {
          await admin
            .from("match_review_queue")
            .update({ raw_data: props })
            .eq("id", existingQueueEntry.id)
        }

        await admin.from("notion_sync_state").upsert({
          notion_page_id:        pageId,
          customer_id:           proposedId,
          teleson_record_id:     null,
          notion_last_edited_at: lastEditedAt,
          last_synced_at:        now,
          sync_status:           "pending",
          sync_hash:             hash,
        }, { onConflict: "notion_page_id" })

        result.queued++
        continue
      }

      // ── 7. Resolve customer: use single existing candidate or create new ─
      // Effective Hausverwaltung-Name: row-level wins over batch-level override.
      const effectiveOrgName = mapped.organization_name ?? options.organizationName ?? null

      let customerId: string

      if (candidateCustomerIds.size === 1) {
        customerId = existingCustomerId ?? Array.from(candidateCustomerIds)[0]
      } else {
        // No match → create new customer + identities (KNR / MALO / WEG)
        let orgIdForNew: string | null = null
        if (effectiveOrgName) {
          const cached = orgCache.get(effectiveOrgName)
          orgIdForNew = cached ?? await findOrCreateOrganization(admin, effectiveOrgName)
          if (orgIdForNew && !cached) orgCache.set(effectiveOrgName, orgIdForNew)
        }

        const { data: newCust, error: ce } = await admin
          .from("customers")
          .insert({
            ...mapped.customer,
            source:          "teleson",
            status:          "active",
            object_type:     mapped.teleson.weg ? "weg" : null,
            organization_id: orgIdForNew,
          })
          .select("id")
          .single()
        if (ce || !newCust) throw new Error("Kunde anlegen: " + ce?.message)
        customerId = newCust.id

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
        if (mapped.teleson.weg) {
          const wegNorm = mapped.teleson.weg.trim().toLowerCase()
          await admin.from("customer_identities").upsert(
            { customer_id: customerId, system: "weg", external_id: wegNorm, label: "WEG" },
            { onConflict: "system,external_id" }
          )
        }
      }

      // ── 8. Update existing or insert new teleson_record ──────────────────
      const recordPayload = {
        ...mapped.teleson,
        customer_id:            customerId,
        import_batch_id:        batchId,
        notion_page_id:         pageId,
        notion_last_edited_at:  lastEditedAt,
        last_synced_at:         now,
        sync_status:            "synced",
        sync_hash:              hash,
      }

      let teleson_record_id: string
      if (existingRecordId) {
        const { error: updateErr } = await admin
          .from("teleson_records").update(recordPayload).eq("id", existingRecordId)
        if (updateErr) throw new Error("Datensatz aktualisieren: " + updateErr.message)
        teleson_record_id = existingRecordId
      } else {
        const { data: newRec, error: insertErr } = await admin
          .from("teleson_records").insert(recordPayload).select("id").single()
        if (insertErr || !newRec) throw new Error("Datensatz speichern: " + insertErr?.message)
        teleson_record_id = newRec.id
      }

      // ── 8b. Ensure organization_id on existing customer ──────────────────
      // (For newly created customers, org_id was set during INSERT above.)
      if (candidateCustomerIds.size === 1 && effectiveOrgName) {
        const cached = orgCache.get(effectiveOrgName)
        const orgId  = cached ?? await findOrCreateOrganization(admin, effectiveOrgName)
        if (orgId) {
          if (!cached) orgCache.set(effectiveOrgName, orgId)
          await admin
            .from("customers")
            .update({ organization_id: orgId })
            .eq("id", customerId)
        }
      }

      // ── 9. Write / update notion_sync_state ───────────────────────────────
      await admin.from("notion_sync_state").upsert({
        notion_page_id:        pageId,
        customer_id:           customerId,
        teleson_record_id:     teleson_record_id,
        notion_last_edited_at: lastEditedAt,
        last_synced_at:        now,
        sync_status:           "synced",
        sync_hash:             hash,
      }, { onConflict: "notion_page_id" })

      // imported = first time this page gets a confirmed match
      // updated  = page was already known (syncState exists)
      if (syncState) {
        result.updated++
      } else {
        result.imported++
      }

    } catch (e) {
      result.errorLog.push({
        pageId,
        knr:   mapRow(props).knr ?? undefined,
        error: String(e),
      })
    }
  }

  return result
}
