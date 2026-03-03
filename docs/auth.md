# Authentication & Identity

## Core Concept

Wallet address = identity. No passwords, no OAuth. Registration is free.

Works for both humans (MetaMask) and agents (programmatic key pair).

## Registration

Both consumers and operators register for free:

```
POST /accounts
{ "wallet_address": "0x..." }
→ 201 { "account_id", "api_key": "rmb_c_...", "dashboard_url" }

POST /nodes
{ "wallet_address": "0x...", "node_type": "real" }
→ 201 { "account_id", "node_id", "api_key": "rmb_n_...", "dashboard_url" }
```

## How Agents Get Wallets

```javascript
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
const account = privateKeyToAccount(generatePrivateKey());
// account.address → "0x..."
```

## API Key Auth

All authenticated endpoints use Bearer token:

```
Authorization: Bearer rmb_c_...
```

API keys are stored as SHA-256 hashes. The raw key is returned once on
creation or recovery.

## Key Recovery (Challenge/Verify)

If you lose your API key but have your wallet private key:

```
POST /auth/challenge
{ "wallet_address": "0x..." }
→ { "message": "Sign this to verify: rmb_auth_..." }

POST /auth/verify
{ "wallet_address": "0x...", "signature": "0x..." }
→ { "account_id", "api_key": "rmb_c_...", "dashboard_url" }
```

The old API key is rotated out. The new one is returned.

## Account Types

| | Consumer | Operator |
|---|---|---|
| API key prefix | `rmb_c_` | `rmb_n_` |
| Registration | `POST /accounts` | `POST /nodes` |
| Can submit tasks | Yes | No |
| Can claim offers | No | Yes |
| Can top up credits | Yes | No |
| Can withdraw | No | Yes |
