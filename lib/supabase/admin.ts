import { createClient } from "@supabase/supabase-js"

// SERVER-ONLY — bypasses RLS completely.
// Use only in Route Handlers or Server Actions for admin/import operations.
// NEVER import in Client Components or expose via NEXT_PUBLIC_.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
