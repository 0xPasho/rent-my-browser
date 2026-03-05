import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  OPENROUTER_API_KEY: z.string().optional(),
  BASE_RPC_URL: z.string().default("https://mainnet.base.org"),
  BASE_NETWORK: z.enum(["mainnet", "testnet"]).default("testnet"),
  PLATFORM_WALLET_ADDRESS: z
    .string()
    .default("0x0000000000000000000000000000000000000000"),
  CDP_API_KEY_ID: z.string().min(1),
  CDP_API_KEY_SECRET: z.string().min(1),
  S3_ENDPOINT: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().default("rentmybrowser"),
  S3_REGION: z.string().default("us-east-1"),
  DASHBOARD_URL: z.string().default("http://localhost:3001"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
});

export const env = envSchema.parse(process.env);

// Base network CAIP-2 identifiers
export const BASE_CHAIN_ID =
  env.BASE_NETWORK === "mainnet" ? "eip155:8453" : "eip155:84532";

export const isSandbox = env.NODE_ENV === "development";
