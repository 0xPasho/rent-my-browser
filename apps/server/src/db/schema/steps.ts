import {
  pgTable,
  uuid,
  integer,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { tasks } from "./tasks.js";

export const steps = pgTable("steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id),
  stepNumber: integer("step_number").notNull(),
  action: text("action").notNull(),
  screenshotUrl: varchar("screenshot_url", { length: 2048 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
