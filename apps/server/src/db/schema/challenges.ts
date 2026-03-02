import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  message: varchar("message", { length: 255 }).notNull(),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
