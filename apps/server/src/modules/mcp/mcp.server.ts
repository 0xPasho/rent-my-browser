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

// --- Helper ---

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

// --- Factory: creates a fresh McpServer per request ---

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "rent-my-browser",
    version: "0.0.1",
  });

  // Public tools

  server.tool(
    "create_account",
    "Create a consumer account. Returns an API key to use with other tools.",
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("Ethereum wallet address"),
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
    "Register as a node operator. Free. Returns API key and node ID.",
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("Ethereum wallet address"),
      node_type: z
        .enum(["headless", "real"])
        .describe("headless (VPS) or real (physical machine)"),
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
    "Request a challenge message to sign for re-authentication.",
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("Ethereum wallet address"),
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
    "Submit a signed challenge to recover your API key.",
    {
      wallet_address: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/)
        .describe("Ethereum wallet address"),
      signature: z
        .string()
        .regex(/^0x[a-fA-F0-9]+$/)
        .describe("Signed challenge message"),
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

  // Authenticated tools

  server.tool(
    "get_balance",
    "Check credit balance, total spent, and total earned.",
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
    "Submit a browser automation task. Requires credits.",
    {
      api_key: z.string().describe("Your API key from create_account"),
      goal: z.string().min(10).describe("What the browser should do"),
      context_data: z
        .record(z.unknown())
        .optional()
        .describe("Data for the task (form fields, etc.)"),
      tier: z
        .enum(["headless", "real", "auto"])
        .default("auto")
        .describe("headless (cheap), real (anti-detection), or auto"),
      mode: z
        .enum(["simple", "adversarial"])
        .default("simple")
        .describe("simple or adversarial (human-like behavior)"),
      geo: z.string().optional().describe("ISO country code (US, MX, DE)"),
      max_budget: z
        .number()
        .int()
        .positive()
        .max(10000)
        .describe("Max credits to spend (1 credit = $0.01)"),
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
    "Check task status and retrieve results.",
    {
      api_key: z.string().describe("Your API key from create_account"),
      task_id: z.string().uuid().describe("Task ID from submit_task"),
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

  // Sandbox-only

  if (isSandbox) {
    server.tool(
      "add_test_credits",
      "Add credits for testing. Only available in development.",
      {
        api_key: z.string().describe("Your API key"),
        amount: z.number().int().positive().describe("Credits to add"),
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
