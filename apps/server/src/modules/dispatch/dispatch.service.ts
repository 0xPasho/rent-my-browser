import { eq, and, sql, gt, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { tasks } from "../../db/schema/tasks.js";
import { nodes } from "../../db/schema/nodes.js";
import { offers } from "../../db/schema/offers.js";
import { getPricePerStep, calculateEstimatedCost } from "../tasks/tasks.lib.js";
import { releaseBudget } from "../ledger/ledger.service.js";

const OFFER_TTL_MS = 15_000; // 15 seconds
const MAX_OFFERS_PER_ROUND = 5;
const MAX_ROUTING_ROUNDS = 3;

interface RoutingTier {
  label: string;
  filters: {
    type?: "headless" | "real";
    geo?: string;
    mode?: string;
    minScore?: number;
    ipType?: string;
  };
}

function buildRoutingTiers(task: {
  tier: string | null;
  mode: string;
  geo: string | null;
  context: unknown;
}): RoutingTier[] {
  const routing = (task.context as Record<string, unknown>)?.routing as {
    geo?: string;
    site?: string;
    requiresResidentialIp?: boolean;
    botDetectionLevel?: string;
  } | undefined;

  const tiers: RoutingTier[] = [];
  const geo = routing?.geo || task.geo;
  const type = task.tier as "headless" | "real" | undefined;
  const requiresResidential = routing?.requiresResidentialIp;

  // Tier 1: Tight match — exact geo + type + high score + residential if needed
  if (geo) {
    tiers.push({
      label: `exact: ${type || "any"} + ${geo} + score>80${requiresResidential ? " + residential" : ""}`,
      filters: {
        type: type || undefined,
        geo,
        mode: task.mode,
        minScore: 80,
        ipType: requiresResidential ? "residential" : undefined,
      },
    });
  }

  // Tier 2: Wider geo (drop exact geo, keep type + mode)
  tiers.push({
    label: `wider: ${type || "any"} + any geo + score>50`,
    filters: {
      type: type || undefined,
      mode: task.mode,
      minScore: 50,
    },
  });

  // Tier 3: Widest — just type compatibility
  tiers.push({
    label: `widest: ${type || "any"} + any`,
    filters: {
      type: type || undefined,
    },
  });

  return tiers;
}

async function findEligibleNodes(
  filters: RoutingTier["filters"],
  excludeNodeIds: string[],
  limit: number,
): Promise<{ id: string; accountId: string; score: number }[]> {
  const conditions = [
    eq(nodes.isOnline, true),
  ];

  if (filters.type) {
    conditions.push(eq(nodes.type, filters.type));
  }

  if (filters.minScore) {
    conditions.push(gt(nodes.score, filters.minScore));
  }

  // Build the query
  let query = db
    .select({
      id: nodes.id,
      accountId: nodes.accountId,
      score: nodes.score,
    })
    .from(nodes)
    .where(and(...conditions))
    .orderBy(desc(nodes.score))
    .limit(limit);

  const results = await query;

  // Post-filter by geo, mode, ipType (jsonb fields)
  return results.filter((node) => {
    if (excludeNodeIds.includes(node.id)) return false;
    return true;
  });
}

// More precise filtering that checks jsonb fields
async function findEligibleNodesWithJsonFilters(
  filters: RoutingTier["filters"],
  excludeNodeIds: string[],
  limit: number,
): Promise<{ id: string; accountId: string; score: number }[]> {
  const conditions: ReturnType<typeof eq>[] = [
    eq(nodes.isOnline, true),
  ];

  if (filters.type) {
    conditions.push(eq(nodes.type, filters.type));
  }

  if (filters.minScore) {
    conditions.push(gt(nodes.score, filters.minScore));
  }

  if (filters.geo) {
    conditions.push(
      sql`${nodes.geo}->>'country' = ${filters.geo}`,
    );
  }

  if (filters.mode) {
    conditions.push(
      sql`${nodes.capabilities}->'modes' ? ${filters.mode}`,
    );
  }

  if (filters.ipType) {
    conditions.push(
      sql`${nodes.geo}->>'ip_type' = ${filters.ipType}`,
    );
  }

  if (excludeNodeIds.length > 0) {
    conditions.push(
      sql`${nodes.id} NOT IN (${sql.join(excludeNodeIds.map((id) => sql`${id}::uuid`), sql`, `)})`,
    );
  }

  const results = await db
    .select({
      id: nodes.id,
      accountId: nodes.accountId,
      score: nodes.score,
    })
    .from(nodes)
    .where(and(...conditions))
    .orderBy(desc(nodes.score))
    .limit(limit);

  return results;
}

export async function broadcastOffers(
  taskId: string,
  round: number = 1,
  excludeNodeIds: string[] = [],
): Promise<number> {
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId));

  if (!task) return 0;

  // Don't broadcast if task is no longer in a broadcastable state
  if (!["queued", "offered"].includes(task.status as string)) return 0;

  const routingTiers = buildRoutingTiers(task);

  // Try each tier starting from tightest, stop when we find nodes
  let selectedNodes: { id: string; accountId: string; score: number }[] = [];

  for (const tier of routingTiers) {
    selectedNodes = await findEligibleNodesWithJsonFilters(
      tier.filters,
      excludeNodeIds,
      MAX_OFFERS_PER_ROUND,
    );

    if (selectedNodes.length > 0) {
      console.log(
        `Dispatch: task ${taskId} round ${round} — matched ${selectedNodes.length} nodes at tier "${tier.label}"`,
      );
      break;
    }
  }

  if (selectedNodes.length === 0) {
    console.log(
      `Dispatch: task ${taskId} round ${round} — no eligible nodes found`,
    );
    // No nodes at any tier — task stays queued, will retry on next expiry cycle
    return 0;
  }

  const expiresAt = new Date(Date.now() + OFFER_TTL_MS);
  const pricePerStep = getPricePerStep(
    task.tier as "headless" | "real",
    task.mode as "simple" | "adversarial",
  );

  // Create offers for selected nodes
  const offerValues = selectedNodes.map((node) => ({
    taskId,
    nodeId: node.id,
    expiresAt,
  }));

  await db.insert(offers).values(offerValues);

  // Update task status to "offered"
  await db
    .update(tasks)
    .set({ status: "offered" })
    .where(eq(tasks.id, taskId));

  return selectedNodes.length;
}

async function downgradeTask(taskId: string): Promise<boolean> {
  const [task] = await db
    .select({
      tier: tasks.tier,
      settings: tasks.settings,
      estimatedSteps: tasks.estimatedSteps,
    })
    .from(tasks)
    .where(eq(tasks.id, taskId));

  if (!task) return false;

  const settings = task.settings as { allow_downgrade: boolean } | null;
  const allowDowngrade = settings?.allow_downgrade ?? true;

  // Can only downgrade real → headless
  if (!allowDowngrade || task.tier !== "real") return false;

  const newEstimatedCost = calculateEstimatedCost(
    "headless",
    "simple",
    task.estimatedSteps ?? 0,
  );

  await db
    .update(tasks)
    .set({
      tier: "headless",
      mode: "simple",
      estimatedCost: newEstimatedCost,
      status: "queued",
    })
    .where(eq(tasks.id, taskId));

  console.log(
    `Dispatch: task ${taskId} — downgraded from real to headless (mode: simple)`,
  );

  return true;
}

export async function rebroadcastExpiredOffers(): Promise<void> {
  // Find tasks that have all offers expired and haven't been claimed
  const expiredTasks = await db
    .select({
      taskId: tasks.id,
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.status, "offered"),
      ),
    );

  for (const { taskId } of expiredTasks) {
    // Check if all offers for this task are expired
    const pendingOffers = await db
      .select({ id: offers.id })
      .from(offers)
      .where(
        and(
          eq(offers.taskId, taskId),
          eq(offers.status, "pending"),
        ),
      )
      .limit(1);

    if (pendingOffers.length > 0) continue; // Still has pending offers

    // Count how many rounds we've done
    const allOffers = await db
      .select({ nodeId: offers.nodeId })
      .from(offers)
      .where(eq(offers.taskId, taskId));

    const round = Math.ceil(allOffers.length / MAX_OFFERS_PER_ROUND) + 1;
    const excludeNodeIds = allOffers.map((o) => o.nodeId);

    if (round > MAX_ROUTING_ROUNDS) {
      // Try downgrading tier before failing
      const downgraded = await downgradeTask(taskId);

      if (downgraded) {
        // Fresh rounds with the new tier, no exclusions
        await broadcastOffers(taskId, 1, []);
        continue;
      }

      // No downgrade possible — fail the task and release budget
      console.log(
        `Dispatch: task ${taskId} — max rounds exceeded, no downgrade available, failing task`,
      );

      const [task] = await db
        .select({ accountId: tasks.accountId, maxBudget: tasks.maxBudget })
        .from(tasks)
        .where(eq(tasks.id, taskId));

      await db
        .update(tasks)
        .set({ status: "failed", completedAt: new Date() })
        .where(eq(tasks.id, taskId));

      if (task) {
        await releaseBudget(task.accountId, task.maxBudget, taskId);
      }

      continue;
    }

    await broadcastOffers(taskId, round, excludeNodeIds);
  }
}
