import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PortalNav from "@/components/layouts/PortalNav"

export const metadata = { title: "UtilityHub | Mein Portal" }

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, customer_id, organization_id, password_changed")
    .eq("id", user.id)
    .single()

  // Staff and admins belong in /app, not /portal
  if (profile?.role === "admin" || profile?.role === "staff") redirect("/admin/dashboard")

  const navItems = [
    { href: "/portal/dashboard", label: "Dashboard", icon: "⊞"  },
    { href: "/portal/objects",   label: "Objekte",   icon: "🏢" },
    { href: "/portal/contracts", label: "Verträge",  icon: "📋" },
    { href: "/portal/contacts",  label: "Support",   icon: "🎧" },
  ]

  return (
    <PortalNav
      items={navItems}
      user={{
        name:  profile?.full_name ?? user.email ?? "",
        email: user.email ?? "",
        role:  "customer",
      }}
      portalType="portal"
      searchApiPath="/api/portal/search"
    >
      {children}
    </PortalNav>
  )
}
