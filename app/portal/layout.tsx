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
    { href: "/portal/dashboard", label: "Dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
    { href: "/portal/objects",   label: "Objekte",   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21V12h6v9"/></svg> },
    { href: "/portal/fg-finanz", label: "FG Finanz", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { href: "/portal/contacts",  label: "Support",   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg> },
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
