import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";

// --- Enums ---

export const accountTypeEnum = pgEnum("account_type", ["consumer", "operator"]);
export const nodeTypeEnum = pgEnum("node_type", ["headless", "real"]);
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
export const offerStatusEnum = pgEnum("offer_status", [
  "pending",
  "claimed",
  "expired",
  "rejected",
]);
export const ledgerTypeEnum = pgEnum("ledger_type", ["debit", "credit"]);
export const ledgerCategoryEnum = pgEnum("ledger_category", [
  "registration",
  "topup",
  "task_hold",
  "task_charge",
  "task_refund",
  "platform_fee",
  "operator_payout",
  "withdrawal",
]);
export const paymentTypeEnum = pgEnum("payment_type", [
  "registration",
  "topup",
  "task",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "expired",
]);

// --- Tables ---

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  apiKeyHash: varchar("api_key_hash", { length: 128 }).notNull().unique(),
  type: accountTypeEnum("type").notNull(),
  balance: integer("balance").notNull().default(0),
  totalSpent: integer("total_spent").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const nodes = pgTable(
  "nodes",
  {
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
  },
  (t) => [
    index("nodes_account_id_idx").on(t.accountId),
    index("nodes_online_type_score_idx").on(t.isOnline, t.type, t.score),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
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
  },
  (t) => [
    index("tasks_account_id_idx").on(t.accountId),
    index("tasks_status_idx").on(t.status),
    index("tasks_node_id_idx").on(t.nodeId),
  ],
);

export const offers = pgTable(
  "offers",
  {
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
  },
  (t) => [
    index("offers_node_status_idx").on(t.nodeId, t.status),
    index("offers_task_status_idx").on(t.taskId, t.status),
    index("offers_expires_status_idx").on(t.expiresAt, t.status),
  ],
);

export const steps = pgTable(
  "steps",
  {
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
  },
  (t) => [
    index("steps_task_id_idx").on(t.taskId),
  ],
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    type: ledgerTypeEnum("type").notNull(),
    amount: integer("amount").notNull(),
    category: ledgerCategoryEnum("category").notNull(),
    referenceId: uuid("reference_id"),
    memo: varchar("memo", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ledger_account_id_idx").on(t.accountId),
    index("ledger_reference_id_idx").on(t.referenceId),
  ],
);

export const pendingPayments = pgTable(
  "pending_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
    type: paymentTypeEnum("type").notNull(),
    amount: integer("amount").notNull(),
    amountUsdc: varchar("amount_usdc", { length: 20 }).notNull(),
    memo: varchar("memo", { length: 100 }).notNull().unique(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    txHash: varchar("tx_hash", { length: 66 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("payments_wallet_status_idx").on(t.walletAddress, t.status),
  ],
);

export const challenges = pgTable(
  "challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
    message: varchar("message", { length: 255 }).notNull(),
    used: boolean("used").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("challenges_wallet_used_idx").on(t.walletAddress, t.used),
  ],
);

export const emailChallenges = pgTable(
  "email_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    token: varchar("token", { length: 128 }).notNull().unique(),
    accountId: uuid("account_id").references(() => accounts.id),
    used: boolean("used").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("email_challenges_token_idx").on(t.token),
    index("email_challenges_email_used_idx").on(t.email, t.used),
  ],
);
