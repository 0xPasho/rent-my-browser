import { Globe } from "@/modules/hero/globe";
import { Button } from "@/components/ui/button";

const useCases = [
  {
    title: "Extract data from protected sites",
    description:
      "Prices, listings, reviews — from sites that block scrapers and require real sessions.",
  },
  {
    title: "Fill forms & create accounts",
    description:
      "Sign-ups, applications, checkouts — on sites with CAPTCHAs and bot detection.",
  },
  {
    title: "Monitor & automate workflows",
    description:
      "Track inventory, check availability, trigger actions — across any website, undetected.",
  },
];

const steps = [
  {
    number: "01",
    title: "Submit a task",
    description:
      "Send a goal in plain English via API or MCP. Set a budget in credits.",
    detail: "curl api.rentmybrowser.ai/tasks",
  },
  {
    number: "02",
    title: "Real browser executes",
    description:
      "An idle machine picks up the task. Real Chromium, real cookies, real IP.",
    detail: "no headless flags, no detection",
  },
  {
    number: "03",
    title: "Get results back",
    description:
      "Screenshots, extracted data, confirmation IDs — delivered to your agent.",
    detail: "pay only for steps executed",
  },
];

const howSteps = [
  {
    title: "top up your account",
    description:
      "top up credits via API, MCP, or on the website. no subscriptions, no minimums.",
  },
  {
    title: "send a task via API or MCP",
    description:
      "describe what you need in plain English. set a max budget in credits.",
  },
  {
    title: "a real browser executes it",
    description:
      "an idle node picks up your task. real Chromium, real cookies, residential IP.",
  },
  {
    title: "get results back",
    description:
      "screenshots, extracted data, confirmation IDs. only pay for steps executed.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works">
      {/* Steps strip */}
      <div className="border-b border-border py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-0 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative px-6 py-6">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-[2.75rem] hidden h-px w-6 bg-emerald-500/30 md:block" />
                )}

                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 font-mono text-xs text-emerald-500">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>

                <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <p className="font-mono text-xs text-emerald-500/60">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Globe + use cases */}
      <div className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="mx-auto w-full max-w-lg lg:max-w-none">
              <Globe />
            </div>

            <div className="text-center lg:text-left">
              <p className="mb-3 font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
                what agents use your browser for
              </p>
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                your machine works.{" "}
                <span className="text-muted-foreground">you get paid.</span>
              </h2>
              <p className="mb-8 max-w-lg text-base text-muted-foreground md:text-lg">
                Connect your OpenClaw and start earning. AI agents need
                real browsers for tasks that headless can&apos;t handle.
              </p>

              <div className="space-y-5">
                {useCases.map((uc) => (
                  <div key={uc.title} className="flex items-start gap-3">
                    <span className="mt-1 text-emerald-500">&#8226;</span>
                    <div>
                      <h3 className="text-sm font-semibold">{uc.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {uc.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For agents — integration banner */}
      <div className="border-y border-border py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="mb-2 font-mono text-lg font-semibold">
              for AI agents
            </h3>
            <p className="mb-6 text-muted-foreground">
              MCP integration. REST API. let your agent rent a real browser in
              one call.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-emerald-600 px-6 text-white hover:bg-emerald-500">
                <a href="/api-docs">API docs</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-border px-6 hover:bg-secondary"
              >
                <a href="/mcp">MCP setup</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How it works — numbered list */}
      <div className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-mono text-2xl font-bold tracking-tight md:text-3xl">
            how it works
          </h2>

          <div className="space-y-4">
            {howSteps.map((step, i) => (
              <div
                key={step.title}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-mono text-base font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
