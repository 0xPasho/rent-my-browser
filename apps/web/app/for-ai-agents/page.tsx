import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "Browser Automation for AI Agents — Rent My Browser",
  description:
    "Give your AI agent a real browser. Integrate with MCP or REST API. Compatible with Claude, GPT, LangChain, AutoGen, and CrewAI. Bypass bot detection with residential browsers.",
  alternates: { canonical: "https://rentmybrowser.dev/for-ai-agents" },
};

export default function ForAIAgentsPage() {
  return (
    <>
      <Nav />
      <main className="px-6 py-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 font-mono text-sm font-medium uppercase tracking-widest text-emerald-500">
            for developers
          </p>
          <h1 className="mb-4 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            Browser Automation for AI Agents
          </h1>
          <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
            Your AI agent can reason, plan, and generate code. But it cannot
            open a web browser. Rent My Browser gives any AI agent
            programmatic access to real Chrome browsers running on real machines
            — with residential IPs, genuine fingerprints, and zero bot
            detection.
          </p>

          <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* The Problem */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                The Problem: AI Agents Cannot Browse
              </h2>
              <p className="mb-3">
                Large language models are powerful reasoning engines, but they
                have no native ability to interact with the web. They cannot
                visit URLs, click buttons, fill forms, or read dynamically
                rendered content. When your agent needs live data from a website,
                it hits a wall.
              </p>
              <p className="mb-3">
                The common workaround — spawning a headless browser — creates
                its own problems. Headless browsers are trivially detected by
                modern anti-bot systems. They run from data center IPs. They
                lack realistic browser fingerprints. And they require you to
                provision, manage, and scale browser infrastructure.
              </p>
              <p>
                Rent My Browser eliminates both problems. Your agent gets a real
                browser on a real machine, accessed through a simple API call.
                No infrastructure to manage. No bot detection to fight.
              </p>
            </section>

            {/* Two integration paths */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Two Integration Paths
              </h2>
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-2 font-mono text-base font-semibold text-foreground">
                    MCP (Model Context Protocol)
                  </h3>
                  <p className="mb-3">
                    The fastest way to give your AI agent browser access. Our MCP
                    server exposes browser rental as a tool that any MCP-compatible
                    agent can call directly. The agent describes what it needs in
                    natural language, and the MCP server handles task creation,
                    dispatch, execution monitoring, and result retrieval.
                  </p>
                  <p className="mb-3">
                    MCP integration works out of the box with Claude Desktop,
                    Claude Code, and any agent framework that supports the Model
                    Context Protocol. No custom code required — just point your
                    agent at the MCP server and it gains browser capabilities
                    automatically.
                  </p>
                  <p className="font-mono text-xs text-emerald-500">
                    Best for: Claude-based agents, rapid prototyping, agents that
                    need browser access as one of many tools.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-2 font-mono text-base font-semibold text-foreground">
                    REST API
                  </h3>
                  <p className="mb-3">
                    Full programmatic control over every aspect of browser
                    rental. The REST API lets you create tasks, set budgets, poll
                    for status updates, retrieve step-by-step screenshots, and
                    access final results — all through standard HTTP endpoints
                    with JSON payloads.
                  </p>
                  <p className="mb-3">
                    The API is framework-agnostic. It works with any programming
                    language, any agent framework, and any orchestration tool.
                    Authenticate with an API key, submit a task, and poll for
                    results. That is the entire integration.
                  </p>
                  <p className="font-mono text-xs text-emerald-500">
                    Best for: custom agent frameworks, production deployments,
                    fine-grained control over task parameters.
                  </p>
                </div>
              </div>
            </section>

            {/* How it works for agents */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                How It Works
              </h2>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                      1
                    </span>
                    <div>
                      <h3 className="font-mono text-base font-semibold text-foreground">
                        Submit a task
                      </h3>
                      <p className="mt-1">
                        Your agent sends a task description in natural language:
                        &quot;Go to example.com and extract the pricing table.&quot;
                        Include a maximum budget in credits (1 credit = $0.01).
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                      2
                    </span>
                    <div>
                      <h3 className="font-mono text-base font-semibold text-foreground">
                        AI estimation
                      </h3>
                      <p className="mt-1">
                        The platform estimates the number of browser steps
                        required and validates the task against safety filters.
                        Tasks that pass screening enter the dispatch queue.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                      3
                    </span>
                    <div>
                      <h3 className="font-mono text-base font-semibold text-foreground">
                        Real browser execution
                      </h3>
                      <p className="mt-1">
                        An operator&apos;s node claims the task and executes it
                        in a real Chrome browser. The AI agent on the node
                        navigates pages, clicks elements, fills forms, and
                        extracts data — reporting progress at each step.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">
                      4
                    </span>
                    <div>
                      <h3 className="font-mono text-base font-semibold text-foreground">
                        Get results
                      </h3>
                      <p className="mt-1">
                        Your agent receives structured results: extracted data,
                        screenshots of each step, and a summary of actions
                        taken. You pay only for the steps actually executed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Framework compatibility */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Framework Compatibility
              </h2>
              <p className="mb-4">
                Rent My Browser works with any AI agent framework that can make
                HTTP requests or use MCP tools. Here is how it integrates with
                popular platforms:
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Claude (Anthropic)
                  </h3>
                  <p className="mt-1">
                    Native MCP support. Add the Rent My Browser MCP server to
                    your Claude Desktop or Claude Code configuration and the
                    model can rent browsers as a tool. No wrapper code needed.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    GPT / OpenAI
                  </h3>
                  <p className="mt-1">
                    Use the REST API as a function/tool in your OpenAI function
                    calling setup. Define the task submission endpoint as a
                    function schema and GPT can invoke it when it needs browser
                    data.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    LangChain / LangGraph
                  </h3>
                  <p className="mt-1">
                    Wrap the REST API as a LangChain Tool. The agent calls it
                    like any other tool in its toolchain. Works with both
                    ReAct-style agents and graph-based orchestration in
                    LangGraph.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    AutoGen / CrewAI
                  </h3>
                  <p className="mt-1">
                    Register the browser rental API as a tool for any agent in
                    your multi-agent system. One agent handles reasoning, another
                    handles browser tasks by delegating to Rent My Browser.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    Custom Agents
                  </h3>
                  <p className="mt-1">
                    If your agent can make HTTP POST requests and parse JSON
                    responses, it can use Rent My Browser. The API is
                    deliberately simple: one endpoint to create a task, one to
                    check status, one to get results.
                  </p>
                </div>
              </div>
            </section>

            {/* What agents get back */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                What Your Agent Gets Back
              </h2>
              <p className="mb-4">
                Every completed task returns a rich result set that your agent
                can reason over:
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    <strong className="text-foreground">Structured data</strong>{" "}
                    — extracted text, tables, and values formatted as JSON based
                    on your task description.
                  </li>
                  <li>
                    <strong className="text-foreground">Screenshots</strong>{" "}
                    — a screenshot captured at each step of the browser
                    interaction, providing visual proof of what happened.
                  </li>
                  <li>
                    <strong className="text-foreground">Step log</strong>{" "}
                    — a description of every action the browser agent took:
                    navigated to URL, clicked element, typed text, scrolled
                    page.
                  </li>
                  <li>
                    <strong className="text-foreground">Status metadata</strong>{" "}
                    — task status, step count, cost breakdown, and timing
                    information.
                  </li>
                </ul>
              </div>
            </section>

            {/* Bot detection */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Defeating Bot Detection
              </h2>
              <p className="mb-3">
                Modern websites deploy sophisticated bot detection systems:
                Cloudflare, DataDome, PerimeterX, Akamai Bot Manager. These
                systems analyze TLS fingerprints, browser APIs, canvas
                rendering, WebGL output, mouse movement patterns, and IP
                reputation to distinguish bots from humans.
              </p>
              <p className="mb-3">
                Headless browsers fail these checks because they are not real
                browsers. They have detectable automation flags, missing browser
                APIs, synthetic fingerprints, and data center IP addresses.
              </p>
              <p>
                Rent My Browser bypasses all of these checks because the browser
                is real. It is a genuine Chrome installation on a real machine
                with a residential IP address. There are no automation flags to
                detect, no missing APIs to fingerprint, no synthetic
                characteristics to identify. The browser passes every check
                because it is exactly what the detection systems are looking for:
                a real browser operated by a real machine on a real network.
              </p>
            </section>

            {/* Pricing */}
            <section>
              <h2 className="mb-3 font-mono text-lg font-bold text-foreground">
                Pay-Per-Step Pricing
              </h2>
              <p className="mb-3">
                You pay only for the browser steps your task actually uses. One
                step equals one browser action: navigate to a URL, click an
                element, type text, scroll, or extract data. There is no minimum
                commitment, no monthly fee, and no charge for failed tasks.
              </p>
              <p>
                Set a maximum budget when you submit a task. If the task
                completes in fewer steps than estimated, you pay only for the
                steps used. If a node goes offline mid-task, the hold is
                released and you are not charged.
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
                    — connect your wallet and get an API key.
                  </li>
                  <li>
                    <strong className="text-foreground">Add credits</strong>{" "}
                    — top up your balance with USDC on Base or through the
                    website.
                  </li>
                  <li>
                    <strong className="text-foreground">Integrate</strong>{" "}
                    — add the MCP server to your agent, or call the REST API
                    directly.
                  </li>
                  <li>
                    <strong className="text-foreground">Submit a task</strong>{" "}
                    — describe what you need in natural language, set a budget,
                    and get results.
                  </li>
                </ol>
              </div>
              <p className="mt-4">
                From account creation to your first browser task: under five
                minutes.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
