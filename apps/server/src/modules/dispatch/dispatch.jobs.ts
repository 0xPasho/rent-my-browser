import { eq, and, lt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { offers } from "../../db/schema/offers.js";
import { rebroadcastExpiredOffers } from "./dispatch.service.js";
import { markStaleNodesOffline } from "../nodes/nodes.service.js";

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

let offerExpiryInterval: ReturnType<typeof setInterval> | null = null;
let nodeLivenessInterval: ReturnType<typeof setInterval> | null = null;

export function startDispatchJobs(): void {
  offerExpiryInterval = setInterval(expireOffers, 5_000);
  nodeLivenessInterval = setInterval(checkNodeLiveness, 30_000);
  console.log("Dispatch jobs started (offer expiry: 5s, node liveness: 30s)");
}

export function stopDispatchJobs(): void {
  if (offerExpiryInterval) clearInterval(offerExpiryInterval);
  if (nodeLivenessInterval) clearInterval(nodeLivenessInterval);
}
