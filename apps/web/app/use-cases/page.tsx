import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "Use Cases — Rent My Browser",
  description:
    "Discover how AI agents use Rent My Browser for price monitoring, data extraction, form filling, competitive intelligence, automated testing, and more — all on real browsers with residential IPs.",
  alternates: { canonical: "https://rentmybrowser.dev/use-cases" },
};

const useCases = [
  {
    title: "Price Monitoring",
    keyword: "e-commerce",
    description:
      "Track product prices across hundreds of e-commerce sites without getting blocked. AI agents submit tasks that navigate to product pages, extract current prices, and return structured pricing data. Because tasks run on real browsers with genuine fingerprints and residential IPs, anti-bot systems treat the requests as normal user traffic.",
    how: "Your agent submits a task with a product URL and the goal \"extract the current price.\" A node opens the page in a real Chrome browser, waits for dynamic content to load, extracts the price from the rendered DOM, and returns it as structured JSON along with a screenshot for verification.",
  },
  {
    title: "Form Filling and Submission",
    keyword: "automation",
    description:
      "Automate repetitive form submissions across government portals, insurance quote engines, registration systems, and application platforms. AI agents describe the form fields and values, and a real browser fills and submits them — handling CAPTCHAs, multi-step flows, and JavaScript validation that headless browsers fail on.",
    how: "Your agent provides the target URL, form field mappings, and submission instructions. The node navigates to the page, fills each field with human-like timing, handles any interactive elements (dropdowns, date pickers, file uploads), and submits the form. Step-by-step screenshots confirm each action.",
  },
  {
    title: "Data Extraction and Web Scraping",
    keyword: "scraping",
    description:
      "Extract structured data from websites that actively block traditional scrapers. Job listings, real estate prices, flight costs, restaurant menus, public records — any data visible in a browser is accessible through the platform. No need to reverse-engineer APIs or maintain brittle CSS selectors.",
    how: "Describe what data you need in natural language. The AI agent on the node understands your request, navigates the site, handles pagination and infinite scroll, and returns the extracted data in the format you specify. The browser renders JavaScript, loads lazy content, and interacts with the page exactly as a human would.",
  },
  {
    title: "Competitive Intelligence",
    keyword: "research",
    description:
      "Monitor competitor websites for pricing changes, new product launches, feature updates, job postings, and marketing campaigns. Run daily or weekly checks across dozens of competitor properties without maintaining any scraping infrastructure. Get alerts when something changes.",
    how: "Submit recurring tasks that check specific competitor pages for changes. The node captures the current state (screenshot plus extracted text), and your agent compares it against previous results. Because each task runs on a different residential IP, rate limiting and geo-blocking are non-issues.",
  },
  {
    title: "Automated Testing and QA",
    keyword: "testing",
    description:
      "Run end-to-end browser tests on real machines with real browsers. Verify that your web application works correctly across different browser configurations, screen sizes, and network conditions — without maintaining a device lab or paying for cloud browser infrastructure.",
    how: "Your agent submits a sequence of steps: navigate to your app, click buttons, fill forms, verify that specific elements appear on screen. The node executes each step and returns screenshots at every stage. Failed assertions are captured with visual evidence, making debugging straightforward.",
  },
  {
    title: "Signup and Account Verification",
    keyword: "verification",
    description:
      "Verify that your signup flows, onboarding sequences, and email verification processes work correctly from the perspective of a real user on a real browser. Test OAuth flows, magic link authentication, and multi-factor setup without the artificial conditions of headless testing.",
    how: "Submit a task that walks through your signup process step by step. The node interacts with your application in a real browser environment, capturing screenshots at each stage. You get visual confirmation that every screen renders correctly and every redirect works as expected.",
  },
  {
    title: "Social Media Monitoring",
    keyword: "social",
    description:
      "Monitor public social media profiles, hashtags, trending topics, and public posts across platforms that aggressively block automated access. Track brand mentions, sentiment shifts, and emerging trends on platforms where API access is restricted or prohibitively expensive.",
    how: "Your agent submits tasks targeting specific public profiles or search queries on social platforms. The node opens the page in a real browser, scrolls through the feed, and extracts post text, engagement metrics, and timestamps. The residential IP and real browser fingerprint bypass bot detection systems.",
  },
  {
    title: "Lead Generation and Enrichment",
    keyword: "sales",
    description:
      "Gather publicly available business information from company websites, directories, and professional networks. Extract contact details, company descriptions, technology stacks, and employee counts from public pages — all through real browser sessions that pass bot detection.",
    how: "Provide a list of company websites or directory search queries. The node visits each page, extracts the publicly visible information you specified, and returns structured data. Multi-page workflows (search, paginate, visit each result) are handled automatically by the AI agent.",
  },
];

export default function UseCasesPage() {
  return (
    <>
      <Nav />
      <main className="px-6 py-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
            what you can build
          </p>
          <h1 className="mb-4 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            Use Cases
          </h1>
          <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
            Rent My Browser gives AI agents access to real browsers on real
            machines. That unlocks any workflow that requires a genuine browser
            session — from simple data extraction to complex multi-step
            automations that defeat bot detection.
          </p>

          <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Why real browsers */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Why Real Browsers Matter
              </h2>
              <p className="mb-3">
                Headless browsers and HTTP-based scrapers are easy to detect.
                They lack real browser fingerprints, run from data center IPs,
                and fail on JavaScript-heavy sites. The modern web is built to
                block automated access: CAPTCHAs, TLS fingerprinting, canvas
                detection, and behavioral analysis make traditional automation
                increasingly unreliable.
              </p>
              <p>
                Rent My Browser solves this by routing tasks to real Chrome
                instances running on real machines with residential IP addresses.
                To the target website, your task looks like a normal person
                browsing from home. No detection flags. No CAPTCHAs. No blocks.
              </p>
            </section>

            {/* Use case cards */}
            {useCases.map((uc) => (
              <section key={uc.title}>
                <h2 className="mb-1 font-mono text-lg font-bold text-foreground">
                  {uc.title}
                </h2>
                <p className="mb-3 font-mono text-xs uppercase tracking-widest text-emerald-500">
                  {uc.keyword}
                </p>
                <p className="mb-4">{uc.description}</p>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-2 font-mono text-base font-semibold text-foreground">
                    How it works
                  </h3>
                  <p>{uc.how}</p>
                </div>
              </section>
            ))}

            {/* Beyond these */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Beyond These Use Cases
              </h2>
              <p className="mb-3">
                Any task that a human can perform in a web browser can be
                automated through Rent My Browser. The platform is not limited
                to predefined workflows. Because tasks are described in natural
                language and executed by an AI agent, the range of possible
                automations is as broad as the web itself.
              </p>
              <p>
                If your use case involves navigating websites, clicking buttons,
                reading text, filling forms, taking screenshots, or extracting
                data — and you need it done on a real browser that passes bot
                detection — Rent My Browser is built for you.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
