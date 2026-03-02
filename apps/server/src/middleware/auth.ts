import type { Request, Response, NextFunction } from 'express';
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { accounts } from '../db/schema/accounts.js';
import { AuthError } from '../lib/errors.js';

export interface AuthAccount {
  id: string;
  type: 'consumer' | 'operator';
  walletAddress: string;
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

export const auth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AuthError('Missing or invalid Authorization header'));
    return;
  }

  const apiKey = header.slice(7);
  const hash = hashApiKey(apiKey);

  const [account] = await db
    .select({
      id: accounts.id,
      type: accounts.type,
      walletAddress: accounts.walletAddress,
      balance: accounts.balance,
    })
    .from(accounts)
    .where(eq(accounts.apiKeyHash, hash))
    .limit(1);

  if (!account) {
    next(new AuthError('Invalid API key'));
    return;
  }

  req.account = account;
  next();
};
