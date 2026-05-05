import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2B Telefon-Setter gesucht – Remote Freelancer | Utility Hub",
  description: "Werde freier B2B Telefon-Setter bei Utility Hub. 100 % Remote, freie Zeiteinteilung, attraktive Provision (500–5.000 €/Monat), Quereinsteiger willkommen.",
  keywords: ["B2B Setter", "Telefon Setter", "Remote Vertrieb", "Freelancer Vertrieb", "Energie Vertrieb", "Kaltakquise Job", "Setter Job Remote"],
  alternates: { canonical: "https://utility-hub.one" },
  openGraph: {
    type: "website",
    url: "https://utility-hub.one",
    siteName: "Utility Hub",
    title: "B2B Telefon-Setter gesucht – Remote Freelancer | Utility Hub",
    description: "100 % Remote, freie Zeiteinteilung, attraktive Provision. Quereinsteiger willkommen. Jetzt per WhatsApp bewerben.",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "B2B Telefon-Setter gesucht – Remote Freelancer | Utility Hub",
    description: "100 % Remote, attraktive Provision, Quereinsteiger willkommen. Jetzt bewerben.",
  },
  robots: { index: true, follow: true },
};

const jobPostingSchema = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "B2B Telefon-Setter (Freelancer) – Energie-Vertrieb Remote",
  description:
    "Wir suchen hungrige Vertriebspersönlichkeiten für B2B-Kaltakquise im Energie-Bereich. Freie Zeiteinteilung, volles Onboarding, echte Aufstiegschancen. Quereinsteiger willkommen.",
  datePosted: "2026-05-01",
  validThrough: "2026-07-31",
  employmentType: ["CONTRACTOR", "PART_TIME", "FULL_TIME"],
  hiringOrganization: {
    "@type": "Organization",
    name: "Utility Hub",
    sameAs: "https://utility-hub.one",
  },
  jobLocation: {
    "@type": "Place",
    address: { "@type": "PostalAddress", addressCountry: "DE" },
  },
  jobLocationType: "TELECOMMUTE",
  applicantLocationRequirements: { "@type": "Country", name: "Deutschland" },
  baseSalary: {
    "@type": "MonetaryAmount",
    currency: "EUR",
    value: { "@type": "QuantitativeValue", minValue: 500, maxValue: 5000, unitText: "MONTH" },
  },
  skills: "B2B Kaltakquise, Telefonvertrieb, CRM, Kommunikation",
  qualifications: "Keine Vorerfahrung notwendig. Kommunikationsstärke und Begeisterungsfähigkeit erforderlich.",
  responsibilities:
    "B2B-Kaltakquise per Telefon im Bereich Energieversorgung. Terminvereinbarung und Qualifizierung von Interessenten.",
  industry: "Energieversorgung",
  workHours: "Freie Zeiteinteilung – Teilzeit oder Vollzeit möglich",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
