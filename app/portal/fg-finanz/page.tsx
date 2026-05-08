import { PortalContactsSection } from "@/components/portal/PortalContactsSection"
import { FgFinanzContent }        from "@/components/portal/FgFinanzContent"

export const metadata = { title: "FG Finanz | UtilityHub" }

export default function PortalFgFinanzPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <FgFinanzContent />
      <PortalContactsSection />
    </div>
  )
}
