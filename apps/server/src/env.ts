import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  OPENROUTER_API_KEY: z.string().optional(),
  BASE_RPC_URL: z.string().default("https://mainnet.base.org"),
  PLATFORM_WALLET_ADDRESS: z
    .string()
    .default("0x0000000000000000000000000000000000000000"),
  UPLOAD_DIR: z.string().default("/tmp/rmb-uploads"),
});

export const env = envSchema.parse(process.env);
