'use client'

import dynamic from 'next/dynamic'

/*
 * All Framer Motion sections loaded client-only (ssr: false).
 * Workaround: Framer Motion 12.x + React 19 + Next.js 16 useContext SSR bug.
 * SPEC section order: Hero → TrustStrip → Problem → Solution → KPI → Process → Testimonials → CTA → FAQ
 */
const StickyNavClient      = dynamic(() => import('./StickyNav'),            { ssr: false })
const HeroSection          = dynamic(() => import('./HeroSection'),          { ssr: false })
const TrustStrip           = dynamic(() => import('./TrustStrip'),           { ssr: false })
const ProblemSection       = dynamic(() => import('./ProblemSection'),       { ssr: false })
const SolutionSection      = dynamic(() => import('./SolutionSection'),      { ssr: false })
const KPIGrid              = dynamic(() => import('./KPIGrid'),              { ssr: false })
const ProcessSteps         = dynamic(() => import('./ProcessSteps'),         { ssr: false })
const TestimonialCarousel  = dynamic(() => import('./TestimonialCarousel'),  { ssr: false })
const CtaSection           = dynamic(() => import('./CtaSection'),           { ssr: false })
const FAQAccordion         = dynamic(() => import('./FAQAccordion'),         { ssr: false })

export default function ClientSections() {
  return (
    <>
      <StickyNavClient />
      <HeroSection />
      <TrustStrip />
      <ProblemSection />
      <SolutionSection />
      <KPIGrid />
      <ProcessSteps />
      <TestimonialCarousel />
      <CtaSection />
      <FAQAccordion />
    </>
  )
}
