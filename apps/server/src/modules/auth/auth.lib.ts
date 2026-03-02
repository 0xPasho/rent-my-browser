import { createHash, randomBytes } from "node:crypto";
import { verifyMessage } from "viem";
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import { env } from "../../env.js";

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export function generateApiKey(type: "consumer" | "operator"): string {
  const prefix = type === "consumer" ? "rmb_c_" : "rmb_n_";
  const random = randomBytes(32).toString("hex");
  return `${prefix}${random}`;
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function verifyWalletSignature(
  message: string,
  signature: `0x${string}`,
  expectedAddress: `0x${string}`,
): Promise<boolean> {
  try {
    const valid = await verifyMessage({
      message,
      signature,
      address: expectedAddress,
    });
    return valid;
  } catch {
    return false;
  }
}

export function generateChallenge(walletAddress: string): string {
  const nonce = nanoid(16);
  const timestamp = Math.floor(Date.now() / 1000);
  return `Sign this to verify: rmb_auth_${nonce}_${timestamp}_${walletAddress}`;
}

export function generatePaymentMemo(type: "register" | "topup"): string {
  return `${type}_${nanoid(16)}`;
}

export async function signDashboardJwt(accountId: string): Promise<string> {
  return new SignJWT({ accountId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(jwtSecret);
}

export async function verifyDashboardJwt(
  token: string,
): Promise<{ accountId: string }> {
  const { payload } = await jwtVerify(token, jwtSecret);
  return { accountId: payload.accountId as string };
}
