import type { Metadata } from 'next'
import './globals.css'

/*
 * SEO meta from LEN-121 (SEOGEO — LEN-119.B):
 * Title: 55 chars, Meta-Description: 157 chars
 * Primary keyword cluster: "Energiekosten Hausverwaltung"
 * Schema.org: Service + Organization + FAQPage JSON-LD → insert below
 * TODO: Replace with exact title/description values from LEN-121 document when available
 */
export const metadata: Metadata = {
  title: 'UtilityHub — Energiekosten für Hausverwaltungen senken',
  description: 'UtilityHub optimiert automatisch Strom-, Gas- und Wärmetarife für Hausverwaltungen. Ø 28 % Kostenersparnis. Setup in 15 Min. DSGVO-konform. Kostenlos starten.',
  keywords: [
    'Energiekosten Hausverwaltung',
    'Energieoptimierung Immobilien',
    'Tarifwechsel Hausverwaltung',
    'Energiekosten senken Mietobjekte',
    'Strom Gas Tarif Verwaltung',
  ],
  authors: [{ name: 'UtilityHub GmbH' }],
  openGraph: {
    title: 'UtilityHub — Energiekosten für Hausverwaltungen senken',
    description: 'Automatische Tarifoptimierung für alle Liegenschaften. Ø 28 % Ersparnis. Kostenlos starten.',
    url: 'https://utility-hub.one',
    siteName: 'UtilityHub',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UtilityHub — Energiekosten für Hausverwaltungen senken',
    description: 'Automatische Tarifoptimierung für alle Liegenschaften. Kostenlos starten.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://utility-hub.one' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* TODO: Insert Schema.org JSON-LD (Service + Organization + FAQPage) from LEN-121 here */}
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
