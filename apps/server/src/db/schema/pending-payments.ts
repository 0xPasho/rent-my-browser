import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

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

export const pendingPayments = pgTable("pending_payments", {
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
});
