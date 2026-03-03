import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { accounts } from "../../db/schema/accounts.js";
import { challenges } from "../../db/schema/challenges.js";
import {
  ValidationError,
  NotFoundError,
  AuthError,
} from "../../lib/errors.js";
import {
  generateApiKey,
  hashApiKey,
  generateChallenge,
  verifyWalletSignature,
  signDashboardJwt,
} from "../auth/auth.lib.js";
import { creditBalance, debitBalance } from "../ledger/ledger.service.js";
import { and } from "drizzle-orm";

// --- Registration ---

export async function createConsumerAccount(walletAddress: string) {
  const existing = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.walletAddress, walletAddress))
    .limit(1);

  if (existing.length > 0) {
    throw new ValidationError("Account already exists for this wallet address");
  }

  const rawApiKey = generateApiKey("consumer");
  const apiKeyHash = hashApiKey(rawApiKey);

  const [account] = await db
    .insert(accounts)
    .values({ walletAddress, apiKeyHash, type: "consumer" })
    .returning({ id: accounts.id });

  const jwt = await signDashboardJwt(account.id);

  return {
    account_id: account.id,
    api_key: rawApiKey,
    dashboard_url: `https://app.rentmybrowser.com/session?token=${jwt}`,
  };
}

// --- Account info ---

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

// --- Credits ---

export async function addCredits(accountId: string, amount: number) {
  await creditBalance(
    accountId,
    amount,
    "topup",
    undefined,
    `Topup ${amount} credits`,
  );

  const [updated] = await db
    .select({ balance: accounts.balance })
    .from(accounts)
    .where(eq(accounts.id, accountId));

  return { balance: updated.balance };
}

// --- Withdrawals ---

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

  return {
    amount,
    usd: `$${(amount / 100).toFixed(2)}`,
    address: account.walletAddress,
    status: "pending_manual_review",
  };
}

// --- Auth challenge/verify ---

export async function createChallenge(walletAddress: string) {
  const existing = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.walletAddress, walletAddress))
    .limit(1);

  if (existing.length === 0) {
    throw new NotFoundError("No account found for this wallet address");
  }

  const message = generateChallenge(walletAddress);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(challenges).values({ walletAddress, message, expiresAt });

  return { message };
}

export async function verifyChallenge(
  walletAddress: string,
  signature: string,
) {
  const [challenge] = await db
    .select()
    .from(challenges)
    .where(
      and(
        eq(challenges.walletAddress, walletAddress),
        eq(challenges.used, false),
      ),
    )
    .orderBy(challenges.createdAt)
    .limit(1);

  if (!challenge) {
    throw new NotFoundError("No pending challenge found for this wallet");
  }

  if (new Date() > challenge.expiresAt) {
    throw new ValidationError("Challenge has expired");
  }

  const isValid = await verifyWalletSignature(
    challenge.message,
    signature as `0x${string}`,
    walletAddress as `0x${string}`,
  );

  if (!isValid) {
    throw new AuthError("Invalid signature");
  }

  await db
    .update(challenges)
    .set({ used: true })
    .where(eq(challenges.id, challenge.id));

  const [account] = await db
    .select({ id: accounts.id, type: accounts.type })
    .from(accounts)
    .where(eq(accounts.walletAddress, walletAddress))
    .limit(1);

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  const newApiKey = generateApiKey(account.type);
  const apiKeyHash = hashApiKey(newApiKey);

  await db
    .update(accounts)
    .set({ apiKeyHash, updatedAt: new Date() })
    .where(eq(accounts.id, account.id));

  const jwt = await signDashboardJwt(account.id);

  return {
    account_id: account.id,
    api_key: newApiKey,
    dashboard_url: `https://app.rentmybrowser.com/session?token=${jwt}`,
  };
}
