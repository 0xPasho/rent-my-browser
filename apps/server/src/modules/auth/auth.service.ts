import { eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { accounts } from "../../db/schema/accounts.js";
import { nodes } from "../../db/schema/nodes.js";
import { pendingPayments } from "../../db/schema/pending-payments.js";
import { challenges } from "../../db/schema/challenges.js";
import { env } from "../../env.js";
import {
  ValidationError,
  PaymentRequiredError,
  NotFoundError,
  AuthError,
} from "../../lib/errors.js";
import {
  generateApiKey,
  hashApiKey,
  generateChallenge,
  generatePaymentMemo,
  verifyWalletSignature,
  signDashboardJwt,
} from "./auth.lib.js";

interface AccountCreationResult {
  paymentDetails: {
    chain: string;
    token: string;
    address: string;
    amount: string;
    memo: string;
    expires_at: string;
  };
}

interface AccountConfirmResult {
  account_id: string;
  api_key: string;
  dashboard_url: string;
}

export async function initiateAccountCreation(
  walletAddress: string,
  type: "consumer" | "operator",
  nodeType?: "headless" | "real",
): Promise<AccountCreationResult> {
  const existing = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.walletAddress, walletAddress))
    .limit(1);

  if (existing.length > 0) {
    throw new ValidationError("Account already exists for this wallet address");
  }

  const memo = generatePaymentMemo("register");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await db.insert(pendingPayments).values({
    walletAddress,
    type: "registration",
    amount: 100, // $1.00 = 100 credits
    amountUsdc: "1.00",
    memo,
    expiresAt,
  });

  return {
    paymentDetails: {
      chain: "base",
      token: "USDC",
      address: env.PLATFORM_WALLET_ADDRESS,
      amount: "1.00",
      memo,
      expires_at: expiresAt.toISOString(),
    },
  };
}

export async function confirmAccountCreation(
  walletAddress: string,
  txHash: string,
  type: "consumer" | "operator",
  nodeType?: "headless" | "real",
): Promise<AccountConfirmResult> {
  const [payment] = await db
    .select()
    .from(pendingPayments)
    .where(
      and(
        eq(pendingPayments.walletAddress, walletAddress),
        eq(pendingPayments.type, "registration"),
        eq(pendingPayments.status, "pending"),
      ),
    )
    .limit(1);

  if (!payment) {
    throw new NotFoundError("No pending registration found for this wallet");
  }

  if (new Date() > payment.expiresAt) {
    await db
      .update(pendingPayments)
      .set({ status: "expired" })
      .where(eq(pendingPayments.id, payment.id));
    throw new ValidationError("Registration payment has expired");
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

  const rawApiKey = generateApiKey(type);
  const apiKeyHash = hashApiKey(rawApiKey);

  const [account] = await db
    .insert(accounts)
    .values({
      walletAddress,
      apiKeyHash,
      type,
    })
    .returning({ id: accounts.id });

  if (type === "operator" && nodeType) {
    await db.insert(nodes).values({
      accountId: account.id,
      type: nodeType,
    });
  }

  const jwt = await signDashboardJwt(account.id);
  const dashboardUrl = `https://app.rentmybrowser.com/session?token=${jwt}`;

  return {
    account_id: account.id,
    api_key: rawApiKey,
    dashboard_url: dashboardUrl,
  };
}

export async function createChallenge(
  walletAddress: string,
): Promise<{ message: string }> {
  const existing = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.walletAddress, walletAddress))
    .limit(1);

  if (existing.length === 0) {
    throw new NotFoundError("No account found for this wallet address");
  }

  const message = generateChallenge(walletAddress);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await db.insert(challenges).values({
    walletAddress,
    message,
    expiresAt,
  });

  return { message };
}

export async function verifyChallenge(
  walletAddress: string,
  signature: string,
): Promise<AccountConfirmResult> {
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
    .select({ id: accounts.id, apiKeyHash: accounts.apiKeyHash })
    .from(accounts)
    .where(eq(accounts.walletAddress, walletAddress))
    .limit(1);

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  // Generate a new API key on re-auth (rotate)
  const rawApiKey = generateApiKey(
    walletAddress.startsWith("rmb_n_") ? "operator" : "consumer",
  );
  const newHash = hashApiKey(rawApiKey);

  // Look up account type for the new key prefix
  const [fullAccount] = await db
    .select({ id: accounts.id, type: accounts.type })
    .from(accounts)
    .where(eq(accounts.walletAddress, walletAddress))
    .limit(1);

  const newApiKey = generateApiKey(fullAccount.type);
  const apiKeyHash = hashApiKey(newApiKey);

  await db
    .update(accounts)
    .set({ apiKeyHash, updatedAt: new Date() })
    .where(eq(accounts.id, fullAccount.id));

  const jwt = await signDashboardJwt(fullAccount.id);
  const dashboardUrl = `https://app.rentmybrowser.com/session?token=${jwt}`;

  return {
    account_id: fullAccount.id,
    api_key: newApiKey,
    dashboard_url: dashboardUrl,
  };
}
