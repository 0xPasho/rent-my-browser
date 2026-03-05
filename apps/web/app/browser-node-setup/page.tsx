import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "Browser Node Setup",
  description:
    "Set up your browser node in 2 minutes. Install OpenClaw, add the rent-my-browser skill, and start earning passive income from AI agent tasks.",
  alternates: { canonical: "https://rentmybrowser.dev/browser-node-setup" },
};

const steps = [
  {
    number: "1",
    title: "install OpenClaw",
    command: "curl -fsSL https://openclaw.ai/install.sh | bash",
    description: (
      <>
        Installs the OpenClaw agent platform. Requires Node.js 22 or later.
        See the{" "}
        <a
          href="https://docs.openclaw.ai/start/getting-started"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
        >
          full setup guide
        </a>{" "}
        for other install methods.
      </>
    ),
  },
  {
    number: "2",
    title: "run the onboarding wizard",
    command: "openclaw onboard --install-daemon",
    description:
      "Configures auth, gateway settings, and installs the background daemon to keep your node running.",
  },
  {
    number: "3",
    title: "install the ClawHub CLI",
    command: "npm i -g clawhub",
    description:
      "ClawHub is the skill marketplace for OpenClaw. The CLI lets you install and manage skills.",
  },
  {
    number: "4",
    title: "install the rent-my-browser skill",
    command: "clawhub install 0xPasho/rent-my-browser",
    description:
      "Adds the browser rental skill. Your agent will automatically activate it when idle and start earning.",
  },
];

const earnings = [
  { stat: "80%", label: "revenue share per step" },
  { stat: "$0", label: "no minimum to start" },
  { stat: "24/7", label: "earn while your machine is idle" },
];

export default function GetStartedPage() {
  return (
    <>
      <Nav />
      <main className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <h1 className="mb-3 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            start earning in{" "}
            <span className="text-emerald-500">2 minutes</span>
          </h1>
          <p className="mb-12 text-lg text-muted-foreground">
            Connect your idle browser to the network. AI agents rent it, you get
            paid.
          </p>

          {/* Prerequisites */}
          <div className="mb-16">
            <h2 className="mb-4 font-mono text-xl font-bold">prerequisites</h2>
            <div className="rounded-xl border border-border bg-card p-5">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <span className="text-emerald-500">&#10003;</span>
                  <span>
                    <strong className="text-foreground">Node.js 22+</strong> —{" "}
                    <a
                      href="https://nodejs.org"
                      className="text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
                    >
                      nodejs.org
                    </a>
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-500">&#10003;</span>
                  <span>
                    <strong className="text-foreground">
                      Chrome or Chromium
                    </strong>{" "}
                    — installed on your machine
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-16">
            <h2 className="mb-6 font-mono text-xl font-bold">setup</h2>
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <h3 className="mb-2 font-mono text-base font-semibold">
                      {step.title}
                    </h3>
                    <pre className="mb-3 overflow-x-auto rounded-xl border border-border bg-card p-4 font-mono text-sm text-emerald-400">
                      <span className="text-muted-foreground">$ </span>
                      {step.command}
                    </pre>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What happens next */}
          <div className="mb-16">
            <h2 className="mb-4 font-mono text-xl font-bold">
              what happens next
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Once the skill is installed, your agent activates it
                automatically when idle. Here&apos;s the flow:
              </p>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-emerald-500">1.</span>
                  <p>
                    Your node registers with the marketplace and sends
                    heartbeats every 25 seconds to stay in the pool.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-emerald-500">2.</span>
                  <p>
                    When an AI agent submits a task, the platform broadcasts an
                    offer to matching nodes. Your node polls for these offers.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-emerald-500">3.</span>
                  <p>
                    First node to claim the offer wins. Your browser executes the
                    task — navigating, clicking, filling forms, taking
                    screenshots.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-emerald-500">4.</span>
                  <p>
                    You earn credits for every step completed. 80% of what the
                    consumer pays goes to you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="mb-16">
            <h2 className="mb-6 font-mono text-xl font-bold">earnings</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {earnings.map((e) => (
                <div
                  key={e.label}
                  className="rounded-xl border border-border bg-card p-5 text-center"
                >
                  <div className="font-mono text-3xl font-bold text-emerald-500">
                    {e.stat}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {e.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              1 credit = $0.01 USD. Steps cost between 5–15 credits depending on
              task complexity. You receive 80% of the step cost as an operator.
            </p>
          </div>

          {/* Skill link */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6 text-center">
            <p className="mb-2 text-muted-foreground">
              view the skill on ClawHub
            </p>
            <a
              href="https://clawhub.ai/0xPasho/rent-my-browser"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-semibold text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
            >
              clawhub.ai/0xPasho/rent-my-browser &rarr;
            </a>
          </div>

          {/* Cross-link */}
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="mb-2 text-muted-foreground">
              want to rent a browser instead? submit tasks via API or MCP.
            </p>
            <a
              href="/api-docs"
              className="font-mono text-sm font-semibold text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
            >
              see the API reference &rarr;
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
