import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { accounts } from "../../db/schema/accounts.js";
import {
  createConsumerAccount,
  getAccount,
  addCredits,
  createChallenge,
  verifyChallenge,
} from "../accounts/accounts.service.js";
import { createNodeOperator } from "../nodes/nodes.service.js";
import { createTask, listTasks, getTask } from "../tasks/tasks.service.js";
import { isSandbox } from "../../env.js";

async function resolveAccountId(apiKey: string): Promise<string> {
  const hash = createHash("sha256").update(apiKey).digest("hex");
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.apiKeyHash, hash))
    .limit(1);
  if (!account) throw new Error("Invalid API key");
  return account.id;
}

async function resolveAccount(apiKey: string): Promise<{ id: string; type: string }> {
  const hash = createHash("sha256").update(apiKey).digest("hex");
  const [account] = await db
    .select({ id: accounts.id, type: accounts.type })
    .from(accounts)
    .where(eq(accounts.apiKeyHash, hash))
    .limit(1);
  if (!account) throw new Error("Invalid API key");
  return account;
}

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "rent-my-browser",
    version: "0.0.1",
  });

  // --- Account creation ---

  server.tool(
    "create_account",
    `Create a consumer account on Rent My Browser. This is the first step — you need an account before you can submit tasks or buy credits.

Returns:
- account_id: your unique account UUID
- api_key: secret key needed for all authenticated tools (save this!)
- dashboard_url: link to the web dashboard

After creating an account, top up credits with buy_credits before submitting tasks.`,
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("Ethereum wallet address (0x-prefixed, 40 hex chars). Used as your identity and for USDC payouts."),
    },
    async (params) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            await createConsumerAccount(params.wallet_address),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.tool(
    "create_node",
    `Register as a browser node operator. Node operators earn credits by executing browser tasks submitted by consumers. Free to register.

Two node types:
- headless: Playwright on a VPS. Handles simple automation tasks. Earns 4 credits/step (80% of 5/step price).
- real: Actual Chrome with real fingerprint. Handles bot-detection sites (Facebook, Google, Amazon). Earns 8-12 credits/step (80% of 10-15/step price).

After registration, use the OpenClaw skill to connect your node and start receiving tasks automatically.

Returns: account_id, node_id, api_key.`,
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe(
          "Ethereum wallet address for identity and USDC payouts",
        ),
      node_type: z
        .enum(["headless", "real"])
        .describe(
          "headless: Playwright on VPS (simple tasks, lower payout). real: actual Chrome (premium tasks, higher payout, passes bot detection).",
        ),
    },
    async (params) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            await createNodeOperator(params.wallet_address, params.node_type),
            null,
            2,
          ),
        },
      ],
    }),
  );

  // --- Auth recovery ---

  server.tool(
    "auth_challenge",
    `Request a challenge message to sign with your wallet. Use this to recover your API key if you lost it.

This is step 1 of 2:
1. Call auth_challenge → get a message string
2. Sign that message with your wallet private key (EIP-191 personal_sign)
3. Call auth_verify with the signature → get a new API key

The challenge expires in 5 minutes.`,
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("The wallet address you originally registered with"),
    },
    async (params) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            await createChallenge(params.wallet_address),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.tool(
    "auth_verify",
    `Submit a signed challenge to get a new API key. Step 2 of 2 — you must call auth_challenge first.

Returns a new api_key (the old one is invalidated) and a dashboard_url with a session token.`,
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("The wallet address you registered with"),
      signature: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/)
        .describe(
          "The challenge message signed with your wallet private key (EIP-191 personal_sign). Must be 0x-prefixed hex.",
        ),
    },
    async (params) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            await verifyChallenge(params.wallet_address, params.signature),
            null,
            2,
          ),
        },
      ],
    }),
  );

  // --- Credits & balance ---

  server.tool(
    "get_balance",
    `Check your credit balance and spending history. 1 credit = $0.01 USD.

Returns:
- balance: current available credits
- total_spent: lifetime credits spent on tasks
- total_earned: lifetime credits earned (operators only)

You need credits to submit tasks. Top up with buy_credits (USDC on Base blockchain).

Pricing reference:
- Headless simple: 5 credits/step ($0.05)
- Real simple: 10 credits/step ($0.10)
- Real adversarial: 15 credits/step ($0.15)`,
    {
      api_key: z.string().describe("Your API key from create_account or auth_verify"),
    },
    async (params) => {
      const accountId = await resolveAccountId(params.api_key);
      const account = await getAccount(accountId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                balance: account.balance,
                balance_usd: `$${(account.balance / 100).toFixed(2)}`,
                total_spent: account.totalSpent,
                total_earned: account.totalEarned,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.tool(
    "buy_credits",
    `Purchase credits using USDC on the Base blockchain (x402 payment protocol). The payment is made inline with the HTTP request — your x402-compatible client handles it automatically.

IMPORTANT: Only these exact tiers are available. You cannot buy arbitrary amounts.

Available tiers:
- "100"  → 100 credits for $1 USDC
- "500"  → 500 credits for $5 USDC
- "1000" → 1,000 credits for $10 USDC
- "5000" → 5,000 credits for $50 USDC
- "20000" → 20,000 credits for $200 USDC

The x402 payment is processed on Base (chain ID eip155:8453 mainnet or eip155:84532 testnet). Your wallet must have sufficient USDC balance on Base.

Returns your updated balance after purchase.`,
    {
      api_key: z.string().describe("Your API key from create_account"),
      tier: z
        .enum(["100", "500", "1000", "5000", "20000"])
        .describe(
          "Credit tier to purchase. Options: '100' ($1), '500' ($5), '1000' ($10), '5000' ($50), '20000' ($200). Only these exact amounts are available.",
        ),
    },
    async (params) => {
      const accountId = await resolveAccountId(params.api_key);
      const tiers: Record<string, number> = {
        "100": 100,
        "500": 500,
        "1000": 1000,
        "5000": 5000,
        "20000": 20000,
      };
      const credits = tiers[params.tier]!;
      // Note: In production, this endpoint is behind x402 paymentMiddleware
      // which handles the actual USDC payment. The MCP tool documents the
      // available tiers so agents know what's possible.
      const result = await addCredits(accountId, credits);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                credits_purchased: credits,
                price_usdc: `$${(credits / 100).toFixed(2)}`,
                ...result,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // --- Task management ---

  server.tool(
    "submit_task",
    `Submit a browser automation task. A remote browser node will execute it and return results.

What it can do: navigate websites, fill forms, click buttons, scrape/extract data, take screenshots, download files, create accounts, complete checkouts — any browser-based workflow.

How it works:
1. You submit a goal in natural language
2. AI estimates complexity, picks tier (headless/real) and mode (simple/adversarial)
3. Task is broadcast to eligible browser nodes
4. First node to claim executes it step by step
5. You poll with get_task until status is "completed" or "failed"

Pricing (you pay only for actual steps, never more than max_budget):
- Headless + simple: 5 credits/step ($0.05)
- Real + simple: 10 credits/step ($0.10)
- Real + adversarial: 15 credits/step ($0.15)

Task statuses: queued → offered → claimed → running → completed/failed
If no node claims within timeout_ms, the task auto-fails and your budget is fully refunded.
If allow_downgrade is true and no real nodes are available, it falls back to headless automatically.

Requires credits — check get_balance first. Budget is held on submission and refunded if unused.`,
    {
      api_key: z.string().describe("Your API key from create_account"),
      goal: z
        .string()
        .min(10)
        .describe(
          "Natural language description of what the browser should do. Be specific: include the target URL, what to fill/click/extract, and expected outcome. Example: 'Go to example.com/signup, fill the form with the provided data, click Submit, and extract the confirmation number.'",
        ),
      context_data: z
        .record(z.unknown())
        .optional()
        .describe(
          "Key-value data the browser needs: form field values, login credentials, search queries, etc. Example: {\"email\": \"john@test.com\", \"password\": \"SecurePass123\", \"name\": \"John Doe\"}",
        ),
      tier: z
        .enum(["headless", "real", "auto"])
        .default("auto")
        .describe(
          "auto (recommended): platform picks based on target site. headless: cheap Playwright browser, for simple sites with no bot detection. real: actual Chrome with real fingerprint, for sites like Facebook, Google, Amazon that detect bots.",
        ),
      mode: z
        .enum(["simple", "adversarial"])
        .default("simple")
        .describe(
          "simple: standard fast automation. adversarial: human-like mouse movements, typing delays, natural scrolling — required for sites that analyze behavioral patterns (social media, banks, e-commerce). Only works with tier 'real'.",
        ),
      geo: z
        .string()
        .optional()
        .describe(
          "ISO 3166-1 alpha-2 country code (e.g. 'US', 'MX', 'DE'). Routes the task to a node in that country. Useful for geo-restricted sites or locale-specific content. Leave empty for any location.",
        ),
      max_budget: z
        .number()
        .int()
        .positive()
        .max(10000)
        .describe(
          "Maximum credits to spend (1-10000). You're charged only for actual steps executed, never more than this. Unspent budget is refunded. Tip: a simple form fill is ~5 steps, a complex multi-page flow is ~15-20 steps.",
        ),
      timeout_ms: z
        .number()
        .int()
        .min(30_000)
        .max(600_000)
        .default(300_000)
        .describe(
          "How long to wait (in ms) for a node to claim the task before it auto-fails. Default: 300000 (5 min). Range: 30000-600000. If no node is available, your full budget is refunded.",
        ),
      allow_downgrade: z
        .boolean()
        .default(true)
        .describe(
          "If true and tier is 'real' but no real-browser nodes are available, automatically retry with headless nodes as fallback. Default: true. Set to false if the task absolutely requires a real browser (e.g. site has strict bot detection).",
        ),
    },
    async (params) => {
      const accountId = await resolveAccountId(params.api_key);
      const result = await createTask(accountId, {
        goal: params.goal,
        context: {
          data: params.context_data,
          tier: params.tier,
          mode: params.mode,
          geo: params.geo,
        },
        settings: {
          timeout_ms: params.timeout_ms,
          allow_downgrade: params.allow_downgrade,
        },
        max_budget: params.max_budget,
      });
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );

  server.tool(
    "get_task",
    `Check the status and results of a submitted task. Poll this every 5-10 seconds until status is "completed" or "failed".

Status progression: queued → offered → claimed → running → completed/failed

Response includes:
- status: current task state
- steps_completed: how many browser actions have been executed so far
- steps[]: array of executed actions with descriptions and screenshot URLs
- result: on completion — extracted_data, final_url, screenshots, files
- actual_cost: credits charged (only set when completed)
- duration_ms: total execution time in milliseconds

If status is "failed", check result.error for the reason (safety_rejection, site_unreachable, captcha_blocked, budget_exhausted, etc.).`,
    {
      api_key: z.string().describe("Your API key from create_account"),
      task_id: z
        .string()
        .uuid()
        .describe("The task_id returned by submit_task (UUID format)"),
    },
    async (params) => {
      const accountId = await resolveAccountId(params.api_key);
      const result = await getTask(params.task_id, accountId);
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );

  server.tool(
    "list_tasks",
    `List your submitted tasks with pagination and optional status filter. Useful for checking recent task history or finding tasks by status.

Returns an array of task summaries (without full step details — use get_task for that) and a total count.

Consumers see tasks they submitted. Operators see tasks assigned to their node.`,
    {
      api_key: z.string().describe("Your API key from create_account"),
      status: z
        .enum(["queued", "offered", "claimed", "running", "completed", "failed"])
        .optional()
        .describe("Filter by task status. Omit to see all tasks."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50)
        .describe("Number of tasks to return (1-100). Default: 50."),
      offset: z
        .number()
        .int()
        .min(0)
        .default(0)
        .describe("Number of tasks to skip for pagination. Default: 0."),
    },
    async (params) => {
      const account = await resolveAccount(params.api_key);
      const result = await listTasks(
        account.id,
        account.type as "consumer" | "operator",
        {
          status: params.status,
          limit: params.limit,
          offset: params.offset,
        },
      );
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );

  // --- Sandbox-only ---

  if (isSandbox) {
    server.tool(
      "add_test_credits",
      `Add free credits for testing. ONLY available in development/sandbox environments — this tool does not exist in production.

In production, use buy_credits to purchase credits with USDC on Base.

1 credit = $0.01 USD. A typical simple task costs 25-100 credits ($0.25-$1.00).`,
      {
        api_key: z.string().describe("Your API key from create_account"),
        amount: z
          .number()
          .int()
          .positive()
          .describe("Number of credits to add. 100 credits = $1.00."),
      },
      async (params) => {
        const accountId = await resolveAccountId(params.api_key);
        const result = await addCredits(accountId, params.amount);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      },
    );
  }

  return server;
}
