import Footer from './components/Footer'
import ClientSections from './components/ClientSections'

/*
 * UH Marketing Landing — LEN-123 (Phase 3, LEN-119)
 * SPEC section order (LEN-122/ARCHITECT):
 *   StickyNav → Hero → TrustStrip → Problem → Solution →
 *   KPIGrid → ProcessSteps → Testimonials → CTA → FAQ → Footer
 *
 * StickyNav is in ClientSections (Framer Motion AnimatePresence requires ssr:false).
 * Footer has no Framer Motion — stays server-rendered.
 *
 * Open items:
 *   - Higgsfield images → swap placeholders when Carlos delivers
 *   - CTA form endpoint → wire up when confirmed
 *   - Testimonial quotes → replace with real customer text
 *   - Schema.org JSON-LD → from LEN-121 → insert in layout.tsx <head>
 */
export default function Home() {
  return (
    <>
      <main>
        <ClientSections />
      </main>
      <Footer />
    </>
  )
}
