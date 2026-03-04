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
import { createTask, getTask } from "../tasks/tasks.service.js";
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

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "rent-my-browser",
    version: "0.0.1",
  });

  // --- Public tools ---

  server.tool(
    "create_account",
    "Create an account on Rent My Browser — a marketplace that rents real browsers for web automation. Use this when you need a remote browser to fill forms, scrape data, run QA tests, or create accounts on websites. Returns an API key needed for all other tools.",
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("Your Ethereum wallet address (used as identity)"),
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
    "Register as a browser node operator on Rent My Browser. Node operators earn credits by executing browser tasks for consumers. Your OpenClaw agent will receive tasks when idle and execute them using its browser. Free to register.",
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe(
          "Your Ethereum wallet address (used for identity and payouts)",
        ),
      node_type: z
        .enum(["headless", "real"])
        .describe(
          "headless: Playwright on a VPS (cheap tasks). real: actual Chrome on a physical machine (premium, passes bot detection)",
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

  server.tool(
    "auth_challenge",
    "Request a challenge message to sign with your wallet. Use this if you lost your API key but still have your wallet private key. Step 1 of 2 — call auth_verify next with the signed message.",
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("The wallet address you registered with"),
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
    "Submit a signed challenge message to recover your API key. Step 2 of 2 — call auth_challenge first to get the message to sign.",
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("The wallet address you registered with"),
      signature: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/)
        .describe(
          "The challenge message signed with your wallet private key (EIP-191)",
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

  // --- Authenticated tools ---

  server.tool(
    "get_balance",
    "Check your Rent My Browser credit balance. 1 credit = $0.01 USD. You need credits to submit browser tasks. Top up via the /accounts/credits/crypto/:tier REST endpoint using USDC on Base.",
    {
      api_key: z.string().describe("Your API key from create_account"),
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
    "submit_task",
    "Rent a remote browser to execute a task. The browser will navigate websites, fill forms, click buttons, scrape data, take screenshots, and return the results. Supports two tiers: headless (cheap, for simple sites) and real (premium, uses actual Chrome with anti-detection for sites like Facebook, Google, Amazon). You pay only for actual steps executed, capped at your max_budget. Requires credits — check get_balance first.",
    {
      api_key: z.string().describe("Your API key from create_account"),
      goal: z
        .string()
        .min(10)
        .describe(
          "Natural language description of what the browser should do. Be specific about the target URL, what to fill, click, or extract.",
        ),
      context_data: z
        .record(z.unknown())
        .optional()
        .describe(
          "Data the browser needs for the task: form field values, login credentials, search queries, etc.",
        ),
      tier: z
        .enum(["headless", "real", "auto"])
        .default("auto")
        .describe(
          "auto: platform decides based on target site. headless: cheap, Playwright browser. real: premium, actual Chrome that passes bot detection.",
        ),
      mode: z
        .enum(["simple", "adversarial"])
        .default("simple")
        .describe(
          "simple: standard browser automation. adversarial: human-like mouse movements, typing delays, and scroll patterns to bypass behavioral bot detection.",
        ),
      geo: z
        .string()
        .optional()
        .describe(
          "ISO 3166-1 alpha-2 country code for geographic targeting (e.g. US, MX, DE). The task will be routed to a node in that country if available.",
        ),
      max_budget: z
        .number()
        .int()
        .positive()
        .max(10000)
        .describe(
          "Maximum credits to spend. You are charged for actual steps executed, never more than this. Pricing: headless 5 credits/step, real 10/step, adversarial 15/step.",
        ),
      timeout_ms: z
        .number()
        .int()
        .min(30_000)
        .max(600_000)
        .default(300_000)
        .describe(
          "How long (ms) before the task auto-fails if no node claims it. Default: 300000 (5 min). Min: 30s, Max: 10min.",
        ),
      allow_downgrade: z
        .boolean()
        .default(true)
        .describe(
          "If true and no real-browser nodes are available, the platform will try headless nodes as a fallback. Default: true.",
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
    "Check the status of a submitted browser task. Poll this until status is 'completed' or 'failed'. Returns step progress, screenshots, extracted data, and the final URL when done.",
    {
      api_key: z.string().describe("Your API key from create_account"),
      task_id: z
        .string()
        .uuid()
        .describe("The task_id returned by submit_task"),
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

  // --- Sandbox-only ---

  if (isSandbox) {
    server.tool(
      "add_test_credits",
      "Add free credits for testing. Only available in development/sandbox environments. In production, top up via USDC on Base.",
      {
        api_key: z.string().describe("Your API key from create_account"),
        amount: z
          .number()
          .int()
          .positive()
          .describe("Number of credits to add (1 credit = $0.01)"),
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
