import { eq, and } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../../db/index.js";
import { accounts } from "../../db/schema/accounts.js";
import { challenges } from "../../db/schema/challenges.js";
import { emailChallenges } from "../../db/schema/email-challenges.js";
import { ledgerEntries } from "../../db/schema/ledger.js";
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
  verifyDashboardJwt,
} from "../auth/auth.lib.js";
import { creditBalance, debitBalance } from "../ledger/ledger.service.js";
import { emailSender } from "../../lib/email.js";

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
    dashboard_url: `https://app.rentmybrowser.dev/session?token=${jwt}`,
  };
}

// --- Account info ---

export async function getAccount(accountId: string) {
  const [account] = await db
    .select({
      id: accounts.id,
      type: accounts.type,
      walletAddress: accounts.walletAddress,
      email: accounts.email,
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

export async function addCredits(accountId: string, amount: number, referenceId?: string) {
  // Idempotency: skip if this referenceId was already processed
  if (referenceId) {
    const [existing] = await db
      .select({ id: ledgerEntries.id })
      .from(ledgerEntries)
      .where(
        and(
          eq(ledgerEntries.referenceId, referenceId),
          eq(ledgerEntries.category, "topup"),
        ),
      )
      .limit(1);

    if (existing) {
      const [account] = await db
        .select({ balance: accounts.balance })
        .from(accounts)
        .where(eq(accounts.id, accountId));
      return { balance: account.balance };
    }
  }

  await creditBalance(
    accountId,
    amount,
    "topup",
    referenceId,
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
    dashboard_url: `https://app.rentmybrowser.dev/session?token=${jwt}`,
  };
}

// --- Email magic link ---

export async function sendEmailMagicLink(email: string, baseUrl: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  // Find existing account with this email
  const [existing] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1);

  await db.insert(emailChallenges).values({
    email,
    token,
    accountId: existing?.id ?? null,
    expiresAt,
  });

  const url = `${baseUrl}/auth/email/verify?token=${token}`;
  await emailSender.sendMagicLink(email, url);

  return { sent: true };
}

export async function verifyEmailToken(token: string) {
  const [challenge] = await db
    .select()
    .from(emailChallenges)
    .where(
      and(
        eq(emailChallenges.token, token),
        eq(emailChallenges.used, false),
      ),
    )
    .limit(1);

  if (!challenge) {
    throw new NotFoundError("Invalid or expired magic link");
  }

  if (new Date() > challenge.expiresAt) {
    throw new ValidationError("Magic link has expired");
  }

  // Mark as used
  await db
    .update(emailChallenges)
    .set({ used: true })
    .where(eq(emailChallenges.id, challenge.id));

  let accountId: string;

  if (challenge.accountId) {
    // Existing account — just log in
    accountId = challenge.accountId;
  } else {
    // New account — create consumer with a generated wallet placeholder
    const rawApiKey = generateApiKey("consumer");
    const apiKeyHash = hashApiKey(rawApiKey);
    // Use a deterministic placeholder wallet address (not a real wallet)
    const placeholderWallet = `0x${"0".repeat(40)}`;

    // Check if placeholder wallet is taken — generate unique one
    const walletAddress = `0x${randomBytes(20).toString("hex")}` as string;

    const [newAccount] = await db
      .insert(accounts)
      .values({
        walletAddress,
        email: challenge.email,
        apiKeyHash,
        type: "consumer",
      })
      .returning({ id: accounts.id });

    accountId = newAccount.id;
  }

  const jwt = await signDashboardJwt(accountId);

  return {
    account_id: accountId,
    token: jwt,
  };
}

// --- Session (JWT-based) ---

export async function getSession(jwtToken: string) {
  const { accountId } = await verifyDashboardJwt(jwtToken);
  return getAccount(accountId);
}

// --- Update email ---

export async function updateAccountEmail(accountId: string, email: string) {
  // Check if email is already taken by another account
  const [existing] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.email, email))
    .limit(1);

  if (existing && existing.id !== accountId) {
    throw new ValidationError("Email already in use by another account");
  }

  await db
    .update(accounts)
    .set({ email, updatedAt: new Date() })
    .where(eq(accounts.id, accountId));

  return { email };
}
