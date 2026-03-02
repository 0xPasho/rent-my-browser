import {
  pgTable,
  uuid,
  integer,
  timestamp,
  jsonb,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts.js";

export const nodeTypeEnum = pgEnum("node_type", ["headless", "real"]);

export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  type: nodeTypeEnum("type").notNull(),
  browser: jsonb("browser").$type<{ name: string; version: string }>(),
  geo: jsonb("geo").$type<{
    country: string;
    region?: string;
    city?: string;
    ip_type: string;
  }>(),
  capabilities: jsonb("capabilities").$type<{
    modes: string[];
    max_concurrent: number;
  }>(),
  score: integer("score").notNull().default(100),
  isOnline: boolean("is_online").notNull().default(false),
  lastHeartbeat: timestamp("last_heartbeat", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
