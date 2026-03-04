import { eq, and, lt, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { offers } from "../../db/schema/offers.js";
import { tasks } from "../../db/schema/tasks.js";
import { rebroadcastExpiredOffers } from "./dispatch.service.js";
import { markStaleNodesOffline } from "../nodes/nodes.service.js";
import { releaseBudget } from "../ledger/ledger.service.js";

const DEFAULT_TIMEOUT_MS = 300_000;

async function expireOffers(): Promise<void> {
  try {
    // Mark expired pending offers
    const expired = await db
      .update(offers)
      .set({ status: "expired" })
      .where(
        and(
          eq(offers.status, "pending"),
          lt(offers.expiresAt, new Date()),
        ),
      )
      .returning({ id: offers.id });

    if (expired.length > 0) {
      console.log(`Dispatch jobs: expired ${expired.length} offers`);
    }

    // Rebroadcast tasks that lost all their offers
    await rebroadcastExpiredOffers();
  } catch (err) {
    console.error("Offer expiry job error:", err);
  }
}

async function checkNodeLiveness(): Promise<void> {
  try {
    const count = await markStaleNodesOffline();
    if (count > 0) {
      console.log(`Dispatch jobs: marked ${count} stale nodes offline`);
    }
  } catch (err) {
    console.error("Node liveness job error:", err);
  }
}

async function checkTaskTimeouts(): Promise<void> {
  try {
    const activeTasks = await db
      .select({
        id: tasks.id,
        accountId: tasks.accountId,
        maxBudget: tasks.maxBudget,
        settings: tasks.settings,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(inArray(tasks.status, ["queued", "offered"]));

    const now = Date.now();

    for (const task of activeTasks) {
      const settings = task.settings as { timeout_ms: number } | null;
      const timeoutMs = settings?.timeout_ms ?? DEFAULT_TIMEOUT_MS;
      const elapsed = now - task.createdAt.getTime();

      if (elapsed >= timeoutMs) {
        console.log(
          `Dispatch jobs: task ${task.id} timed out after ${elapsed}ms (limit: ${timeoutMs}ms)`,
        );

        // Expire remaining pending offers
        await db
          .update(offers)
          .set({ status: "expired" })
          .where(
            and(
              eq(offers.taskId, task.id),
              eq(offers.status, "pending"),
            ),
          );

        // Fail the task
        await db
          .update(tasks)
          .set({ status: "failed", completedAt: new Date() })
          .where(eq(tasks.id, task.id));

        // Release budget hold
        await releaseBudget(task.accountId, task.maxBudget, task.id);
      }
    }
  } catch (err) {
    console.error("Task timeout job error:", err);
  }
}

let offerExpiryInterval: ReturnType<typeof setInterval> | null = null;
let nodeLivenessInterval: ReturnType<typeof setInterval> | null = null;
let taskTimeoutInterval: ReturnType<typeof setInterval> | null = null;

export function startDispatchJobs(): void {
  offerExpiryInterval = setInterval(expireOffers, 5_000);
  nodeLivenessInterval = setInterval(checkNodeLiveness, 30_000);
  taskTimeoutInterval = setInterval(checkTaskTimeouts, 10_000);
  console.log("Dispatch jobs started (offer expiry: 5s, node liveness: 30s, task timeout: 10s)");
}

export function stopDispatchJobs(): void {
  if (offerExpiryInterval) clearInterval(offerExpiryInterval);
  if (nodeLivenessInterval) clearInterval(nodeLivenessInterval);
  if (taskTimeoutInterval) clearInterval(taskTimeoutInterval);
}
