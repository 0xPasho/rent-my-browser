import { eq, and, lt, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { accounts } from "../../db/schema/accounts.js";
import { nodes } from "../../db/schema/nodes.js";
import { offers } from "../../db/schema/offers.js";
import { tasks } from "../../db/schema/tasks.js";
import { ValidationError, NotFoundError, AuthError } from "../../lib/errors.js";
import {
  generateApiKey,
  hashApiKey,
  signDashboardJwt,
} from "../auth/auth.lib.js";
import { getPricePerStep } from "../tasks/tasks.lib.js";

export async function createNodeOperator(
  walletAddress: string,
  nodeType: "headless" | "real",
) {
  // Check if wallet already has an account
  const existingAccount = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.walletAddress, walletAddress))
    .limit(1);

  if (existingAccount.length > 0) {
    // Check if that account already has a node
    const existingNode = await db
      .select({ id: nodes.id })
      .from(nodes)
      .where(eq(nodes.accountId, existingAccount[0].id))
      .limit(1);

    if (existingNode.length > 0) {
      throw new ValidationError(
        "A node already exists for this wallet. Use your existing credentials or re-register with /auth/challenge + /auth/verify.",
      );
    }

    throw new ValidationError("Account already exists for this wallet address");
  }

  const rawApiKey = generateApiKey("operator");
  const apiKeyHash = hashApiKey(rawApiKey);

  const [account] = await db
    .insert(accounts)
    .values({ walletAddress, apiKeyHash, type: "operator" })
    .returning({ id: accounts.id });

  const [node] = await db
    .insert(nodes)
    .values({ accountId: account.id, type: nodeType })
    .returning({ id: nodes.id });

  const jwt = await signDashboardJwt(account.id);

  return {
    account_id: account.id,
    node_id: node.id,
    api_key: rawApiKey,
    dashboard_url: `https://app.rentmybrowser.dev/session?token=${jwt}`,
  };
}

interface HeartbeatInput {
  type: "headless" | "real";
  browser?: { name: string; version: string };
  geo?: { country: string; region?: string; city?: string; ip_type: string };
  capabilities?: { modes: string[]; max_concurrent: number };
}

export async function processHeartbeat(
  nodeId: string,
  accountId: string,
  input: HeartbeatInput,
) {
  const [node] = await db
    .select({ id: nodes.id, accountId: nodes.accountId })
    .from(nodes)
    .where(eq(nodes.id, nodeId));

  if (!node) {
    throw new NotFoundError("Node not found");
  }

  if (node.accountId !== accountId) {
    throw new AuthError("Node does not belong to this account");
  }

  await db
    .update(nodes)
    .set({
      type: input.type,
      browser: input.browser || null,
      geo: input.geo || null,
      capabilities: input.capabilities || null,
      isOnline: true,
      lastHeartbeat: new Date(),
    })
    .where(eq(nodes.id, nodeId));

  return { status: "ok" };
}

export async function getNodeOffers(nodeId: string, accountId: string) {
  const [node] = await db
    .select({ id: nodes.id, accountId: nodes.accountId })
    .from(nodes)
    .where(eq(nodes.id, nodeId));

  if (!node) {
    throw new NotFoundError("Node not found");
  }

  if (node.accountId !== accountId) {
    throw new AuthError("Node does not belong to this account");
  }

  // Get pending offers for this node that haven't expired
  const pendingOffers = await db
    .select({
      offer_id: offers.id,
      task_id: offers.taskId,
      expires_at: offers.expiresAt,
    })
    .from(offers)
    .where(
      and(
        eq(offers.nodeId, nodeId),
        eq(offers.status, "pending"),
      ),
    );

  // Enrich with task summary and payout info
  const enriched = await Promise.all(
    pendingOffers
      .filter((o) => new Date() < o.expires_at)
      .map(async (offer) => {
        const [task] = await db
          .select({
            goal: tasks.goal,
            mode: tasks.mode,
            tier: tasks.tier,
            estimatedSteps: tasks.estimatedSteps,
          })
          .from(tasks)
          .where(eq(tasks.id, offer.task_id));

        if (!task) return null;

        const pricePerStep = getPricePerStep(
          task.tier as "headless" | "real",
          task.mode as "simple" | "adversarial",
        );

        // Operator gets 80% of per-step price
        const payoutPerStep = Math.floor(pricePerStep * 0.8);

        return {
          offer_id: offer.offer_id,
          task_id: offer.task_id,
          goal_summary: task.goal.slice(0, 100),
          mode: task.mode,
          estimated_steps: task.estimatedSteps,
          payout_per_step: payoutPerStep,
          expires_at: offer.expires_at,
        };
      }),
  );

  return { offers: enriched.filter(Boolean) };
}

export async function getNodeForAccount(accountId: string) {
  const [node] = await db
    .select({ id: nodes.id })
    .from(nodes)
    .where(eq(nodes.accountId, accountId))
    .limit(1);

  return node || null;
}

export async function updateNodeScore(
  nodeId: string,
  taskResult: {
    status: "completed" | "failed";
    stepsCompleted: number;
    estimatedSteps: number | null;
  },
): Promise<void> {
  const [node] = await db
    .select({ score: nodes.score })
    .from(nodes)
    .where(eq(nodes.id, nodeId));

  if (!node) return;

  let delta = 0;

  if (taskResult.status === "completed") {
    // Successful completion: +2 points
    delta += 2;

    // Step honesty: if actual steps are wildly different from estimate, penalize
    if (taskResult.estimatedSteps && taskResult.estimatedSteps > 0) {
      const ratio = taskResult.stepsCompleted / taskResult.estimatedSteps;
      if (ratio > 3) {
        // Reported 3x more steps than estimated — suspicious
        delta -= 5;
      } else if (ratio > 2) {
        // Reported 2x more steps — mild penalty
        delta -= 2;
      }
    }
  } else {
    // Failed task: -3 points
    delta -= 3;
  }

  // Clamp score between 0 and 100
  const newScore = Math.max(0, Math.min(100, node.score + delta));

  await db
    .update(nodes)
    .set({ score: newScore })
    .where(eq(nodes.id, nodeId));
}

// --- Public network stats (cached) ---

interface NetworkStats {
  online_nodes: number;
  countries: string[];
  locations: { country: string; city: string; lng: number; lat: number; nodes: number }[];
}

let statsCache: { data: NetworkStats; expiresAt: number } | null = null;
const STATS_CACHE_TTL = 60_000; // 60 seconds

export async function getNetworkStats(): Promise<NetworkStats> {
  if (statsCache && Date.now() < statsCache.expiresAt) {
    return statsCache.data;
  }

  // Count online nodes
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(nodes)
    .where(eq(nodes.isOnline, true));

  // Group by country/city for location data
  const rows = await db
    .select({
      geo: nodes.geo,
    })
    .from(nodes)
    .where(eq(nodes.isOnline, true));

  // Aggregate by country+city
  const locationMap = new Map<string, { country: string; city: string; nodes: number }>();
  const countrySet = new Set<string>();

  for (const row of rows) {
    const geo = row.geo as { country?: string; city?: string } | null;
    if (!geo?.country) continue;

    countrySet.add(geo.country);
    const city = geo.city || "Unknown";
    const key = `${geo.country}:${city}`;
    const existing = locationMap.get(key);
    if (existing) {
      existing.nodes += 1;
    } else {
      locationMap.set(key, { country: geo.country, city, nodes: 1 });
    }
  }

  // We don't store lat/lng in the DB, so locations are returned without coordinates.
  // The frontend will only use country + city + node count for new real nodes.
  const locations = Array.from(locationMap.values()).map((loc) => ({
    ...loc,
    lng: 0,
    lat: 0,
  }));

  const data: NetworkStats = {
    online_nodes: count,
    countries: Array.from(countrySet),
    locations,
  };

  statsCache = { data, expiresAt: Date.now() + STATS_CACHE_TTL };
  return data;
}

export async function markStaleNodesOffline(): Promise<number> {
  const staleThreshold = new Date(Date.now() - 60_000); // 60 seconds

  const result = await db
    .update(nodes)
    .set({ isOnline: false })
    .where(
      and(
        eq(nodes.isOnline, true),
        lt(nodes.lastHeartbeat, staleThreshold),
      ),
    )
    .returning({ id: nodes.id });

  return result.length;
}
