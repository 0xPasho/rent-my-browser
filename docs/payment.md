# Payment System

## Pricing Model

Pricing is **per-step, deterministic**. No AI in the billing path.

```
task_price = base_price × step_count
```

- `base_price` varies by tier and mode:
  - Headless + Simple: lowest rate
  - Real + Simple: mid rate
  - Real + Adversarial: higher rate (more node resources, behavior simulation)
  - Real + Async: highest rate (session held open, waiting periods)
- `step_count` is determined by the AI decomposition layer

The price is calculated **before execution** and presented to the consumer. No
surprises.

## x402 Payment Protocol

The primary payment rail uses HTTP 402 (Payment Required) with Lightning Network
invoices.

### Flow

```
Consumer                           Platform
   │                                  │
   │── POST /tasks ──────────────────>│
   │   { goal, context }              │
   │                                  │── AI decomposes → 5 steps
   │                                  │── price = base × 5
   │                                  │
   │<── 402 Payment Required ─────────│
   │   {                              │
   │     task_id: "uuid",             │
   │     steps: 5,                    │
   │     price_sats: 500,             │
   │     invoice: "lnbc...",          │
   │     expires_at: "2026-..."       │
   │   }                              │
   │                                  │
   │── (pay lightning invoice) ──────>│
   │                                  │
   │── POST /tasks/:id/confirm ──────>│
   │   { payment_proof: "..." }       │
   │                                  │── dispatch to node
   │                                  │── node executes
   │                                  │
   │<── 200 OK ───────────────────────│
   │   { result }                     │
```

### Why x402

- **Machine-native**: AI agents and automated systems can pay without human
  intervention. Submit task → receive invoice → pay programmatically → get result.
- **No accounts needed**: One-shot payments without signup.
- **Instant settlement**: Lightning payments settle in seconds.
- **Micropayment friendly**: Per-task payments can be fractions of a cent.

## Credits (Parallel Rail)

For consumers who prefer traditional payment or need higher throughput, credits
provide a prepaid balance system.

### Flow

```
Consumer (API key + credit balance)
   │
   │── POST /tasks ──────────────────>│
   │   { goal, context }              │
   │   Authorization: Bearer <key>    │
   │                                  │── decompose, calculate price
   │                                  │── deduct from credit balance
   │                                  │── dispatch to node
   │                                  │
   │<── 200 OK ───────────────────────│
   │   { result, credits_remaining }  │
```

- No 402 round-trip — faster for high-volume consumers
- Credits purchased in bulk via Stripe, crypto, or other rails
- API key authentication
- Balance visible via `GET /account/balance`

## Double-Entry Ledger

Every completed task creates balanced ledger entries. The system uses double-entry
bookkeeping to ensure money is always accounted for.

### On task completion

```
DEBIT   consumer_account     500 sats    (task cost)
CREDIT  platform_revenue     100 sats    (20% platform fee)
CREDIT  operator_balance     400 sats    (80% to node operator)
```

### On operator payout

```
DEBIT   operator_balance     10,000 sats (accumulated balance)
CREDIT  operator_payout      10,000 sats (sent to operator wallet)
```

### Principles

- Every debit has a matching credit. Always balanced.
- All entries are append-only. No mutations, no deletions.
- Refunds are new entries, not reversals of existing ones.
- The ledger is the source of truth for all financial state.

## Operator Payouts

- Balances accumulate as the node completes tasks.
- Payouts are **batched**: weekly or when balance hits a threshold (e.g., 50,000
  sats).
- No real-time per-task payouts — too expensive and complex.
- Payout method: Lightning (primary), on-chain Bitcoin (fallback for large
  amounts).

## Open Questions

- **Refund policy**: What happens on task failure? Options:
  - Full refund on any failure
  - Partial refund (charge for completed steps only)
  - No refund if the node made a good-faith attempt
- **Dispute resolution**: If consumer claims the result is wrong, who arbitrates?
  Task recordings/screenshots could serve as evidence.
- **Dynamic pricing**: Should base_price adjust based on supply/demand? More
  available nodes → cheaper. High demand → premium. This adds complexity but
  maximizes operator earnings.
- **Async hold fee**: Async tasks tie up a node during wait periods. Flat
  reservation fee per wait period? Per-minute hold rate?
