import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

// Parse .env.local
const envRaw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
const env = {}
for (const line of envRaw.split("\n")) {
  const match = line.match(/^([^#\s][^=]*)=(.+)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const supabaseUrl      = env["NEXT_PUBLIC_SUPABASE_URL"]
const serviceRoleKey   = env["SUPABASE_SERVICE_ROLE_KEY"]

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const EMAIL    = "admin@utilityhub.local"
const PASSWORD = "UtilityHub2026!"

console.log(`Creating user: ${EMAIL}`)

const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
  email:         EMAIL,
  password:      PASSWORD,
  email_confirm: true,
})

if (createError) {
  console.error("Error creating auth user:", createError.message)
  process.exit(1)
}

console.log(`Auth user created: ${user.id}`)

// Trigger 013 auto-creates a profile with role='customer'.
// Update it to 'admin'.
const { error: profileError } = await supabase
  .from("profiles")
  .upsert({ id: user.id, full_name: "Admin", role: "admin" })

if (profileError) {
  console.error("Error updating profile:", profileError.message)
  process.exit(1)
}

console.log("Profile role set to: admin")
console.log("─────────────────────────────────────────────")
console.log(`E-Mail:   ${EMAIL}`)
console.log(`Passwort: ${PASSWORD}`)
console.log(`Rolle:    admin`)
console.log(`ID:       ${user.id}`)
console.log("─────────────────────────────────────────────")
