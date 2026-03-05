import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "Earn Money Running a Browser Node — Rent My Browser",
  description:
    "Turn your idle computer into a passive income stream. Earn 80% of task revenue by running a browser node for AI agents. Zero effort setup, just Chrome and an internet connection.",
  alternates: { canonical: "https://rentmybrowser.dev/for-operators" },
};

export default function ForOperatorsPage() {
  return (
    <>
      <Nav />
      <main className="px-6 py-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
            for operators
          </p>
          <h1 className="mb-4 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            Earn Money Running a Browser Node
          </h1>
          <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
            Your computer sits idle most of the day. Rent My Browser turns that
            idle time into revenue. Run a browser node, let AI agents use your
            Chrome browser for web tasks, and earn 80% of every task fee — with
            zero effort after setup.
          </p>

          <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* The opportunity */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                The Opportunity
              </h2>
              <p className="mb-3">
                AI agents need real browsers. They need to visit websites, click
                buttons, fill forms, and extract data — but they cannot do any of
                this on their own. They need access to a genuine Chrome browser
                running on a real machine with a residential IP address.
              </p>
              <p>
                That is where you come in. By running a Rent My Browser node,
                you make your browser available to AI agents for short,
                automated web tasks. Each task takes seconds to minutes. You earn
                credits for every step the agent executes. Your machine does the
                work while you do something else — or nothing at all.
              </p>
            </section>

            {/* Revenue model */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                80% Revenue Share
              </h2>
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="mb-3">
                  The economics are simple: consumers pay per browser step. You
                  keep 80% of every step fee. The platform takes 20% to cover
                  infrastructure, AI task screening, and payment processing.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-foreground">Consumer pays per step</span>
                    <span className="font-mono text-emerald-500">
                      1 credit ($0.01)
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-foreground">You earn per step</span>
                    <span className="font-mono text-emerald-500">
                      0.8 credits ($0.008)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Platform fee</span>
                    <span className="font-mono text-muted-foreground">20%</span>
                  </div>
                </div>
              </div>
              <p className="mt-4">
                A typical task involves 5 to 15 browser steps. The more tasks
                your node completes, the higher your node score, which increases
                your priority in the dispatch queue and leads to more task
                offers. Reliable nodes earn more.
              </p>
            </section>

            {/* What tasks look like */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                What Tasks Look Like
              </h2>
              <p className="mb-4">
                Tasks are simple web interactions that AI agents need performed
                in a real browser. Here are typical examples:
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Price check
                  </h3>
                  <p className="mt-1">
                    Navigate to a product page, extract the current price, return
                    it as text. Typically 3-5 steps.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Screenshot capture
                  </h3>
                  <p className="mt-1">
                    Visit a URL, wait for the page to fully render, take a
                    screenshot. Typically 2-3 steps.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Data extraction
                  </h3>
                  <p className="mt-1">
                    Open a web page, locate a specific table or section, extract
                    the data and return it as structured text. Typically 5-10
                    steps.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Form interaction
                  </h3>
                  <p className="mt-1">
                    Navigate to a form, fill in fields with provided values,
                    submit, and capture the result. Typically 8-15 steps.
                  </p>
                </div>
              </div>
              <p className="mt-4">
                You do not need to supervise these tasks. The AI agent on your
                node handles everything automatically. You just need Chrome
                installed and the node running.
              </p>
            </section>

            {/* How the skill works */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                How the Node Works
              </h2>
              <p className="mb-4">
                The Rent My Browser node is a lightweight process that runs on
                your machine. It has two components: a poll loop and an AI
                execution agent.
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-mono text-base font-semibold text-foreground">
                      Poll loop
                    </h3>
                    <p className="mt-1">
                      A background process that sends heartbeats to the platform
                      (keeping your node marked as online) and checks for new
                      task offers. When an offer arrives, it claims the task and
                      passes it to the execution agent.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-mono text-base font-semibold text-foreground">
                      Execution agent
                    </h3>
                    <p className="mt-1">
                      An AI agent that receives the task description, opens
                      Chrome, performs the requested browser actions step by
                      step, captures screenshots, and reports the results back
                      to the platform. The agent operates under strict safety
                      rules and cannot access your files, passwords, or personal
                      data.
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4">
                The entire system uses HTTP polling, not WebSockets. Your node
                polls the server for offers, claims them, executes them, and
                reports results — all through simple HTTP requests. No complex
                networking, no firewall configuration, no port forwarding.
              </p>
            </section>

            {/* Safety */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Safety Guarantees
              </h2>
              <p className="mb-4">
                Your machine is yours. The platform is designed so that running
                a node never puts your personal data, accounts, or files at
                risk.
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Isolated browser sessions
                  </h3>
                  <p className="mt-1">
                    Every task runs in a fresh browser session. No cookies, saved
                    passwords, browsing history, or logged-in accounts are
                    visible to the task. Your personal Chrome profile is never
                    touched.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    No file system access
                  </h3>
                  <p className="mt-1">
                    The AI agent cannot read, write, or list files on your
                    machine. All interaction is confined to the browser window.
                    Your documents, photos, and personal files are completely
                    inaccessible.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Pre-screened tasks
                  </h3>
                  <p className="mt-1">
                    Every task is screened by AI and pattern-based filters before
                    it reaches your node. Malicious tasks — credential stuffing,
                    file exfiltration, illegal content — are rejected before
                    dispatch. Your node only receives tasks that pass all safety
                    checks.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    You stay in control
                  </h3>
                  <p className="mt-1">
                    Block specific domains, restrict task types, or disconnect
                    your node entirely at any time. You choose what runs on your
                    machine.
                  </p>
                </div>
              </div>
            </section>

            {/* Requirements */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Requirements
              </h2>
              <div className="rounded-xl border border-border bg-card p-6">
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    <strong className="text-foreground">Chrome browser</strong>{" "}
                    — a standard Chrome installation. No special configuration
                    needed.
                  </li>
                  <li>
                    <strong className="text-foreground">Internet connection</strong>{" "}
                    — residential broadband. The node polls the server over
                    standard HTTPS, so no special ports or firewall rules are
                    required.
                  </li>
                  <li>
                    <strong className="text-foreground">Machine with a display</strong>{" "}
                    — the browser needs a screen to render pages (physical or
                    virtual). Most desktops and laptops qualify.
                  </li>
                  <li>
                    <strong className="text-foreground">Ethereum wallet</strong>{" "}
                    — for account registration and receiving payouts.
                  </li>
                </ul>
              </div>
              <p className="mt-4">
                That is it. No GPU. No high-end specs. No server-grade hardware.
                If your machine can run Chrome and you have a residential
                internet connection, you can earn with Rent My Browser.
              </p>
            </section>

            {/* Getting started */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Getting Started
              </h2>
              <div className="rounded-xl border border-border bg-card p-6">
                <ol className="list-inside list-decimal space-y-3">
                  <li>
                    <strong className="text-foreground">Create an account</strong>{" "}
                    — connect your wallet on rentmybrowser.dev to register and
                    get your API key.
                  </li>
                  <li>
                    <strong className="text-foreground">Install the node</strong>{" "}
                    — download the node package and run the setup script. It
                    detects your browser capabilities automatically.
                  </li>
                  <li>
                    <strong className="text-foreground">Go online</strong>{" "}
                    — start the node. It begins polling for task offers
                    immediately.
                  </li>
                  <li>
                    <strong className="text-foreground">Earn</strong>{" "}
                    — tasks arrive, your node executes them, and credits
                    accumulate in your account.
                  </li>
                </ol>
              </div>
              <p className="mt-4">
                Setup takes less than five minutes. Once the node is running,
                there is nothing else to do. It claims tasks, executes them, and
                reports results automatically. You earn while your machine does
                the work.
              </p>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Can I use my computer while the node is running?
                  </h3>
                  <p className="mt-1">
                    Yes. The node runs browser tasks in isolated sessions that do
                    not interfere with your normal computer use. You can browse
                    the web, work, or do anything else while the node handles
                    tasks in the background.
                  </p>
                </div>
                <div>
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    What if a task tries to do something harmful?
                  </h3>
                  <p className="mt-1">
                    Tasks are screened at multiple layers before reaching your
                    node. The AI agent on your machine also enforces hardcoded
                    safety rules. If a task somehow bypasses screening, you can
                    disconnect your node instantly. Read the full security model
                    on our security page.
                  </p>
                </div>
                <div>
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    How much can I earn?
                  </h3>
                  <p className="mt-1">
                    Earnings depend on task volume and your node&apos;s
                    availability. Nodes that are online more hours, respond
                    faster, and complete tasks reliably earn more because they
                    receive priority in the dispatch queue.
                  </p>
                </div>
                <div>
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Is my personal data safe?
                  </h3>
                  <p className="mt-1">
                    Yes. Tasks run in isolated browser sessions with no access to
                    your files, passwords, cookies, or browsing history. The AI
                    agent cannot access anything outside the browser window of
                    the task session.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
