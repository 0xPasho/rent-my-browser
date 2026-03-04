import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "MCP Integration — rentmybrowser.ai",
  description:
    "Set up MCP in one line. Your AI agent discovers and rents real browsers automatically.",
};

const tools = [
  { name: "create_account", rest: "POST /accounts", auth: "No", desc: "Register a consumer account. Returns API key." },
  { name: "create_node", rest: "POST /nodes", auth: "No", desc: "Register an operator node. Returns API key + node ID." },
  { name: "auth_challenge", rest: "POST /auth/challenge", auth: "No", desc: "Request wallet challenge for key recovery. Step 1 of 2." },
  { name: "auth_verify", rest: "POST /auth/verify", auth: "No", desc: "Submit signed challenge to recover API key. Step 2 of 2." },
  { name: "get_balance", rest: "GET /accounts/me", auth: "api_key", desc: "Check credit balance, total spent, total earned." },
  { name: "submit_task", rest: "POST /tasks", auth: "api_key", desc: "Submit a browser task for execution." },
  { name: "get_task", rest: "GET /tasks/:id", auth: "api_key", desc: "Poll task status and retrieve results." },
  { name: "add_test_credits", rest: "POST /accounts/credits/alternative", auth: "api_key", desc: "Add free credits (sandbox only)." },
];

const agentFlow = [
  { label: "check balance", detail: "get_balance → 800 credits available" },
  { label: "submit task", detail: 'submit_task → task_id, status: "queued"' },
  { label: "poll for result", detail: 'get_task → status: "running", step 2 of 5' },
  { label: "get result", detail: 'get_task → status: "completed", screenshots, extracted data' },
];

const comparison = [
  { feature: "Best for", mcp: "AI agents with MCP support", rest: "Any HTTP client" },
  { feature: "Setup", mcp: "One JSON config line", rest: "API key + HTTP calls" },
  { feature: "Discovery", mcp: "Agent sees tools automatically", rest: "Developer reads docs" },
  { feature: "Use case", mcp: "Claude, OpenClaw, MCP-enabled agents", rest: "SDKs, scripts, CI, custom apps" },
];

export default function McpPage() {
  return (
    <>
      <Nav />
      <main className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <h1 className="mb-3 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            MCP Integration
          </h1>
          <p className="mb-12 text-lg text-muted-foreground">
            one config line. your agent rents browsers.
          </p>

          {/* Setup */}
          <div className="mb-16">
            <h2 className="mb-4 font-mono text-xl font-bold">setup</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Add this to your MCP client config. No auth headers needed — authentication
              is per-tool via <code className="rounded bg-card px-1.5 py-0.5 font-mono text-emerald-500">api_key</code> parameter.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border bg-card p-5 font-mono text-sm leading-relaxed">
              <span className="text-muted-foreground">{"{"}</span>{"\n"}
              {"  "}<span className="text-muted-foreground">&quot;mcpServers&quot;</span>: <span className="text-muted-foreground">{"{"}</span>{"\n"}
              {"    "}<span className="text-muted-foreground">&quot;rent-my-browser&quot;</span>: <span className="text-muted-foreground">{"{"}</span>{"\n"}
              {"      "}<span className="text-muted-foreground">&quot;url&quot;</span>: <span className="text-emerald-400">&quot;https://api.rentmybrowser.ai/mcp&quot;</span>{"\n"}
              {"    "}<span className="text-muted-foreground">{"}"}</span>{"\n"}
              {"  "}<span className="text-muted-foreground">{"}"}</span>{"\n"}
              <span className="text-muted-foreground">{"}"}</span>
            </pre>
          </div>

          {/* Compatible agents */}
          <div className="mb-16">
            <h2 className="mb-4 font-mono text-xl font-bold">
              compatible agents
            </h2>
            <div className="flex flex-wrap gap-3">
              {["ClawdBots", "OpenClaws", "MoltBots", "any MCP-enabled agent"].map(
                (agent) => (
                  <span
                    key={agent}
                    className="rounded-lg border border-border bg-card px-4 py-2 font-mono text-sm"
                  >
                    {agent}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Tools table */}
          <div className="mb-16">
            <h2 className="mb-4 font-mono text-xl font-bold">
              available tools
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                      Tool
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                      REST Equivalent
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                      Auth
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool) => (
                    <tr
                      key={tool.name}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-500">
                        {tool.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {tool.rest}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {tool.auth}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {tool.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* submit_task detail */}
          <div className="mb-16">
            <h2 className="mb-4 font-mono text-xl font-bold">submit_task</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              The main tool your agent uses. Parameters are flat (not nested).
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 font-mono text-xs font-medium text-muted-foreground">
                  INPUT
                </p>
                <pre className="overflow-x-auto rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed text-muted-foreground">
{`api_key: "rmb_c_..."
goal: "sign up on example.com"
context_data: { name: "John", email: "j@x.com" }
tier: "auto"
mode: "simple"
geo: "US"
max_budget: 300  // 1 credit = $0.01`}
                </pre>
              </div>
              <div>
                <p className="mb-2 font-mono text-xs font-medium text-muted-foreground">
                  OUTPUT
                </p>
                <pre className="overflow-x-auto rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed text-muted-foreground">
{`task_id: "uuid"
status: "queued"
estimate: {
  tier: "real"
  estimated_steps: 5
  estimated_cost: 100  // $1.00
}
max_budget: 300  // $3.00`}
                </pre>
              </div>
            </div>
          </div>

          {/* Agent workflow */}
          <div className="mb-16">
            <h2 className="mb-4 font-mono text-xl font-bold">
              agent workflow
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              A typical agent interaction from start to finish.
            </p>
            <div className="space-y-3">
              {agentFlow.map((step, i) => (
                <div key={step.label} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {i < agentFlow.length - 1 && (
                      <div className="mt-1 h-6 w-px bg-emerald-500/30" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-mono text-sm font-semibold">
                      {step.label}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MCP vs REST */}
          <div className="mb-16">
            <h2 className="mb-4 font-mono text-xl font-bold">
              MCP vs REST
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground" />
                    <th className="px-4 py-3 text-left font-mono text-xs font-medium text-emerald-500">
                      MCP
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                      REST API
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                        {row.feature}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {row.mcp}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {row.rest}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Both are first-class citizens. The MCP server doesn&apos;t have features
              the REST API lacks, and vice versa.
            </p>
          </div>

          {/* Cross-link */}
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="mb-2 text-muted-foreground">
              prefer REST? full endpoint reference with examples.
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
