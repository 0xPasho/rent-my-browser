#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const stateDir = join(__dirname, "..", "state");
const walletFile = join(stateDir, "wallet.json");

mkdirSync(stateDir, { recursive: true });

if (existsSync(walletFile)) {
  const existing = JSON.parse(readFileSync(walletFile, "utf-8"));
  process.stdout.write(existing.address);
  process.exit(0);
}

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

writeFileSync(
  walletFile,
  JSON.stringify(
    { privateKey, address: account.address, createdAt: new Date().toISOString() },
    null,
    2
  )
);

process.stdout.write(account.address);
