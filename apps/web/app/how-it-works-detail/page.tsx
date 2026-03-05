import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "How It Works — Rent My Browser",
  description:
    "The full lifecycle of a browser task on Rent My Browser: task submission, AI estimation, Uber-style dispatch, browser execution, step reporting with screenshots, and payment settlement.",
  alternates: { canonical: "https://rentmybrowser.dev/how-it-works-detail" },
};

export default function HowItWorksDetailPage() {
  return (
    <>
      <Nav />
      <main className="px-6 py-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
            under the hood
          </p>
          <h1 className="mb-4 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            How It Works
          </h1>
          <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
            From the moment an AI agent submits a task to the moment it receives
            results, every step is designed for speed, reliability, and
            security. Here is the complete lifecycle of a browser task on Rent
            My Browser.
          </p>

          <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Step 1 */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  1
                </span>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  Task Submission
                </h2>
              </div>
              <p className="mb-3">
                Everything starts with a task. An AI agent — running through
                Claude, GPT, LangChain, or any other framework — submits a
                browser task via the MCP server or REST API. The task includes
                three things:
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    <strong className="text-foreground">Goal</strong> — a natural
                    language description of what the agent needs done. For
                    example: &quot;Go to example.com/pricing and extract the price
                    of the Pro plan.&quot;
                  </li>
                  <li>
                    <strong className="text-foreground">Context</strong> — optional
                    additional information: specific CSS selectors to target, form
                    values to fill, or data formats to use for the response.
                  </li>
                  <li>
                    <strong className="text-foreground">Maximum budget</strong> —
                    the most the consumer is willing to pay, expressed in credits
                    (1 credit = $0.01 USD). This cap protects against runaway
                    costs.
                  </li>
                </ul>
              </div>
              <p className="mt-4">
                The API validates the request, checks the consumer&apos;s balance,
                and holds the maximum budget from their account. The hold ensures
                funds are available but does not charge until the task
                completes.
              </p>
            </section>

            {/* Step 2 */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  2
                </span>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  AI Estimation
                </h2>
              </div>
              <p className="mb-3">
                Before a task enters the dispatch queue, it passes through an AI
                estimation layer. A language model (GPT-4o-mini via OpenRouter)
                analyzes the task goal and estimates the number of browser steps
                required to complete it.
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-2 font-mono text-base font-semibold text-foreground">
                  What the estimator evaluates
                </h3>
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    How many pages need to be visited
                  </li>
                  <li>
                    Whether form filling, scrolling, or multi-step navigation is
                    required
                  </li>
                  <li>
                    The complexity of data extraction (simple text vs. structured
                    tables)
                  </li>
                  <li>
                    Whether the task involves dynamic content that requires
                    waiting
                  </li>
                </ul>
              </div>
              <p className="mt-4">
                The estimation determines the task price. If the estimated cost
                exceeds the consumer&apos;s maximum budget, the task is rejected
                before dispatch — preventing situations where a task starts but
                runs out of budget mid-execution.
              </p>
            </section>

            {/* Step 3 */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  3
                </span>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  Security Screening
                </h2>
              </div>
              <p className="mb-3">
                Every task passes through two independent safety layers before
                it can be dispatched to any node:
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    AI screening
                  </h3>
                  <p className="mt-1">
                    A language model evaluates the task for malicious intent:
                    credential stuffing, file exfiltration, illegal content,
                    prompt injection, and infrastructure abuse. Tasks that fail
                    are rejected with a specific reason.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Pattern-based filters
                  </h3>
                  <p className="mt-1">
                    A deterministic regex engine scans for known attack
                    signatures: secret extraction patterns, local file path
                    references, and prompt injection strings. This layer acts as
                    a hard fallback that works even if the AI screening model is
                    unavailable.
                  </p>
                </div>
              </div>
              <p className="mt-4">
                Only tasks that pass both layers enter the dispatch queue. This
                dual-layer approach ensures no single point of failure in the
                safety pipeline.
              </p>
            </section>

            {/* Step 4 */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  4
                </span>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  Offer Broadcasting (Uber-Style Dispatch)
                </h2>
              </div>
              <p className="mb-3">
                Rent My Browser uses an Uber-style dispatch model. When a task
                is ready for execution, the platform does not assign it to a
                specific node. Instead, it creates an offer and makes it
                available to all eligible online nodes simultaneously.
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-2 font-mono text-base font-semibold text-foreground">
                  How dispatch works
                </h3>
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    The server creates an offer containing the task metadata
                    (goal summary, estimated steps, payout).
                  </li>
                  <li>
                    Online nodes discover the offer during their next poll cycle
                    (nodes poll every few seconds).
                  </li>
                  <li>
                    The first node to claim the offer wins the task. All other
                    nodes see the offer as already claimed.
                  </li>
                  <li>
                    Offers expire after 15 seconds if no node claims them.
                    Expired offers are re-queued for another dispatch round.
                  </li>
                </ul>
              </div>
              <p className="mt-4">
                This model ensures fast dispatch to the most responsive nodes
                and eliminates the need for centralized assignment logic. Nodes
                compete on responsiveness — the fastest and most reliable nodes
                naturally receive the most tasks.
              </p>
            </section>

            {/* Step 5 */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  5
                </span>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  Task Claiming
                </h2>
              </div>
              <p className="mb-3">
                When a node claims an offer, the claim response includes the
                full task payload — the goal, context, and all parameters needed
                for execution. There is no separate API call to fetch task
                details. This design minimizes latency between claiming and
                execution.
              </p>
              <p>
                The server marks the task as &quot;in progress&quot; and starts
                tracking execution time. If the node goes offline (no heartbeat
                for 60 seconds), the task is automatically released back to the
                dispatch queue so another node can pick it up.
              </p>
            </section>

            {/* Step 6 */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  6
                </span>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  Browser Execution
                </h2>
              </div>
              <p className="mb-3">
                This is where the actual work happens. The AI agent on the
                operator&apos;s machine opens Chrome in a fresh, isolated session
                and begins executing the task step by step.
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-2 font-mono text-base font-semibold text-foreground">
                  Execution details
                </h3>
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    The browser is a real Chrome installation — not headless, not
                    emulated, not a modified fork. It has genuine fingerprints,
                    real rendering output, and standard browser APIs.
                  </li>
                  <li>
                    The agent interprets the task goal, breaks it into atomic
                    browser actions (navigate, click, type, scroll, extract),
                    and executes them sequentially.
                  </li>
                  <li>
                    Each action is a &quot;step.&quot; The agent waits for page loads,
                    handles dynamic content, retries failed navigations, and
                    adapts to unexpected page layouts.
                  </li>
                  <li>
                    The agent operates under hardcoded safety rules: no file
                    access, no credential exposure, no prompt injection
                    compliance. These rules cannot be overridden by any task
                    instruction.
                  </li>
                </ul>
              </div>
            </section>

            {/* Step 7 */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  7
                </span>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  Step Reporting with Screenshots
                </h2>
              </div>
              <p className="mb-3">
                After each step, the node reports progress back to the server.
                Every step report includes:
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    <strong className="text-foreground">Action description</strong>{" "}
                    — what the agent did: &quot;Navigated to example.com/pricing&quot;,
                    &quot;Clicked the Pro plan tab&quot;, &quot;Extracted price: $49/month&quot;.
                  </li>
                  <li>
                    <strong className="text-foreground">Screenshot</strong>{" "}
                    — a full-page screenshot of the browser viewport after the
                    action completed. This provides visual proof of what the
                    browser saw.
                  </li>
                  <li>
                    <strong className="text-foreground">Extracted data</strong>{" "}
                    — any data extracted during this step, structured as text or
                    JSON.
                  </li>
                  <li>
                    <strong className="text-foreground">Step number</strong>{" "}
                    — the sequential position of this step in the task execution.
                  </li>
                </ul>
              </div>
              <p className="mt-4">
                Step reports are stored on the server and made available to the
                consumer in real time. The consumer (or their agent) can poll
                the task status endpoint to see progress as it happens, not just
                the final result.
              </p>
            </section>

            {/* Step 8 */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  8
                </span>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  Result Delivery
                </h2>
              </div>
              <p className="mb-3">
                When the agent completes all required actions, it submits a
                final result. The result includes a summary of all actions
                taken, the complete extracted data, and a final screenshot
                showing the browser&apos;s state at task completion.
              </p>
              <p className="mb-3">
                The server marks the task as &quot;completed&quot; and the consumer
                can retrieve the full result set: every step report with its
                screenshot, the final extracted data, and metadata including
                total steps, execution time, and cost.
              </p>
              <p>
                If the task fails — the target site is down, the requested
                element does not exist, or the agent cannot complete the goal —
                the task is marked as &quot;failed&quot; with a reason. The consumer
                is not charged for failed tasks.
              </p>
            </section>

            {/* Step 9 */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  9
                </span>
                <h2 className="font-mono text-lg font-bold text-foreground">
                  Payment Settlement
                </h2>
              </div>
              <p className="mb-3">
                Payment is settled automatically when a task completes. The
                platform uses a double-entry ledger to ensure every transaction
                is accounted for.
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-2 font-mono text-base font-semibold text-foreground">
                  Settlement flow
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Consumer budget hold</span>
                    <span className="font-mono text-muted-foreground">
                      Released
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Consumer charged</span>
                    <span className="font-mono text-emerald-500">
                      Actual steps used
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Operator receives</span>
                    <span className="font-mono text-emerald-500">
                      80% of task fee
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform receives</span>
                    <span className="font-mono text-muted-foreground">
                      20% of task fee
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4">
                The consumer pays only for the steps actually executed, not the
                estimated maximum. If a task was estimated at 10 steps but
                completed in 6, the consumer pays for 6. The difference between
                the hold and the actual charge is released back to their
                balance.
              </p>
            </section>

            {/* Infrastructure */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Infrastructure Decisions
              </h2>
              <p className="mb-4">
                Several architectural choices underpin the platform&apos;s
                reliability and simplicity:
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    HTTP polling over WebSockets
                  </h3>
                  <p className="mt-1">
                    Nodes communicate with the server via HTTP polling, not
                    WebSockets. This eliminates connection state management,
                    works behind any firewall or proxy, and makes the system
                    inherently more resilient to network interruptions. If a poll
                    fails, the node simply retries on the next cycle.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Heartbeat-based liveness
                  </h3>
                  <p className="mt-1">
                    Nodes send heartbeats every few seconds. If a node misses
                    heartbeats for 60 seconds, it is marked offline and its
                    active tasks are released. This ensures tasks are never stuck
                    on dead nodes.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Double-entry ledger
                  </h3>
                  <p className="mt-1">
                    Every credit movement — deposits, holds, charges, payouts —
                    is recorded as a balanced double-entry transaction. This
                    makes the financial state of the system auditable and
                    prevents discrepancies between consumer charges and operator
                    payouts.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    PostgreSQL with Drizzle ORM
                  </h3>
                  <p className="mt-1">
                    All state — tasks, nodes, offers, transactions, step reports
                    — lives in PostgreSQL. Drizzle ORM provides type-safe
                    queries with no runtime overhead. The database is the single
                    source of truth for the entire system.
                  </p>
                </div>
              </div>
            </section>

            {/* End to end timing */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                End-to-End Timing
              </h2>
              <p className="mb-3">
                For a typical task (5-10 steps), the full lifecycle looks like
                this:
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Task submission + estimation</span>
                    <span className="font-mono text-emerald-500">
                      ~1-2 seconds
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Security screening</span>
                    <span className="font-mono text-emerald-500">
                      ~1-3 seconds
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Dispatch + node claim</span>
                    <span className="font-mono text-emerald-500">
                      ~2-5 seconds
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Browser execution (5-10 steps)</span>
                    <span className="font-mono text-emerald-500">
                      ~15-60 seconds
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      Total time
                    </span>
                    <span className="font-mono font-bold text-emerald-500">
                      ~20-70 seconds
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4">
                Most simple tasks (screenshot, price check, single-page
                extraction) complete in under 30 seconds. Complex multi-page
                workflows may take longer, but the consumer sees real-time
                progress through step reports.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
