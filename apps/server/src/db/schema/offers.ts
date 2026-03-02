import { pgTable, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { tasks } from "./tasks.js";
import { nodes } from "./nodes.js";

export const offerStatusEnum = pgEnum("offer_status", [
  "pending",
  "claimed",
  "expired",
  "rejected",
]);

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id),
  nodeId: uuid("node_id")
    .notNull()
    .references(() => nodes.id),
  status: offerStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
