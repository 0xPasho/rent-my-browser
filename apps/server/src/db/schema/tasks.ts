import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts.js";
import { nodes } from "./nodes.js";

export const taskStatusEnum = pgEnum("task_status", [
  "submitted",
  "estimating",
  "queued",
  "offered",
  "claimed",
  "running",
  "completed",
  "failed",
]);
export const taskTierEnum = pgEnum("task_tier", ["headless", "real"]);
export const taskModeEnum = pgEnum("task_mode", ["simple", "adversarial"]);
export const complexityEnum = pgEnum("complexity", [
  "simple",
  "medium",
  "complex",
]);

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  nodeId: uuid("node_id").references(() => nodes.id),
  goal: text("goal").notNull(),
  context: jsonb("context"),
  status: taskStatusEnum("status").notNull().default("submitted"),
  tier: taskTierEnum("tier"),
  mode: taskModeEnum("mode").notNull().default("simple"),
  complexity: complexityEnum("complexity"),
  geo: text("geo"),
  maxBudget: integer("max_budget").notNull(),
  estimatedSteps: integer("estimated_steps"),
  estimatedCost: integer("estimated_cost"),
  stepsCompleted: integer("steps_completed").notNull().default(0),
  actualCost: integer("actual_cost"),
  result: jsonb("result"),
  durationMs: integer("duration_ms"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
