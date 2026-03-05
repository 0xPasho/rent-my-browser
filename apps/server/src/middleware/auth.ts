import type { Request, Response, NextFunction } from 'express';
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { accounts } from '../db/schema/accounts.js';
import { AuthError } from '../lib/errors.js';
import { verifyDashboardJwt } from '../modules/auth/auth.lib.js';

export interface AuthAccount {
  id: string;
  type: 'consumer' | 'operator';
  walletAddress: string | null;
  balance: number;
}

declare global {
  namespace Express {
    interface Request {
      account?: AuthAccount;
    }
  }
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

const accountFields = {
  id: accounts.id,
  type: accounts.type,
  walletAddress: accounts.walletAddress,
  balance: accounts.balance,
};

export const auth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AuthError('Missing or invalid Authorization header'));
    return;
  }

  const token = header.slice(7);

  // Try API key first
  const hash = hashApiKey(token);
  const [byKey] = await db
    .select(accountFields)
    .from(accounts)
    .where(eq(accounts.apiKeyHash, hash))
    .limit(1);

  if (byKey) {
    req.account = byKey;
    next();
    return;
  }

  // Fallback: try JWT session token
  try {
    const { accountId } = await verifyDashboardJwt(token);
    const [byJwt] = await db
      .select(accountFields)
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);

    if (byJwt) {
      req.account = byJwt;
      next();
      return;
    }
  } catch {
    // Not a valid JWT either
  }

  next(new AuthError('Invalid API key or session token'));
};
