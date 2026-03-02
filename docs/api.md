# API Endpoints

All endpoints use JSON. Auth via `Authorization: Bearer <api_key>` unless noted.

## Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/accounts` | None | Create consumer account. Returns 402 with USDC payment request. |
| POST | `/accounts/confirm` | None | Confirm consumer registration with tx_hash. Returns API key. |
| POST | `/nodes` | None | Create node operator account. Returns 402 with USDC payment request. |
| POST | `/nodes/confirm` | None | Confirm node registration with tx_hash. Returns API key. |
| POST | `/auth/challenge` | None | Request a challenge message for wallet signature. |
| POST | `/auth/verify` | None | Submit signed challenge. Returns API key + dashboard URL (JWT). |

## Accounts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/accounts/me` | API key | Get account info: balance, total spent/earned, tasks completed. |
| POST | `/accounts/credits` | API key | Top up credits. `method`: `"stripe"` or `"crypto"`. Stripe returns checkout URL. Crypto returns 402 with USDC payment details. |
| POST | `/accounts/credits/confirm` | API key | Confirm crypto topup with tx_hash. Credits added. |
| POST | `/accounts/withdrawals` | API key (operator) | Withdraw earnings. `method`: `"stripe"` or `"crypto"`. Crypto sends USDC to registered wallet. |

## Tasks (Consumer)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/tasks` | API key | Submit a task. Body: `{ goal, context, max_budget }`. Returns 202 with task_id + estimate. |
| GET | `/tasks/:id` | API key | Get task status and result (polling). |
| GET | `/tasks/:id/stream` | API key | SSE stream of task status updates and step progress. |
| WS | `/tasks/:id/stream` | API key | WebSocket for async mode. Bidirectional — receive status, send mid-task input (OTP etc). |
| POST | `/tasks/:id/confirm` | None | Confirm x402 payment for a task (tx_hash). For consumers paying per-task without an account. |

## Nodes (Operator)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/nodes/:id/heartbeat` | API key | Register/update node capabilities (type, browser, geo, modes). Keeps the node alive in the pool. |
| GET | `/nodes/:id/offers` | API key | Poll for pending task offers. Returns array of offers (summary only, no consumer data). |

## Offers (Operator)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/offers/:id/claim` | API key | Claim an offer. First to claim wins (200). Late claims get 409. |

## Task Execution (Operator)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/tasks/:id` | API key | Get full task payload (goal + context) after claiming. |
| POST | `/tasks/:id/steps` | API key | Report a completed step. Body: `{ step, action, screenshot }`. |
| POST | `/tasks/:id/result` | API key | Submit final result. Multipart for file uploads. Body: `{ status, extracted_data, final_url }`. |

## Webhooks (Internal)

| Source | Description |
|---|---|
| Stripe | Payment confirmation for topups via Stripe Checkout. |
| Base/USDC | Onchain payment detection for crypto topups and registration. |

## Response Patterns

**Success**: `200` or `202` with JSON body.

**Payment required**: `402` with payment details (USDC address, amount, memo).

**Claim conflict**: `409` when an offer is already claimed.

**Auth error**: `401` for missing/invalid API key.

**Validation error**: `400` with `{ error, details }`.

**Insufficient credits**: `402` with `{ error: "insufficient_credits", balance, required }`.
