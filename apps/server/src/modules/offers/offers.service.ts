import { eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { offers } from "../../db/schema/offers.js";
import { tasks } from "../../db/schema/tasks.js";
import { nodes } from "../../db/schema/nodes.js";
import { ConflictError, NotFoundError, AuthError } from "../../lib/errors.js";

export async function claimOffer(
  offerId: string,
  nodeId: string,
  accountId: string,
) {
  // Verify node belongs to this account
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

  // Atomic claim with transaction
  return await db.transaction(async (tx) => {
    // Lock the offer row
    const [offer] = await tx
      .select()
      .from(offers)
      .where(eq(offers.id, offerId))
      .for("update");

    if (!offer) {
      throw new NotFoundError("Offer not found");
    }

    if (offer.nodeId !== nodeId) {
      throw new AuthError("This offer is not for your node");
    }

    if (offer.status !== "pending") {
      throw new ConflictError("Offer already claimed or expired");
    }

    if (new Date() > offer.expiresAt) {
      await tx
        .update(offers)
        .set({ status: "expired" })
        .where(eq(offers.id, offerId));
      throw new ConflictError("Offer has expired");
    }

    // Claim this offer
    await tx
      .update(offers)
      .set({ status: "claimed", claimedAt: new Date() })
      .where(eq(offers.id, offerId));

    // Expire all other pending offers for this task
    await tx
      .update(offers)
      .set({ status: "expired" })
      .where(
        and(eq(offers.taskId, offer.taskId), eq(offers.status, "pending")),
      );

    // Lock and verify the task row to prevent race with other offer claims
    const [task] = await tx
      .select()
      .from(tasks)
      .where(eq(tasks.id, offer.taskId))
      .for("update");

    if (!task || !["queued", "offered"].includes(task.status as string)) {
      throw new ConflictError("Task is no longer available");
    }

    // Assign node to task and update status
    await tx
      .update(tasks)
      .set({
        nodeId,
        status: "claimed",
        startedAt: new Date(),
      })
      .where(eq(tasks.id, offer.taskId));

    return {
      task_id: task.id,
      goal: task.goal,
      context: task.context,
      tier: task.tier,
      mode: task.mode,
      max_budget: task.maxBudget,
      estimated_steps: task.estimatedSteps,
    };
  });
}
