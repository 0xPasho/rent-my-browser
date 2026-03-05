import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Hero } from "@/modules/hero/hero";
import { HowItWorks } from "@/modules/how-it-works/how-it-works";
import { Pricing } from "@/modules/pricing/pricing";
import { ForOperators } from "@/modules/operators/for-operators";
import { Security } from "@/modules/security/security";
import { FAQ } from "@/modules/faq/faq";
import { PoweredBy } from "@/modules/trust/powered-by";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "rent my browser — real browsers for AI agents",
  description:
    "Your AI agent sends a task in plain English. A real browser on a real machine executes it. Get screenshots, extracted data, and results back via API. No CAPTCHAs, no bot detection, no blocking.",
  alternates: { canonical: "https://rentmybrowser.dev" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "rent my browser",
  url: "https://rentmybrowser.dev",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Marketplace where AI agents rent real browsers. Send a task in plain English, a real browser executes it, get screenshots and data back.",
  offers: {
    "@type": "Offer",
    price: "0.05",
    priceCurrency: "USD",
    description: "Per step pricing starting at $0.05",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Pricing />
        <ForOperators />
        <Security />
        <FAQ />
        <PoweredBy />
      </main>
      <Footer />
    </>
  );
}
