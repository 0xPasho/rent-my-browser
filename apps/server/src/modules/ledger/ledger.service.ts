import { eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { accounts } from "../../db/schema/accounts.js";
import { ledgerEntries } from "../../db/schema/ledger.js";
import { ValidationError } from "../../lib/errors.js";

type LedgerCategory =
  | "registration"
  | "topup"
  | "task_hold"
  | "task_charge"
  | "task_refund"
  | "platform_fee"
  | "operator_payout"
  | "withdrawal";

export async function creditBalance(
  accountId: string,
  amount: number,
  category: LedgerCategory,
  referenceId?: string,
  memo?: string,
) {
  await db.transaction(async (tx) => {
    await tx.insert(ledgerEntries).values({
      accountId,
      type: "credit",
      amount,
      category,
      referenceId,
      memo,
    });

    await tx
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountId));
  });
}

export async function debitBalance(
  accountId: string,
  amount: number,
  category: LedgerCategory,
  referenceId?: string,
  memo?: string,
) {
  await db.transaction(async (tx) => {
    const [account] = await tx
      .select({ balance: accounts.balance })
      .from(accounts)
      .where(eq(accounts.id, accountId));

    if (account.balance < amount) {
      throw new ValidationError(
        `Insufficient balance: have ${account.balance}, need ${amount}`,
      );
    }

    await tx.insert(ledgerEntries).values({
      accountId,
      type: "debit",
      amount,
      category,
      referenceId,
      memo,
    });

    await tx
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountId));
  });
}

export async function holdBudget(
  accountId: string,
  amount: number,
  taskId: string,
) {
  await debitBalance(accountId, amount, "task_hold", taskId, "Budget hold");
}

export async function releaseBudget(
  accountId: string,
  amount: number,
  taskId: string,
) {
  await creditBalance(
    accountId,
    amount,
    "task_refund",
    taskId,
    "Unused budget released",
  );
}

export async function chargeTask(
  consumerId: string,
  operatorId: string,
  actualCost: number,
  taskId: string,
) {
  const platformFee = Math.floor(actualCost * 0.2);
  const operatorPayout = actualCost - platformFee;

  await db.transaction(async (tx) => {
    // Platform fee
    await tx.insert(ledgerEntries).values({
      accountId: consumerId,
      type: "debit",
      amount: actualCost,
      category: "task_charge",
      referenceId: taskId,
      memo: "Task charge",
    });

    // Platform revenue (no account — tracked as category only)
    await tx.insert(ledgerEntries).values({
      accountId: consumerId,
      type: "debit",
      amount: platformFee,
      category: "platform_fee",
      referenceId: taskId,
      memo: "Platform fee (20%)",
    });

    // Operator earnings
    await tx.insert(ledgerEntries).values({
      accountId: operatorId,
      type: "credit",
      amount: operatorPayout,
      category: "operator_payout",
      referenceId: taskId,
      memo: "Task payout (80%)",
    });

    await tx
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${operatorPayout}`,
        totalEarned: sql`${accounts.totalEarned} + ${operatorPayout}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, operatorId));

    await tx
      .update(accounts)
      .set({
        totalSpent: sql`${accounts.totalSpent} + ${actualCost}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, consumerId));
  });
}
