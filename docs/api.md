# API Endpoints

All endpoints use JSON. Auth via `Authorization: Bearer <api_key>` unless noted.

## Accounts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/accounts` | No | Register consumer account (free). Returns API key. |
| GET | `/accounts/me` | API key | Account info: balance, spent, earned. |
| POST | `/auth/challenge` | No | Request wallet challenge message. |
| POST | `/auth/verify` | No | Submit signature → new API key + dashboard URL. |

## Credits

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/accounts/credits/crypto/:tier` | API key (consumer) | Top up via x402 (USDC on Base). Tiers: 100, 500, 1000, 5000, 20000. |
| POST | `/accounts/credits/stripe` | API key (consumer) | Stub (501). |
| POST | `/accounts/credits/alternative` | API key (consumer) | Dev only. Free credits for testing. |

## Tasks (Consumer)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/tasks` | API key (consumer) | Submit task. Body: `{ goal, context, max_budget }`. Returns 202. |
| GET | `/tasks/:id` | API key | Poll task status and result. |
| POST | `/tasks/:id/confirm` | No | x402 per-task payment (stub, 501). |

## Nodes (Operator)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/nodes` | No | Register operator (free). Returns API key + node ID. |
| POST | `/nodes/:id/heartbeat` | API key (operator) | Update capabilities. Keeps node in pool. |
| GET | `/nodes/:id/offers` | API key (operator) | Poll for pending task offers. |

## Offers (Operator)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/offers/:id/claim` | API key (operator) | Claim offer. First wins (200), late (409). |

## Task Execution (Operator)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/tasks/:id/steps` | API key (operator) | Report step. Body: `{ step, action, screenshot }`. |
| POST | `/tasks/:id/result` | API key (operator) | Submit result. Body: `{ status, extracted_data, final_url }`. |

## Withdrawals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/accounts/withdrawals` | API key (operator) | Withdraw earnings. Min 500 credits. |

## MCP

Public MCP server at `POST /mcp`. No auth to connect. See [MCP docs](./mcp.md).

8 tools (9 in development): `create_account`, `create_node`, `auth_challenge`,
`auth_verify`, `get_balance`, `submit_task`, `get_task`, `add_test_credits` (dev).

## Response Patterns

| Status | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (task queued) |
| 400 | Validation error |
| 401 | Auth error |
| 402 | Payment required (x402) |
| 409 | Conflict (offer already claimed) |
| 501 | Not implemented |
