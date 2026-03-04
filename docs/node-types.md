# Node Types

The marketplace supports two classes of nodes. Consumers can request a specific
tier, or the system can auto-select based on the target site and task mode.

## VPS Nodes (Headless Tier)

- **Hardware**: Cloud VPS (DigitalOcean, Hetzner, AWS, etc.)
- **Browser**: Playwright-managed headless Chromium
- **Display**: None needed
- **IP type**: Datacenter
- **Supported task modes**: Simple only
- **Consumer pricing**: Cheap tier
- **Bot detection**: Will get caught on protected sites
- **Best for**: Internal tools, scraping friendly sites, QA on staging environments,
  any task where bot detection is not a concern

## Real Machine Nodes (Premium Tier)

- **Hardware**: Mac Mini, PCs, physical machines with GUI
- **Browser**: Real Google Chrome (not Chromium), launched normally
- **Display**: Physical or virtual display (Xvfb)
- **IP type**: Residential (high value for consumers)
- **Supported task modes**: Simple, Adversarial
- **Consumer pricing**: Premium tier
- **Bot detection**: Passes — real browser, real fingerprint, no automation flags
- **Best for**: Sites with bot detection, form submissions on production sites,
  anything requiring a realistic browser fingerprint

## Anti-Detection (Real Machine Nodes)

Real machine nodes avoid bot detection by:

1. Running **real Google Chrome** (not Chromium, not Playwright-managed)
2. Launching **without** `--enable-automation`, `--headless`, or other telltale flags
3. Using **raw CDP** via `--remote-debugging-port` instead of Playwright/Puppeteer wrappers
4. Running on a real or virtual display (**Xvfb**) so Chrome has a screen context
5. **Not sending `Runtime.enable`** (the main CDP detection signal) unless necessary
6. Matching browser fingerprint to the node's actual environment (timezone, language,
   screen resolution)

## Node Onboarding

Operators register with a wallet address for free:

```
POST /nodes
{ "wallet_address": "0x...", "node_type": "real" }
→ 201 { "account_id", "node_id", "api_key": "rmb_n_...", "dashboard_url" }
```

Set `RMB_API_KEY` in OpenClaw skill env vars. The node starts participating
when the agent goes idle. No website, no dashboard required. Earnings are
paid out to the same wallet used to register. See [Auth](./auth.md) for
details on wallet-based identity and dashboard access.

## Node Registration Payload

When a node starts polling, its first call registers capabilities:

```
POST /nodes/:id/heartbeat
{
  "type": "headless" | "real",
  "browser": {
    "name": "chrome" | "chromium",
    "version": "124.0.6367.91"
  },
  "geo": {
    "country": "US",
    "region": "California",
    "city": "San Francisco",
    "ip_type": "residential" | "datacenter"
  },
  "capabilities": {
    "modes": ["simple", "adversarial"],
    "max_concurrent": 1
  }
}
```

## Dispatch: Uber-Style Claim Model

Tasks are **not assigned** to a specific node. They are **offered** to multiple
eligible nodes, and the first to claim wins.

### Flow

```
Task is paid and queued
    │
    ▼
Router filters eligible nodes (tier, geo, mode, score)
    │
    ▼
Create offers for top N nodes (e.g., 5)
    │
    ├── Node A polls, sees offer, claims → WINS → gets full task payload
    ├── Node B polls, sees offer, claims → 409 (already claimed)
    ├── Node C never polls (slow/offline)
    └── Node D polls, sees offer, ignores it
    │
    ▼
Offer expires after timeout (10-15 seconds)
    │
    └── If unclaimed → broadcast to next batch of N nodes
        └── Still unclaimed → task fails, refund consumer
```

### Node polling loop

The OpenClaw skill runs a simple HTTP polling loop — no persistent WebSocket,
no background daemon:

```
1. POST /nodes/:id/heartbeat     → register/update capabilities
2. GET  /nodes/:id/offers        → check for pending offers
3. POST /offers/:id/claim        → claim an offer (first wins, returns full task payload)
4. Execute task using browser
5. POST /tasks/:id/steps         → report each step (action + screenshot)
6. POST /tasks/:id/result        → submit final result
7. Back to step 2
```

The offer payload is minimal — just enough for the node to decide:

```
{
  "offer_id": "uuid",
  "task_id": "uuid",
  "goal_summary": "signup on example.com",
  "mode": "simple",
  "estimated_steps": 5,
  "payout_per_step": 8,
  "expires_at": "2026-01-15T12:00:15Z"
}
```

The full task payload (goal + context with consumer data) is only sent after
claiming. Other nodes never see the consumer's data.

## Node Score

The platform tracks a score per node to ensure quality and honesty:

### Score changes

- **Successful task completion**: +2 points
- **Failed task**: −3 points
- **Step inflation** (reported steps > 2× estimated): −2 points
- **Severe step inflation** (reported steps > 3× estimated): −5 points
- Score range: **0–100** (initial score: 100)

### Effects

- **High-score nodes (80+)** get offers first in tight-match routing
- **Mid-score nodes (50+)** eligible for wider routing tier
- **Low-score nodes (<50)** only reached in widest routing fallback
- **Very low-score nodes** may effectively stop receiving offers

### Outlier detection

If the estimated step count for a task is 4 and a node reports 12, it
gets penalized automatically. No AI needed — just ratio comparison
against the task's `estimated_steps`.
