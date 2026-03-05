export function BeforeAfter() {
  return (
    <div className="border-b border-border py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight md:text-4xl">
          headless browsers get blocked.{" "}
          <span className="text-emerald-500">real ones don&apos;t.</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          CAPTCHAs, fingerprinting, rate limits, TLS checks — sites are built to
          stop automated access. A real browser on a real machine bypasses all of
          it.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Before — headless */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-xs text-red-400">
                x
              </span>
              <span className="font-mono text-sm font-semibold text-red-400">
                headless browser
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-lg bg-background/50 p-3">
                <div className="mb-1 text-muted-foreground">
                  $ puppeteer.goto(&quot;amazon.com&quot;)
                </div>
                <div className="text-red-400">
                  ERR: Access Denied — automated browser detected
                </div>
              </div>
              <div className="rounded-lg bg-background/50 p-3">
                <div className="mb-1 text-muted-foreground">
                  $ playwright.goto(&quot;zillow.com/search&quot;)
                </div>
                <div className="text-red-400">
                  ERR: CAPTCHA challenge required
                </div>
              </div>
              <div className="rounded-lg bg-background/50 p-3">
                <div className="mb-1 text-muted-foreground">
                  $ fetch(&quot;instagram.com/api/...&quot;)
                </div>
                <div className="text-red-400">ERR: 429 Rate Limited</div>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <p>
                - navigator.webdriver ={" "}
                <span className="text-red-400">true</span>
              </p>
              <p>
                - headless Chrome fingerprint{" "}
                <span className="text-red-400">detected</span>
              </p>
              <p>
                - datacenter IP{" "}
                <span className="text-red-400">flagged</span>
              </p>
            </div>
          </div>

          {/* After — real browser */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
                +
              </span>
              <span className="font-mono text-sm font-semibold text-emerald-400">
                rent my browser
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-lg bg-background/50 p-3">
                <div className="mb-1 text-muted-foreground">
                  goal: &quot;Get iPhone 16 price on Amazon&quot;
                </div>
                <div className="text-emerald-400">
                  + step 1: navigated to amazon.com
                </div>
                <div className="text-emerald-400">
                  + step 2: searched &quot;iPhone 16 Pro Max&quot;
                </div>
                <div className="text-emerald-400">
                  + step 3: extracted price = $1,199.00
                </div>
              </div>
              <div className="rounded-lg bg-background/50 p-3">
                <div className="mb-1 text-muted-foreground">
                  goal: &quot;Get listings in Austin, TX under $500k&quot;
                </div>
                <div className="text-emerald-400">
                  + extracted 47 listings with price, address, sqft
                </div>
              </div>
              <div className="rounded-lg bg-background/50 p-3">
                <div className="mb-1 text-muted-foreground">
                  goal: &quot;Get follower count for @openai&quot;
                </div>
                <div className="text-emerald-400">
                  + followers: 4.2M, following: 32, posts: 891
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <p>
                - real Chrome on real machine{" "}
                <span className="text-emerald-400">undetectable</span>
              </p>
              <p>
                - residential IP{" "}
                <span className="text-emerald-400">clean</span>
              </p>
              <p>
                - real cookies &amp; fingerprint{" "}
                <span className="text-emerald-400">human-like</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
