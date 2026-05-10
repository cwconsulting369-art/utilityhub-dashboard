"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_CUSTOMER_STATUSES = ["active", "inactive", "blocked", "pending"] as const
type CustomerStatus = typeof ALLOWED_CUSTOMER_STATUSES[number]

const VALID_FORM_OBJECT_TYPES = ["weg", "privat"] as const

export interface StammdatenInput {
  full_name:        string
  email:            string
  phone:            string
  address:          string
  city:             string
  postal_code:      string
  object_type:      string
  organization_id:  string
}

export async function updateCustomerStammdaten(
  customerId: string,
  data: StammdatenInput,
): Promise<{ error?: string }> {
  const name = data.full_name.trim()
  if (!name) return { error: "Name ist erforderlich." }

  const formType = data.object_type.trim()
  if (formType && !VALID_FORM_OBJECT_TYPES.includes(formType as typeof VALID_FORM_OBJECT_TYPES[number])) {
    return { error: "Ungültiger Objekttyp." }
  }
  // "privat" maps to NULL in the DB to avoid the existing object_type CHECK constraint;
  // the UI treats anything non-WEG as "Privat".
  const dbObjectType = formType === "weg" ? "weg" : null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht eingeloggt." }

  const { error } = await supabase
    .from("customers")
    .update({
      full_name:        name,
      email:            data.email.trim()           || null,
      phone:            data.phone.trim()           || null,
      address:          data.address.trim()         || null,
      city:             data.city.trim()            || null,
      postal_code:      data.postal_code.trim()     || null,
      object_type:      dbObjectType,
      organization_id:  data.organization_id.trim() || null,
      updated_at:       new Date().toISOString(),
    })
    .eq("id", customerId)

  if (error) return { error: "Speichern fehlgeschlagen: " + error.message }

  revalidatePath(`/admin/customers/${customerId}`)
  revalidatePath("/admin/customers")
  return {}
}

export async function updateCustomerStatus(
  customerId: string,
  status: CustomerStatus,
): Promise<{ error?: string }> {
  if (!ALLOWED_CUSTOMER_STATUSES.includes(status)) {
    return { error: "Ungültiger Statuswert." }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht eingeloggt." }

  const { error } = await supabase
    .from("customers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", customerId)

  if (error) return { error: "Status konnte nicht gespeichert werden: " + error.message }

  revalidatePath(`/admin/customers/${customerId}`)
  revalidatePath("/admin/customers")
  return {}
}


export async function addCustomerNote(customerId: string, content: string): Promise<{ error?: string }> {
  const trimmed = content.trim()
  if (!trimmed)          return { error: "Notiz darf nicht leer sein." }
  if (trimmed.length > 2000) return { error: "Notiz zu lang (max. 2000 Zeichen)." }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht eingeloggt." }

  const { error } = await supabase.from("customer_notes").insert({
    customer_id: customerId,
    content:     trimmed,
    is_internal: true,
    author_id:   user.id,
  })

  if (error) return { error: "Speichern fehlgeschlagen: " + error.message }

  revalidatePath(`/admin/customers/${customerId}`)
  return {}
}
