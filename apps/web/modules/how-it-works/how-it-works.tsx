import { GlobeWithStats } from "@/modules/hero/globe-with-stats";
import { Button } from "@/components/ui/button";
import { BeforeAfter } from "./before-after";

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
      {/* Before / After comparison */}
      <BeforeAfter />

      {/* Globe + earn section */}
      <div className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="mx-auto w-full max-w-lg lg:max-w-none">
              <GlobeWithStats />
            </div>

            <div className="text-center lg:text-left">
              <p className="mb-3 font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
                global browser network
              </p>
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                your machine works.{" "}
                <span className="text-muted-foreground">you get paid.</span>
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-base text-muted-foreground md:text-lg lg:mx-0">
                Connect your machine and start earning. AI agents need real
                browsers for tasks that headless can&apos;t handle. You earn 80%
                of every task completed on your node.
              </p>

              <div className="mx-auto max-w-sm space-y-4 text-left lg:mx-0 lg:max-w-none">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-500">
                    $
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">Passive income</h3>
                    <p className="text-sm text-muted-foreground">
                      Your idle machine earns money while you sleep, work, or
                      browse.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-500">
                    ~
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">Zero effort</h3>
                    <p className="text-sm text-muted-foreground">
                      Install once with one command. Tasks run automatically in
                      the background.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-500">
                    !
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">Safe by design</h3>
                    <p className="text-sm text-muted-foreground">
                      All tasks are AI-screened. Malicious, illegal, or harmful
                      tasks are automatically rejected.
                    </p>
                  </div>
                </div>
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
              MCP integration. REST API. Let your agent rent a real browser in
              one call.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-emerald-600 px-6 text-white hover:bg-emerald-500"
              >
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
