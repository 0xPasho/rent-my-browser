import type { Metadata } from "next";
import { Nav } from "@/modules/layout/nav";
import { Footer } from "@/modules/layout/footer";

export const metadata: Metadata = {
  title: "API Reference — rentmybrowser.ai",
  description:
    "REST API documentation for renting real browsers. Submit tasks, poll results, manage credits.",
};

const quickStart = [
  {
    step: "1",
    title: "create an account",
    code: `POST /accounts\n{ "wallet_address": "0x..." }\n→ { "api_key": "rmb_c_...", "account_id": "uuid" }`,
  },
  {
    step: "2",
    title: "top up credits",
    code: `POST /accounts/credits/stripe\n{ "amount": 10 }\n→ { "url": "https://checkout.stripe.com/..." }\n\n// or via x402: POST /accounts/credits/crypto/1000`,
  },
  {
    step: "3",
    title: "submit a task",
    code: `POST /tasks\n{ "goal": "sign up on example.com", "max_budget": 200 }\n→ { "task_id": "uuid", "status": "queued" }`,
  },
];

interface Endpoint {
  method: string;
  path: string;
  auth: string;
  desc: string;
  params?: { name: string; type: string; required?: boolean; desc: string }[];
  body?: { name: string; type: string; required?: boolean; desc: string }[];
  response?: string;
}

const endpointGroups: { title: string; endpoints: Endpoint[] }[] = [
  {
    title: "Accounts",
    endpoints: [
      {
        method: "POST",
        path: "/accounts",
        auth: "No",
        desc: "Register a new consumer account. Returns API key.",
        body: [
          { name: "wallet_address", type: "string", required: true, desc: "Ethereum wallet address (0x...)" },
        ],
        response: `{
  "account_id": "uuid",
  "api_key": "rmb_c_...",
  "dashboard_url": "https://..."
}`,
      },
      {
        method: "GET",
        path: "/accounts/me",
        auth: "API key",
        desc: "Get account info: balance, spend, earnings.",
        response: `{
  "id": "uuid",
  "type": "consumer",
  "walletAddress": "0x...",
  "balance": 800,
  "totalSpent": 200,
  "totalEarned": 0,
  "createdAt": "2026-01-01T00:00:00Z"
}`,
      },
      {
        method: "POST",
        path: "/auth/challenge",
        auth: "No",
        desc: "Request a challenge message for wallet-based key recovery. Step 1 of 2.",
        body: [
          { name: "wallet_address", type: "string", required: true, desc: "Ethereum wallet address (0x...)" },
        ],
        response: `{
  "message": "Sign this to verify: rmb_auth_..."
}`,
      },
      {
        method: "POST",
        path: "/auth/verify",
        auth: "No",
        desc: "Submit signed challenge to recover API key. Rotates old key. Step 2 of 2.",
        body: [
          { name: "wallet_address", type: "string", required: true, desc: "Ethereum wallet address" },
          { name: "signature", type: "string", required: true, desc: "EIP-191 signed challenge message (0x...)" },
        ],
        response: `{
  "account_id": "uuid",
  "api_key": "rmb_c_...",
  "dashboard_url": "https://..."
}`,
      },
    ],
  },
  {
    title: "Credits",
    endpoints: [
      {
        method: "POST",
        path: "/accounts/credits/stripe",
        auth: "API key",
        desc: "Create a Stripe Checkout session to purchase credits with a card. 1 credit = $0.01. Min $5, max $500.",
        body: [
          { name: "amount", type: "number", required: true, desc: "Dollar amount to charge ($5–$500)" },
        ],
        response: `{
  "url": "https://checkout.stripe.com/c/pay/..."
}`,
      },
      {
        method: "POST",
        path: "/accounts/credits/crypto/:tier",
        auth: "API key",
        desc: "Top up credits via x402 (USDC on Base). 1 credit = $0.01. Returns 402 with payment instructions. Best for AI agents.",
        params: [
          { name: "tier", type: "number", required: true, desc: "Credit tier: 100 ($1), 500 ($5), 1000 ($10), 5000 ($50), or 20000 ($200)" },
        ],
        response: `{
  "balance": 1100
}`,
      },
      {
        method: "POST",
        path: "/accounts/credits/alternative",
        auth: "API key",
        desc: "Add free test credits. Sandbox only.",
        body: [
          { name: "amount", type: "integer", required: true, desc: "Number of credits to add" },
        ],
        response: `{
  "balance": 1500
}`,
      },
    ],
  },
  {
    title: "Tasks (Consumer)",
    endpoints: [
      {
        method: "GET",
        path: "/tasks",
        auth: "API key",
        desc: "List tasks for the authenticated account. Consumers see submitted tasks, operators see executed tasks.",
        params: [
          { name: "status", type: "string", desc: 'Filter by status: "queued", "running", "completed", "failed" (optional)' },
          { name: "limit", type: "integer", desc: "Max results to return (default: 50, max: 100)" },
          { name: "offset", type: "integer", desc: "Pagination offset (default: 0)" },
        ],
        response: `{
  "tasks": [
    {
      "task_id": "uuid",
      "goal": "Sign up on example.com",
      "status": "completed",
      "steps_completed": 5,
      "estimated_steps": 5,
      "estimated_cost": 50,
      "actual_cost": 40,
      "max_budget": 300,
      "created_at": "2026-01-01T00:00:00Z",
      "completed_at": "2026-01-01T00:00:12Z"
    }
  ],
  "total": 42
}`,
      },
      {
        method: "POST",
        path: "/tasks",
        auth: "API key",
        desc: "Submit a browser task for execution. Returns 202 when queued.",
        body: [
          { name: "goal", type: "string", required: true, desc: "Task description in plain English (10-2000 chars)" },
          { name: "context.data", type: "object", desc: "Optional structured data for the task" },
          { name: "context.tier", type: "string", desc: '"headless" | "real" | "auto" (default: "auto")' },
          { name: "context.mode", type: "string", desc: '"simple" | "adversarial" (default: "simple")' },
          { name: "context.geo", type: "string", desc: "Country code for geo-targeting (optional)" },
          { name: "max_budget", type: "integer", required: true, desc: "Maximum credits to spend (1-10000). 1 credit = $0.01" },
        ],
        response: `{
  "task_id": "uuid",
  "status": "queued",
  "estimate": {
    "tier": "real",
    "estimated_steps": 5,
    "estimated_cost": 100
  },
  "max_budget": 200
}`,
      },
      {
        method: "GET",
        path: "/tasks/:id",
        auth: "API key",
        desc: "Poll task status, steps, and result.",
        params: [
          { name: "id", type: "uuid", required: true, desc: "Task ID" },
        ],
        response: `{
  "task_id": "uuid",
  "status": "completed",
  "steps_completed": 5,
  "estimated_steps": 5,
  "actual_cost": 100,
  "max_budget": 200,
  "result": {
    "screenshots": ["https://..."],
    "extracted_data": { ... },
    "final_url": "https://...",
    "files": [{ "name": "...", "url": "..." }]
  },
  "steps": [
    {
      "step_number": 1,
      "action": "Navigated to example.com",
      "screenshot_url": "https://...",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "duration_ms": 12500,
  "created_at": "2026-01-01T00:00:00Z",
  "completed_at": "2026-01-01T00:00:05Z"
}`,
      },
    ],
  },
  {
    title: "Nodes (Operator)",
    endpoints: [
      {
        method: "POST",
        path: "/nodes",
        auth: "No",
        desc: "Register an operator node. Returns API key and node ID.",
        body: [
          { name: "wallet_address", type: "string", required: true, desc: "Ethereum wallet address (0x...)" },
          { name: "node_type", type: "string", required: true, desc: '"headless" | "real"' },
        ],
        response: `{
  "account_id": "uuid",
  "node_id": "uuid",
  "api_key": "rmb_o_...",
  "dashboard_url": "https://..."
}`,
      },
      {
        method: "POST",
        path: "/nodes/:id/heartbeat",
        auth: "API key",
        desc: "Keep node online and update capabilities. Nodes go offline after 60s without heartbeat.",
        params: [
          { name: "id", type: "uuid", required: true, desc: "Node ID" },
        ],
        body: [
          { name: "type", type: "string", required: true, desc: '"headless" | "real"' },
          { name: "browser.name", type: "string", desc: 'Browser name (e.g., "Chrome")' },
          { name: "browser.version", type: "string", desc: 'Browser version (e.g., "120.0")' },
          { name: "geo.country", type: "string", desc: "2-letter country code" },
          { name: "geo.ip_type", type: "string", desc: '"residential" | "datacenter"' },
          { name: "capabilities.modes", type: "string[]", desc: '["simple"] | ["adversarial"] | both' },
          { name: "capabilities.max_concurrent", type: "integer", desc: "Max concurrent tasks (default: 1)" },
        ],
        response: `{
  "status": "ok"
}`,
      },
      {
        method: "GET",
        path: "/nodes/:id/offers",
        auth: "API key",
        desc: "Poll for pending task offers. Offers expire in 15 seconds.",
        params: [
          { name: "id", type: "uuid", required: true, desc: "Node ID" },
        ],
        response: `{
  "offers": [
    {
      "offer_id": "uuid",
      "task_id": "uuid",
      "goal_summary": "Sign up on example.com...",
      "mode": "simple",
      "estimated_steps": 5,
      "payout_per_step": 16,
      "expires_at": "2026-01-01T00:00:15Z"
    }
  ]
}`,
      },
    ],
  },
  {
    title: "Offers (Operator)",
    endpoints: [
      {
        method: "POST",
        path: "/offers/:id/claim",
        auth: "API key",
        desc: "Claim a task offer. First to claim wins (200), late gets conflict (409).",
        params: [
          { name: "id", type: "uuid", required: true, desc: "Offer ID" },
        ],
        body: [
          { name: "node_id", type: "uuid", required: true, desc: "Node ID claiming the offer" },
        ],
        response: `{
  "task_id": "uuid",
  "goal": "Sign up on example.com",
  "context": {
    "data": { "name": "John", "email": "j@x.com" },
    "tier": "real",
    "mode": "simple"
  },
  "max_budget": 200,
  "estimated_steps": 5
}`,
      },
    ],
  },
  {
    title: "Task Execution (Operator)",
    endpoints: [
      {
        method: "POST",
        path: "/tasks/:id/steps",
        auth: "API key",
        desc: "Report a completed step during task execution.",
        params: [
          { name: "id", type: "uuid", required: true, desc: "Task ID" },
        ],
        body: [
          { name: "step", type: "integer", required: true, desc: "Step number (sequential)" },
          { name: "action", type: "string", required: true, desc: "Description of action taken (1-500 chars)" },
          { name: "screenshot", type: "string", desc: "Base64-encoded screenshot (optional)" },
        ],
        response: `{
  "step": 3,
  "action": "Filled in email field",
  "screenshot_url": "https://...",
  "budget_remaining": 140
}`,
      },
      {
        method: "POST",
        path: "/tasks/:id/result",
        auth: "API key",
        desc: "Submit final task result and trigger payment settlement.",
        params: [
          { name: "id", type: "uuid", required: true, desc: "Task ID" },
        ],
        body: [
          { name: "status", type: "string", required: true, desc: '"completed" | "failed"' },
          { name: "extracted_data", type: "object", desc: "Structured result data (optional)" },
          { name: "final_url", type: "string", desc: "Final page URL (optional)" },
          { name: "files", type: "array", desc: '[ { "name": "...", "url": "..." } ] (optional)' },
        ],
        response: `{
  "task_id": "uuid",
  "status": "completed",
  "steps_executed": 5,
  "actual_cost": 100,
  "duration_ms": 12500
}`,
      },
    ],
  },
];

const responseCodes = [
  { code: "200", meaning: "Success" },
  { code: "201", meaning: "Created" },
  { code: "202", meaning: "Accepted (task queued)" },
  { code: "400", meaning: "Validation error" },
  { code: "401", meaning: "Auth error" },
  { code: "402", meaning: "Payment required (x402)" },
  { code: "409", meaning: "Conflict (offer already claimed)" },
  { code: "501", meaning: "Not implemented" },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    POST: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PATCH: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${colors[method] ?? "text-foreground"}`}
    >
      {method}
    </span>
  );
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const hasParams = ep.params && ep.params.length > 0;
  const hasBody = ep.body && ep.body.length > 0;
  const hasResponse = ep.response;

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
        <MethodBadge method={ep.method} />
        <code className="font-mono text-sm font-semibold text-foreground">
          {ep.path}
        </code>
        {ep.auth !== "No" && (
          <span className="ml-auto rounded-md bg-yellow-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-yellow-400">
            AUTH
          </span>
        )}
      </div>

      {/* Description */}
      <div className="px-5 py-3">
        <p className="text-sm text-muted-foreground">{ep.desc}</p>
      </div>

      {/* Parameters / Body */}
      {(hasParams || hasBody) && (
        <div className="border-t border-border/50 px-5 py-4">
          {hasParams && (
            <div className={hasBody ? "mb-4" : ""}>
              <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                URL Parameters
              </p>
              <div className="space-y-1.5">
                {ep.params!.map((p) => (
                  <div key={p.name} className="flex items-baseline gap-2 text-xs">
                    <code className="font-mono font-semibold text-emerald-400">
                      {p.name}
                    </code>
                    <span className="text-muted-foreground/60">{p.type}</span>
                    {p.required && (
                      <span className="text-red-400/60">required</span>
                    )}
                    <span className="text-muted-foreground">— {p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasBody && (
            <div>
              <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Request Body
              </p>
              <div className="space-y-1.5">
                {ep.body!.map((p) => (
                  <div key={p.name} className="flex items-baseline gap-2 text-xs">
                    <code className="font-mono font-semibold text-emerald-400">
                      {p.name}
                    </code>
                    <span className="text-muted-foreground/60">{p.type}</span>
                    {p.required && (
                      <span className="text-red-400/60">required</span>
                    )}
                    <span className="text-muted-foreground">— {p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Response */}
      {hasResponse && (
        <div className="border-t border-border/50 px-5 py-4">
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Response
          </p>
          <pre className="overflow-x-auto rounded-lg bg-background p-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {ep.response}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <>
      <Nav />
      <main className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-4xl">
          {/* Badge */}
          <span className="mb-4 inline-block rounded-full border border-emerald-500/30 px-4 py-1.5 font-mono text-xs font-medium text-emerald-500">
            REST API Documentation
          </span>

          {/* Hero */}
          <h1 className="mb-3 font-mono text-4xl font-bold tracking-tight md:text-5xl">
            API{" "}
            <span className="text-emerald-500">reference</span>
          </h1>
          <p className="mb-4 text-lg text-muted-foreground">
            Direct REST API access for AI agents. For MCP integration, see{" "}
            <a
              href="/mcp"
              className="font-medium text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
            >
              MCP docs
            </a>
            .
          </p>

          {/* Base URL */}
          <div className="mb-12 rounded-xl border border-border bg-card p-4">
            <p className="font-mono text-xs text-muted-foreground">
              Base URL
            </p>
            <code className="font-mono text-sm text-emerald-400">
              https://api.rentmybrowser.ai
            </code>
            <span className="mx-3 text-muted-foreground/30">|</span>
            <span className="font-mono text-xs text-muted-foreground">
              Auth via{" "}
              <code className="text-emerald-400">
                Authorization: Bearer &lt;api_key&gt;
              </code>
            </span>
          </div>

          {/* Quick start */}
          <div className="mb-16">
            <h2 className="mb-6 font-mono text-xl font-bold">quick start</h2>
            <div className="space-y-4">
              {quickStart.map((s) => (
                <div key={s.step} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-xs font-bold text-white">
                    {s.step}
                  </span>
                  <div className="flex-1">
                    <h3 className="mb-2 font-mono text-sm font-semibold">
                      {s.title}
                    </h3>
                    <pre className="overflow-x-auto rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                      {s.code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Endpoint groups */}
          {endpointGroups.map((group) => (
            <div key={group.title} className="mb-16">
              <h2 className="mb-6 font-mono text-xl font-bold">
                {group.title}
              </h2>
              <div className="space-y-4">
                {group.endpoints.map((ep) => (
                  <EndpointCard
                    key={`${ep.method}-${ep.path}`}
                    ep={ep}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Response codes */}
          <div className="mb-16">
            <h2 className="mb-4 font-mono text-xl font-bold">
              response codes
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground">
                      Meaning
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {responseCodes.map((rc) => (
                    <tr
                      key={rc.code}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                        {rc.code}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {rc.meaning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cross-link */}
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="mb-2 text-muted-foreground">
              prefer MCP? your agent discovers tools automatically.
            </p>
            <a
              href="/mcp"
              className="font-mono text-sm font-semibold text-emerald-500 underline underline-offset-4 hover:text-emerald-400"
            >
              set it up in one line &rarr;
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
