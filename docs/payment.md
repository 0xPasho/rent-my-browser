# Payment System

## Accounts

Everything is API-first. No website needed. Wallet address = identity.
See [Auth](./auth.md) for full details on account creation, wallet-based
verification, and challenge-response authentication.

### Consumer account

```
POST /accounts
{ "wallet_address": "0x..." }
→ 402 → pay $1 USDC → { "api_key": "rmb_c_..." }
```

The wallet address is the identity. The API key is used for all subsequent
requests. The credit balance is tied to the account.

### Node operator account

```
POST /nodes
{ "wallet_address": "0x...", "node_type": "real" }
→ 402 → pay $1 USDC → { "api_key": "rmb_n_..." }
```

Same model. API key goes into OpenClaw skill env vars. Node starts earning.
Payouts go back to the same wallet used to register.

## Credits

1 credit = 1 cent (USD). Simple, no made-up token economy.

```
$1 topup  = 100 credits
$10 topup = 1000 credits
```

Consumers prepay credits. Balance is stored in Postgres, tied to the API key.

### Top up

```
POST /accounts/credits
{ "amount": 1000 }
→ 402 {
    chain: "base",
    token: "USDC",
    address: "0x...",
    amount: "10.00",
    memo: "topup_abc123",
    expires_at: "2026-..."
  }

Agent sends USDC to address with memo → platform detects payment → credits added

POST /accounts/credits/confirm
{ "tx_hash": "0x..." }
→ { "balance": 1800 }
```

Fully programmatic. An autonomous AI agent can top up and submit tasks
without any human in the loop.

### Check balance

```
GET /accounts/me
→ { "balance": 800, "total_spent": 200, "tasks_completed": 3 }
```

## Pricing Model

Pricing is **per-step, based on actual execution**. The AI estimates a quote
upfront, but the consumer pays for what actually happens.

### How it works

1. Consumer submits task with a **max budget** in credits (hard ceiling).
2. AI estimates complexity tier and step count → produces a **quote**.
3. Max budget is **held** (reserved from consumer's balance).
4. Node executes and reports each step.
5. On completion: `actual_cost = base_price_per_step × actual_steps_executed`.
6. Consumer is charged actual_cost. Unused budget is released.

### Base prices per step

| Tier | Mode | Per step | 10-step task |
|---|---|---|---|
| Headless | Simple | 5 credits ($0.05) | 50 credits ($0.50) |
| Real | Simple | 10 credits ($0.10) | 100 credits ($1.00) |
| Real | Adversarial | 15 credits ($0.15) | 150 credits ($1.50) |

Starting prices. Tuned based on market demand.

### Example

```
Consumer submits: max_budget = 300 credits
AI estimates:     5 steps, ~100 credits (real + simple)
Node executes:    4 steps (finished faster than expected)
Actual charge:    4 × 10 = 40 credits
Consumer keeps:   260 credits back in their balance
```

## The Split

Every completed task splits the charge:

```
Platform takes: 20% of actual cost
Operator gets:  80% of actual cost
```

Example: task costs 100 credits → platform gets 20, operator gets 80.

Operator's 80 credits = $0.80 in their ledger balance.

## Task Payment Flow

### With credits (fast path)

```
Consumer                           Platform
   │                                  │
   │── POST /tasks ──────────────────>│
   │   Authorization: Bearer <key>    │
   │   { goal, context, max_budget }  │
   │                                  │── validate, estimate
   │                                  │── hold max_budget from balance
   │                                  │── broadcast offer to nodes
   │<── 202 { task_id, estimate } ────│
   │                                  │
   │   ... node claims and executes ..│
   │                                  │
   │── GET /tasks/:id ───────────────>│
   │<── 200 { result, actual_cost } ──│
   │                                  │── charge actual_cost
   │                                  │── release remaining hold
```

### With x402 (no account, USDC on Base)

```
Consumer                           Platform
   │                                  │
   │── POST /tasks ──────────────────>│
   │   { goal, context, max_budget }  │
   │                                  │── validate, estimate
   │<── 402 {                    ─────│
   │     task_id,                     │
   │     estimate,                    │
   │     chain: "base",              │
   │     token: "USDC",             │
   │     address: "0x...",           │
   │     amount: "3.00",            │
   │     expires_at                   │
   │   }                              │
   │                                  │
   │── (send USDC on Base) ─────────>│
   │                                  │
   │── POST /tasks/:id/confirm ──────>│
   │   { tx_hash: "0x..." }          │
   │                                  │── verify onchain
   │                                  │── broadcast offer to nodes
   │<── 202 { task_id } ─────────────│
   │                                  │
   │   ... node claims and executes ..│
   │                                  │
   │── GET /tasks/:id ───────────────>│
   │<── 200 { result, actual_cost } ──│
   │                                  │── refund difference onchain
```

## Double-Entry Ledger

Postgres-based. Every transaction creates balanced entries. The ledger is the
source of truth for all financial state.

### On task completion

```
DEBIT   consumer_hold        300 credits  (release hold)
CREDIT  consumer_balance     260 credits  (unused budget returned)
DEBIT   consumer_balance      40 credits  (actual task cost)
CREDIT  platform_revenue       8 credits  (20% platform fee)
CREDIT  operator_balance      32 credits  (80% to node operator)
```

### On operator withdrawal

```
DEBIT   operator_balance    5000 credits  (accumulated balance)
CREDIT  operator_payout     5000 credits  (sent to operator)
```

### Principles

- Every debit has a matching credit. Always balanced.
- All entries are append-only. No mutations, no deletions.
- Refunds are new entries, not reversals of existing ones.
- The ledger is the source of truth for all financial state.

## Operator Earnings & Payouts

Operators earn 80% of every task their node completes. Balances accumulate
in the Postgres ledger.

### Check earnings

```
GET /accounts/me
→ { "balance": 4500, "total_earned": 12000, "tasks_completed": 87 }
```

Balance is in credits. 4500 credits = $45.00.

### Withdraw

Platform sends USDC to the wallet address used to register. No need to
provide an address — it's already on file.

```
POST /accounts/withdrawals
{ "amount": 4500 }
→ { "amount": 4500, "usd": "$45.00", "address": "0x...", "tx_hash": "0x...", "status": "sent" }
```

### Payout policy

- Minimum withdrawal: 500 credits ($5.00)
- No real-time per-task payouts — too expensive and complex
- Manual review for v1. Automatic onchain for v2.

### No custody, no wallet management

- The platform holds a **ledger balance** (a number in Postgres), not money.
- Consumer pays in → USDC goes to platform wallet.
- Operator cashes out → platform sends USDC to their registered wallet.
- One platform wallet. Everyone else has a number.
