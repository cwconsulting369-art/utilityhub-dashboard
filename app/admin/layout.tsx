import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import PortalNav from "@/components/layouts/PortalNav"
import { SidebarUpload } from "@/components/layouts/SidebarUpload"
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist"

export const metadata = { title: "UtilityHub | Intern" }

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (profile?.role === "customer") redirect("/portal/dashboard")
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) redirect("/unauthorized")

  // Eingang badge: documents not yet assigned to a target customer/Hauptordner
  const admin = createAdminClient()
  const { count: unassignedCount } = await admin
    .from("customer_documents")
    .select("id", { count: "exact", head: true })
    .eq("assigned", false)
  const inboxCount = unassignedCount ?? 0

  const navItems = [
    { href: "/admin/dashboard",    label: "Dashboard",     icon: "⊞"  },
    { href: "/app/customers",    label: "Objekte",        icon: "🏠" },
    { href: "/app/contacts",     label: "Kontakte",       icon: "👥" },
    { href: "/app/opportunities",label: "FG Finanz",      icon: "💼" },
    { href: "/app/incentives",   label: "Incentives",     icon: "🎁" },
    { href: "/app/imports",      label: "Imports",        icon: "📥" },
    { href: "/app/documents",    label: "Dokumente",      icon: "📁", badge: inboxCount },
    { href: "/app/roadmap",       label: "Roadmap",        icon: "🗺"  },
    { href: "/app/settings",     label: "Einstellungen",  icon: "⚙"  },
    { href: "/app/support",      label: "Support",        icon: "💬" },
  ]

  return (
    <>
      <PortalNav
        items={navItems}
        user={{
          name:  profile?.full_name ?? user.email ?? "",
          email: user.email ?? "",
          role:  profile?.role ?? "staff",
        }}
        portalType="admin"
        sidebarBottom={<SidebarUpload />}
      >
        {children}
      </PortalNav>
      <OnboardingChecklist userId={user.id} />
    </>
  )
}
