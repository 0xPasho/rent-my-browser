import { Nav } from "@/modules/layout/nav";
import { Hero } from "@/modules/hero/hero";
import { HowItWorks } from "@/modules/how-it-works/how-it-works";
import { Pricing } from "@/modules/pricing/pricing";
import { ForOperators } from "@/modules/operators/for-operators";
import { FAQ } from "@/modules/faq/faq";
import { PoweredBy } from "@/modules/trust/powered-by";
import { Footer } from "@/modules/layout/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Pricing />
        <ForOperators />
        <FAQ />
        <PoweredBy />
      </main>
      <Footer />
    </>
  );
}
