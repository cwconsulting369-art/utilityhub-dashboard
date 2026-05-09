"use server"

import { createClient }      from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath }    from "next/cache"

export async function deleteAllCustomerData(): Promise<{ ok: boolean; message: string }> {
  const supabase      = await createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: "Nicht autorisiert" }

  try {
    // 1. Portal-User-Profile holen (haben customer_id gesetzt)
    const { data: portalProfiles } = await adminSupabase
      .from("profiles")
      .select("id")
      .not("customer_id", "is", null)

    // 2. Auth-Accounts der Portal-User löschen
    if (portalProfiles && portalProfiles.length > 0) {
      await Promise.all(
        portalProfiles.map(p =>
          adminSupabase.auth.admin.deleteUser(p.id)
        )
      )
    }

    // 3. Alle abhängigen Tabellen explizit löschen (kein CASCADE-Vertrauen)
    const SENTINEL = "00000000-0000-0000-0000-000000000000"
    await Promise.all([
      adminSupabase.from("teleson_records")      .delete().neq("id", SENTINEL),
      adminSupabase.from("fg_finanz_records")    .delete().neq("id", SENTINEL),
      adminSupabase.from("upsell_opportunities") .delete().neq("id", SENTINEL),
      adminSupabase.from("customer_documents")   .delete().neq("id", SENTINEL),
      adminSupabase.from("customer_identities")  .delete().neq("id", SENTINEL),
    ])

    // 4. Kunden löschen
    await adminSupabase.from("customers").delete().neq("id", SENTINEL)

    // 5. Import-Batches löschen
    await adminSupabase.from("import_batches").delete().neq("id", SENTINEL)

    // 6. Organisationen löschen
    await adminSupabase.from("organizations").delete().neq("id", SENTINEL)

    revalidatePath("/app", "layout")

    const count = portalProfiles?.length ?? 0
    return { ok: true, message: `Alle Daten + ${count} Portal-Account(s) gelöscht.` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}
