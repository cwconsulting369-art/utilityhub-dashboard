import { createHash } from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import { mapRow, findOrCreateOrganization } from "@/lib/teleson/importRows"
import type { AirtableRecord } from "./client"

export interface SyncResult {
  total:     number
  imported:  number
  updated:   number
  skipped:   number
  queued:    number
  conflicts: number
  errorLog:  { recordId: string; knr?: string; error: string }[]
}

export interface SyncOptions {
  organizationName?: string
}

function computeHash(fields: Record<string, unknown>): string {
  const stable = JSON.stringify(
    Object.entries(fields)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .sort(([a], [b]) => a.localeCompare(b))
  )
  return createHash("sha256").update(stable).digest("hex")
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncAirtableRecords(
  records: AirtableRecord[],
  batchId: string,
  admin:   SupabaseClient<any>,
  options: SyncOptions = {},
): Promise<SyncResult> {
  const result: SyncResult = {
    total: records.length, imported: 0, updated: 0,
    skipped: 0, queued: 0, conflicts: 0, errorLog: [],
  }
  const now      = new Date().toISOString()
  const orgCache = new Map<string, string>()

  for (const { id: recordId, lastModifiedTime, fields } of records) {
    try {
      const mapped = mapRow(fields)

      if (!mapped.knr && !mapped.malo && !mapped.teleson.energie) {
        result.skipped++
        continue
      }

      const hash = computeHash(fields)

      const { data: syncState } = await admin
        .from("airtable_sync_state")
        .select("sync_status, sync_hash, airtable_last_modified_time, teleson_record_id, customer_id")
        .eq("airtable_record_id", recordId)
        .maybeSingle()

      if (syncState?.sync_status === "conflict") {
        result.conflicts++
        continue
      }

      if (
        syncState?.sync_status === "synced" &&
        syncState.sync_hash === hash &&
        syncState.airtable_last_modified_time === lastModifiedTime
      ) {
        result.skipped++
        continue
      }

      let existingRecordId:   string | null = null
      let existingCustomerId: string | null = null
      const candidateCustomerIds = new Set<string>()

      const { data: byRec } = await admin
        .from("teleson_records")
        .select("id, customer_id")
        .eq("airtable_record_id", recordId)
        .maybeSingle()
      if (byRec) {
        existingRecordId   = byRec.id
        existingCustomerId = byRec.customer_id
        candidateCustomerIds.add(byRec.customer_id)
      }

      if (mapped.knr) {
        const { data: byKnr } = await admin
          .from("teleson_records").select("id, customer_id").eq("knr", mapped.knr).maybeSingle()
        if (byKnr) {
          if (!existingRecordId) { existingRecordId = byKnr.id; existingCustomerId = byKnr.customer_id }
          candidateCustomerIds.add(byKnr.customer_id)
        }
      }

      if (mapped.malo) {
        const { data: byMalo } = await admin
          .from("teleson_records").select("id, customer_id").eq("malo", mapped.malo).maybeSingle()
        if (byMalo) {
          if (!existingRecordId) { existingRecordId = byMalo.id; existingCustomerId = byMalo.customer_id }
          candidateCustomerIds.add(byMalo.customer_id)
        }
      }

      if (mapped.teleson.weg) {
        const wegNorm = mapped.teleson.weg.trim().toLowerCase()
        const { data: wegId } = await admin
          .from("customer_identities").select("customer_id")
          .eq("system", "weg").eq("external_id", wegNorm).maybeSingle()
        if (wegId) candidateCustomerIds.add(wegId.customer_id)
      }

      if (candidateCustomerIds.size > 1) {
        const proposedId = Array.from(candidateCustomerIds)[0]
        const { data: existing } = await admin
          .from("match_review_queue").select("id, status")
          .eq("source_system", "airtable").eq("source_record_id", recordId).maybeSingle()

        if (!existing) {
          await admin.from("match_review_queue").insert({
            source_system: "airtable", source_record_id: recordId,
            proposed_customer_id: proposedId, match_score: null,
            match_reason: ["ambiguous_match"], status: "pending", raw_data: fields,
          })
        } else if (existing.status === "pending") {
          await admin.from("match_review_queue").update({ raw_data: fields }).eq("id", existing.id)
        }

        await admin.from("airtable_sync_state").upsert({
          airtable_record_id: recordId, customer_id: proposedId, teleson_record_id: null,
          airtable_last_modified_time: lastModifiedTime, last_synced_at: now,
          sync_status: "pending", sync_hash: hash,
        }, { onConflict: "airtable_record_id" })

        result.queued++
        continue
      }

      const effectiveOrgName = mapped.organization_name ?? options.organizationName ?? null
      let customerId: string

      if (candidateCustomerIds.size === 1) {
        customerId = existingCustomerId ?? Array.from(candidateCustomerIds)[0]
      } else {
        let orgIdForNew: string | null = null
        if (effectiveOrgName) {
          const cached = orgCache.get(effectiveOrgName)
          orgIdForNew  = cached ?? await findOrCreateOrganization(admin, effectiveOrgName)
          if (orgIdForNew && !cached) orgCache.set(effectiveOrgName, orgIdForNew)
        }

        const { data: newCust, error: ce } = await admin.from("customers").insert({
          ...mapped.customer, source: "airtable", status: "active",
          object_type: mapped.teleson.weg ? "weg" : null, organization_id: orgIdForNew,
        }).select("id").single()
        if (ce || !newCust) throw new Error("Kunde anlegen: " + ce?.message)
        customerId = newCust.id

        if (mapped.knr)
          await admin.from("customer_identities").upsert(
            { customer_id: customerId, system: "teleson", external_id: mapped.knr, label: "KNR" },
            { onConflict: "system,external_id" }
          )
        if (mapped.malo)
          await admin.from("customer_identities").upsert(
            { customer_id: customerId, system: "malo", external_id: mapped.malo, label: "MALO" },
            { onConflict: "system,external_id" }
          )
        if (mapped.teleson.weg)
          await admin.from("customer_identities").upsert(
            { customer_id: customerId, system: "weg", external_id: mapped.teleson.weg.trim().toLowerCase(), label: "WEG" },
            { onConflict: "system,external_id" }
          )
      }

      const recordPayload = {
        ...mapped.teleson,
        customer_id:                customerId,
        import_batch_id:            batchId,
        airtable_record_id:         recordId,
        airtable_last_modified_time: lastModifiedTime,
        last_synced_at:             now,
        sync_status:                "synced",
        sync_hash:                  hash,
      }

      let teleson_record_id: string
      if (existingRecordId) {
        const { error: ue } = await admin.from("teleson_records").update(recordPayload).eq("id", existingRecordId)
        if (ue) throw new Error("Datensatz aktualisieren: " + ue.message)
        teleson_record_id = existingRecordId
      } else {
        const { data: newRec, error: ie } = await admin.from("teleson_records").insert(recordPayload).select("id").single()
        if (ie || !newRec) throw new Error("Datensatz speichern: " + ie?.message)
        teleson_record_id = newRec.id
      }

      if (candidateCustomerIds.size === 1 && effectiveOrgName) {
        const cached = orgCache.get(effectiveOrgName)
        const orgId  = cached ?? await findOrCreateOrganization(admin, effectiveOrgName)
        if (orgId) {
          if (!cached) orgCache.set(effectiveOrgName, orgId)
          await admin.from("customers").update({ organization_id: orgId }).eq("id", customerId)
        }
      }

      await admin.from("airtable_sync_state").upsert({
        airtable_record_id:         recordId,
        customer_id:                customerId,
        teleson_record_id:          teleson_record_id,
        airtable_last_modified_time: lastModifiedTime,
        last_synced_at:             now,
        sync_status:                "synced",
        sync_hash:                  hash,
      }, { onConflict: "airtable_record_id" })

      syncState ? result.updated++ : result.imported++

    } catch (e) {
      result.errorLog.push({ recordId, knr: mapRow(fields).knr ?? undefined, error: String(e) })
    }
  }

  return result
}
