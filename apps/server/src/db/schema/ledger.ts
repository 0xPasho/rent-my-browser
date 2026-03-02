import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts.js";

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

export const ledgerEntries = pgTable("ledger_entries", {
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
});
