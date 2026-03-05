import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "Rent My Browser vs Headless Browsers — Rent My Browser",
  description:
    "Compare Rent My Browser with Puppeteer, Playwright, BrowserBase, and traditional web scraping. Real browsers, residential IPs, no bot detection, pay-per-step pricing.",
  alternates: { canonical: "https://rentmybrowser.dev/compare" },
};

export default function ComparePage() {
  return (
    <>
      <Nav />
      <main className="px-6 py-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
            comparison
          </p>
          <h1 className="mb-4 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            Rent My Browser vs the Alternatives
          </h1>
          <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
            There are many ways to automate browser tasks. Headless browsers,
            cloud browser platforms, HTTP scrapers — each has tradeoffs. Here is
            how Rent My Browser compares, and why real browsers on real machines
            solve problems that other approaches cannot.
          </p>

          <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Comparison table */}
            <section>
              <h2 className="mb-4 font-mono text-lg font-bold text-foreground">
                At a Glance
              </h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="px-4 py-3 font-mono font-semibold text-foreground">
                        Feature
                      </th>
                      <th className="px-4 py-3 font-mono font-semibold text-emerald-500">
                        Rent My Browser
                      </th>
                      <th className="px-4 py-3 font-mono font-semibold text-foreground">
                        Headless (Puppeteer/Playwright)
                      </th>
                      <th className="px-4 py-3 font-mono font-semibold text-foreground">
                        Cloud Browsers
                      </th>
                      <th className="px-4 py-3 font-mono font-semibold text-foreground">
                        HTTP Scrapers
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">
                        Real browser fingerprints
                      </td>
                      <td className="px-4 py-3 text-emerald-500">Yes</td>
                      <td className="px-4 py-3">No</td>
                      <td className="px-4 py-3">Partial</td>
                      <td className="px-4 py-3">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">
                        Residential IPs
                      </td>
                      <td className="px-4 py-3 text-emerald-500">Yes</td>
                      <td className="px-4 py-3">No (data center)</td>
                      <td className="px-4 py-3">No (data center)</td>
                      <td className="px-4 py-3">No (data center)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">
                        Bot detection bypass
                      </td>
                      <td className="px-4 py-3 text-emerald-500">Native</td>
                      <td className="px-4 py-3">Easily detected</td>
                      <td className="px-4 py-3">Varies</td>
                      <td className="px-4 py-3">Blocked on most sites</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">
                        JavaScript rendering
                      </td>
                      <td className="px-4 py-3 text-emerald-500">Full</td>
                      <td className="px-4 py-3">Full</td>
                      <td className="px-4 py-3">Full</td>
                      <td className="px-4 py-3">None</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">
                        Infrastructure needed
                      </td>
                      <td className="px-4 py-3 text-emerald-500">None</td>
                      <td className="px-4 py-3">Servers + browsers</td>
                      <td className="px-4 py-3">None</td>
                      <td className="px-4 py-3">Servers</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">
                        Pricing model
                      </td>
                      <td className="px-4 py-3 text-emerald-500">Per step</td>
                      <td className="px-4 py-3">Server costs</td>
                      <td className="px-4 py-3">Per minute / per session</td>
                      <td className="px-4 py-3">Per request</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">
                        AI agent integration
                      </td>
                      <td className="px-4 py-3 text-emerald-500">
                        MCP + REST
                      </td>
                      <td className="px-4 py-3">Custom code</td>
                      <td className="px-4 py-3">API</td>
                      <td className="px-4 py-3">API</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* vs Headless */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                vs Puppeteer and Playwright (Headless Browsers)
              </h2>
              <p className="mb-3">
                Puppeteer and Playwright are excellent tools for browser
                automation in controlled environments. They give you
                programmatic control over a Chromium instance, and they work
                well for testing your own applications or scraping sites that
                do not have bot detection.
              </p>
              <p className="mb-4">
                But the moment you point them at a site with modern anti-bot
                protection, they fail. Here is why:
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Detectable automation flags
                  </h3>
                  <p className="mt-1">
                    Headless Chrome sets the{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      navigator.webdriver
                    </code>{" "}
                    flag to true. Even with stealth plugins that try to hide
                    this, sophisticated detection systems check dozens of other
                    signals: missing browser plugins, inconsistent viewport
                    dimensions, absent audio/video codecs, and non-standard
                    WebGL renderer strings.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Data center IP addresses
                  </h3>
                  <p className="mt-1">
                    Headless browsers typically run on cloud servers with data
                    center IPs. IP reputation databases flag these ranges as
                    non-residential, triggering CAPTCHAs, rate limits, or
                    outright blocks. Proxy rotation helps but adds cost and
                    complexity.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Infrastructure burden
                  </h3>
                  <p className="mt-1">
                    Running headless browsers at scale requires provisioning
                    servers, managing browser processes, handling crashes,
                    updating Chrome versions, and monitoring resource usage. You
                    pay for compute time whether or not you are running tasks.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    TLS fingerprint mismatch
                  </h3>
                  <p className="mt-1">
                    The TLS handshake of a headless browser running on a Linux
                    server differs from a real Chrome instance on Windows or
                    macOS. JA3/JA4 fingerprinting catches this discrepancy,
                    revealing the automated nature of the connection before the
                    page even loads.
                  </p>
                </div>
              </div>
              <p className="mt-4">
                Rent My Browser avoids all of these issues. Tasks execute on
                real Chrome installations on real consumer machines. The browser
                fingerprint, TLS handshake, IP address, and rendering behavior
                are all genuine — because the browser is genuine.
              </p>
            </section>

            {/* vs Cloud Browsers */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                vs Cloud Browser Platforms (BrowserBase, etc.)
              </h2>
              <p className="mb-3">
                Cloud browser platforms give you remote access to browser
                instances running in data centers. They handle infrastructure
                management and provide APIs for browser automation. They are a
                step up from self-hosted headless browsers, but they share some
                fundamental limitations.
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Still data center IPs
                  </h3>
                  <p className="mt-1">
                    Cloud browsers run in AWS, GCP, or similar infrastructure.
                    The IP addresses are data center IPs, not residential. Sites
                    with geo-restrictions or IP reputation checks will still
                    flag or block these connections.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Standardized fingerprints
                  </h3>
                  <p className="mt-1">
                    Cloud browser instances share common configurations:
                    similar screen sizes, identical installed fonts, same GPU
                    renderers. When thousands of &quot;unique&quot; browsers produce
                    identical canvas fingerprints, detection systems notice.
                    Real browsers on diverse consumer hardware naturally produce
                    diverse, authentic fingerprints.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Time-based pricing
                  </h3>
                  <p className="mt-1">
                    Most cloud browser platforms charge per minute or per
                    session. If a page takes 10 seconds to load, you pay for
                    the idle wait time. Rent My Browser charges per step — you
                    pay for actions, not wall clock time.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    You still write the automation code
                  </h3>
                  <p className="mt-1">
                    Cloud browser platforms give you a remote browser, but you
                    still need to write Playwright/Puppeteer scripts to control
                    it. Rent My Browser is task-based: describe what you need in
                    natural language, and an AI agent figures out the browser
                    actions. No selectors, no scripts, no brittle automation
                    code.
                  </p>
                </div>
              </div>
            </section>

            {/* vs Traditional Scraping */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                vs Traditional Web Scraping (HTTP-Based)
              </h2>
              <p className="mb-3">
                HTTP-based scrapers — tools like requests, httpx, Scrapy, or
                BeautifulSoup — send raw HTTP requests and parse the HTML
                response. They are fast and lightweight, but they fundamentally
                cannot handle the modern web.
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    No JavaScript rendering
                  </h3>
                  <p className="mt-1">
                    HTTP scrapers receive the raw HTML before JavaScript
                    executes. On modern single-page applications, the raw HTML
                    is often an empty shell. The actual content — prices, product
                    listings, user reviews — is loaded dynamically by
                    JavaScript. HTTP scrapers simply cannot see it.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    No interaction capability
                  </h3>
                  <p className="mt-1">
                    HTTP scrapers cannot click buttons, fill forms, scroll
                    pages, select dropdown options, or interact with any UI
                    element. Tasks that require navigation through multi-step
                    flows are impossible without a real browser.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Trivially blocked
                  </h3>
                  <p className="mt-1">
                    HTTP requests from scrapers have no browser fingerprint at
                    all. They are immediately identifiable as automated traffic
                    by any bot detection system. Even basic rate limiting will
                    block them.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Brittle selectors
                  </h3>
                  <p className="mt-1">
                    HTTP scrapers rely on CSS selectors or XPath expressions to
                    extract data. When a website changes its HTML structure —
                    which happens frequently — the scraper breaks. Rent My
                    Browser uses AI to understand page content semantically,
                    adapting to layout changes without code updates.
                  </p>
                </div>
              </div>
            </section>

            {/* Key advantages */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Key Advantages of Rent My Browser
              </h2>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Genuine browser fingerprints
                  </h3>
                  <p className="mt-1">
                    Every task runs on a real Chrome installation that passes
                    every fingerprint check: canvas rendering, WebGL output,
                    audio context, installed fonts, browser plugins, and screen
                    dimensions. There is nothing to detect because there is
                    nothing fake.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Residential IP diversity
                  </h3>
                  <p className="mt-1">
                    Nodes are operated by individuals on residential internet
                    connections across different ISPs, cities, and countries.
                    Tasks naturally appear from diverse geographic locations with
                    clean IP reputations.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Natural execution patterns
                  </h3>
                  <p className="mt-1">
                    The AI agent operates the browser with human-like timing:
                    variable delays between actions, realistic scroll behavior,
                    natural mouse movements. Behavioral analysis systems see
                    patterns consistent with human browsing, not the
                    millisecond-precise timing of automated scripts.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Zero infrastructure
                  </h3>
                  <p className="mt-1">
                    No servers to provision. No browsers to manage. No proxies
                    to rotate. No Chrome versions to update. Submit a task, get
                    results. The operator network handles everything.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Pay-per-step pricing
                  </h3>
                  <p className="mt-1">
                    You pay for browser actions, not time. A 5-step task costs
                    the same whether the pages load in 2 seconds or 20 seconds.
                    No idle time charges, no session fees, no minimum
                    commitments.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    AI-native interface
                  </h3>
                  <p className="mt-1">
                    Describe tasks in natural language instead of writing
                    automation scripts. The AI agent figures out the browser
                    actions, handles unexpected page layouts, and adapts to
                    changes. No selectors to maintain, no code to update when
                    sites change.
                  </p>
                </div>
              </div>
            </section>

            {/* When to use what */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                When to Use What
              </h2>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-mono text-base font-semibold text-foreground">
                      Use Puppeteer/Playwright when:
                    </h3>
                    <p className="mt-1">
                      You are testing your own application, scraping sites with
                      no bot detection, or need sub-second latency in a
                      controlled environment. You have engineering resources to
                      maintain the infrastructure.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-mono text-base font-semibold text-foreground">
                      Use cloud browsers when:
                    </h3>
                    <p className="mt-1">
                      You need headless browser access without managing servers,
                      your targets have minimal bot detection, and you prefer
                      per-minute pricing over infrastructure costs.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-mono text-base font-semibold text-foreground">
                      Use HTTP scrapers when:
                    </h3>
                    <p className="mt-1">
                      Your targets are static HTML pages with no JavaScript
                      rendering, no bot detection, and you need to process
                      millions of pages at the lowest possible cost.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-mono text-base font-semibold text-emerald-500">
                      Use Rent My Browser when:
                    </h3>
                    <p className="mt-1">
                      Your target sites have bot detection. You need residential
                      IPs. You need real browser fingerprints. You want to
                      describe tasks in natural language instead of writing
                      automation code. You are building AI agents that need
                      browser access. You do not want to manage any
                      infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom line */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                The Bottom Line
              </h2>
              <p className="mb-3">
                The web was built for browsers. Bot detection systems are built
                to block everything that is not a browser. Headless browsers,
                cloud browser instances, and HTTP scrapers are all, to varying
                degrees, not real browsers — and detection systems know it.
              </p>
              <p>
                Rent My Browser is the only option that uses actual browsers on
                actual machines. There is no fingerprint to fake, no IP
                reputation to circumvent, no automation flag to hide. The
                browser is real, the machine is real, and the network is real.
                That is why it works where everything else gets blocked.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
