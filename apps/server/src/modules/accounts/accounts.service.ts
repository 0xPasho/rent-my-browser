import { eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { accounts } from "../../db/schema/accounts.js";
import { pendingPayments } from "../../db/schema/pending-payments.js";
import { env } from "../../env.js";
import {
  ValidationError,
  NotFoundError,
  AuthError,
} from "../../lib/errors.js";
import { generatePaymentMemo } from "../auth/auth.lib.js";
import { creditBalance, debitBalance } from "../ledger/ledger.service.js";

export async function getAccount(accountId: string) {
  const [account] = await db
    .select({
      id: accounts.id,
      type: accounts.type,
      walletAddress: accounts.walletAddress,
      balance: accounts.balance,
      totalSpent: accounts.totalSpent,
      totalEarned: accounts.totalEarned,
      createdAt: accounts.createdAt,
    })
    .from(accounts)
    .where(eq(accounts.id, accountId));

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  return account;
}

export async function initiateTopup(accountId: string, amount: number) {
  const [account] = await db
    .select({ walletAddress: accounts.walletAddress })
    .from(accounts)
    .where(eq(accounts.id, accountId));

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  const amountUsdc = (amount / 100).toFixed(2);
  const memo = generatePaymentMemo("topup");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await db.insert(pendingPayments).values({
    walletAddress: account.walletAddress,
    type: "topup",
    amount,
    amountUsdc,
    memo,
    expiresAt,
  });

  return {
    chain: "base",
    token: "USDC",
    address: env.PLATFORM_WALLET_ADDRESS,
    amount: amountUsdc,
    memo,
    expires_at: expiresAt.toISOString(),
  };
}

export async function confirmTopup(accountId: string, txHash: string) {
  const [account] = await db
    .select({ walletAddress: accounts.walletAddress })
    .from(accounts)
    .where(eq(accounts.id, accountId));

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  const [payment] = await db
    .select()
    .from(pendingPayments)
    .where(
      and(
        eq(pendingPayments.walletAddress, account.walletAddress),
        eq(pendingPayments.type, "topup"),
        eq(pendingPayments.status, "pending"),
      ),
    )
    .orderBy(pendingPayments.createdAt)
    .limit(1);

  if (!payment) {
    throw new NotFoundError("No pending topup found");
  }

  if (new Date() > payment.expiresAt) {
    await db
      .update(pendingPayments)
      .set({ status: "expired" })
      .where(eq(pendingPayments.id, payment.id));
    throw new ValidationError("Topup payment has expired");
  }

  // TODO: Verify USDC transfer onchain via Base RPC
  // For v1, accept any tx_hash as valid

  await db
    .update(pendingPayments)
    .set({
      status: "confirmed",
      txHash,
      confirmedAt: new Date(),
    })
    .where(eq(pendingPayments.id, payment.id));

  await creditBalance(
    accountId,
    payment.amount,
    "topup",
    payment.id,
    `Topup ${payment.amountUsdc} USDC`,
  );

  const [updated] = await db
    .select({ balance: accounts.balance })
    .from(accounts)
    .where(eq(accounts.id, accountId));

  return { balance: updated.balance };
}

export async function requestWithdrawal(accountId: string, amount: number) {
  const [account] = await db
    .select({
      type: accounts.type,
      balance: accounts.balance,
      walletAddress: accounts.walletAddress,
    })
    .from(accounts)
    .where(eq(accounts.id, accountId));

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  if (account.type !== "operator") {
    throw new AuthError("Only operators can withdraw");
  }

  if (amount < 500) {
    throw new ValidationError("Minimum withdrawal is 500 credits ($5.00)");
  }

  if (account.balance < amount) {
    throw new ValidationError(
      `Insufficient balance: have ${account.balance}, need ${amount}`,
    );
  }

  await debitBalance(
    accountId,
    amount,
    "withdrawal",
    undefined,
    `Withdrawal ${(amount / 100).toFixed(2)} USDC`,
  );

  // TODO: Send USDC to account.walletAddress onchain
  // For v1, mark as pending manual review

  return {
    amount,
    usd: `$${(amount / 100).toFixed(2)}`,
    address: account.walletAddress,
    status: "pending_manual_review",
  };
}
