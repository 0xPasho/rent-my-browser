import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", ["consumer", "operator"]);

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
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
