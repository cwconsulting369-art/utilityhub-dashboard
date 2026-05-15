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
    { href: "/portal/dashboard", label: "Dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { href: "/portal/objects",   label: "Objekte",   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-9h6v9"/></svg> },
    { href: "/portal/fg-finanz", label: "FG Finanz", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
    { href: "/portal/contacts",  label: "Support",   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
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
