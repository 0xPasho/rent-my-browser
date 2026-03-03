import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  OPENROUTER_API_KEY: z.string().optional(),
  BASE_RPC_URL: z.string().default("https://mainnet.base.org"),
  BASE_NETWORK: z.enum(["mainnet", "testnet"]).default("testnet"),
  PLATFORM_WALLET_ADDRESS: z
    .string()
    .default("0x0000000000000000000000000000000000000000"),
  X402_FACILITATOR_URL: z.string().default("https://www.x402.org/facilitator"),
  UPLOAD_DIR: z.string().default("/tmp/rmb-uploads"),
});

export const env = envSchema.parse(process.env);

// Base network CAIP-2 identifiers
export const BASE_CHAIN_ID =
  env.BASE_NETWORK === "mainnet" ? "eip155:8453" : "eip155:84532";

export const isSandbox = env.NODE_ENV === "development";
