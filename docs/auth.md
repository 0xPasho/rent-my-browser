# Authentication & Identity

## Core Concept

Wallet address = identity. No passwords, no usernames, no OAuth. Accounts are
created by paying from a wallet. Ownership is proved by signing a message with
that wallet's private key.

This works for both humans (MetaMask, Coinbase Wallet) and autonomous agents
(programmatic key pair generation).

## Account Creation

Both consumers and node operators create accounts the same way — by paying a
small registration fee from their wallet. The payment proves wallet ownership.

### Consumer

```
POST /accounts
{ "wallet_address": "0x..." }
→ 402 {
    chain: "base",
    token: "USDC",
    address: "0x...",
    amount: "1.00",
    memo: "register_abc123"
  }

(pay $1 USDC from the wallet)

POST /accounts/confirm
{ "wallet_address": "0x...", "tx_hash": "0x..." }
→ {
    "account_id": "uuid",
    "api_key": "rmb_c_...",
    "dashboard_url": "https://app.rentmybrowser.com/session?token=eyJ..."
  }
```

### Node operator

```
POST /nodes
{ "wallet_address": "0x...", "node_type": "real" }
→ 402 {
    chain: "base",
    token: "USDC",
    address: "0x...",
    amount: "1.00",
    memo: "register_node_def456"
  }

(pay $1 USDC from the wallet)

POST /nodes/confirm
{ "wallet_address": "0x...", "tx_hash": "0x..." }
→ {
    "node_id": "uuid",
    "api_key": "rmb_n_...",
    "dashboard_url": "https://app.rentmybrowser.com/session?token=eyJ..."
  }
```

## How Agents Get Wallets

Wallets are just key pairs. Any agent can generate one programmatically:

```javascript
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount(generatePrivateKey())
// account.address → "0x..." (the wallet address)
// The agent stores the private key, uses the address as identity
```

No signup, no KYC, no service. Just math. The agent funds the wallet with USDC
(from an exchange, another wallet, or another agent) and registers.

## Authentication (After Account Creation)

The API key is the primary auth method for all API calls:

```
POST /tasks
Authorization: Bearer rmb_c_...
{ goal, context, max_budget }
```

## Re-Authentication (Dashboard Access, Key Recovery)

When a user needs to access the dashboard, recover a lost API key, or prove
they own an account, they sign a challenge message.

### Challenge-response flow

```
POST /auth/challenge
{ "wallet_address": "0x..." }
→ { "message": "Sign this to verify: rmb_auth_abc123_1709312400" }

POST /auth/verify
{ "wallet_address": "0x...", "signature": "0x..." }
→ {
    "api_key": "rmb_c_...",
    "account_id": "uuid",
    "dashboard_url": "https://app.rentmybrowser.com/session?token=eyJ..."
  }
```

The `dashboard_url` contains a short-lived JWT (24h). Opening it in a browser
logs the user into the dashboard — no login form.

### How it works for each actor

**Autonomous agents** — sign programmatically with viem/ethers. Use the API key.
Ignore the dashboard URL.

```javascript
import { privateKeyToAccount } from 'viem/accounts'
const account = privateKeyToAccount(privateKey)
const signature = await account.signMessage({ message })
// POST /auth/verify with wallet_address + signature
```

**Humans on a website** — connect MetaMask or Coinbase Wallet, click "Sign" when
prompted, auto-redirected to dashboard.

**Humans from CLI** — sign via the API, get the dashboard URL, open it in a browser.

## API Key Usage

After account creation, the API key is used for everything:

| Action | Auth |
|---|---|
| Submit tasks | `Authorization: Bearer <api_key>` |
| Check balance | `Authorization: Bearer <api_key>` |
| Top up credits | `Authorization: Bearer <api_key>` |
| Withdraw earnings | `Authorization: Bearer <api_key>` |
| Node polling | `Authorization: Bearer <api_key>` |
| Claim offers | `Authorization: Bearer <api_key>` |
| Report steps/results | `Authorization: Bearer <api_key>` |

The wallet signature flow is only needed for:
- Initial account creation (wallet payment)
- Dashboard login
- API key recovery

## Account Types

| | Consumer | Node Operator |
|---|---|---|
| API key prefix | `rmb_c_` | `rmb_n_` |
| Created via | `POST /accounts` | `POST /nodes` |
| Identity | Wallet address | Wallet address |
| Has credit balance | Yes (spends) | Yes (earns) |
| Can submit tasks | Yes | No |
| Can claim offers | No | Yes |
| Can withdraw | No (only top up) | Yes |
| Payout address | N/A | Same wallet used to register |

## Security

- API keys are long, random, prefixed (`rmb_c_`, `rmb_n_`) for easy identification.
- Challenge messages include a nonce and timestamp to prevent replay attacks.
- JWTs for dashboard sessions are short-lived (24h).
- The registration fee ($1) prevents spam account creation.
- Wallet signatures are verified onchain-standard (EIP-191).
