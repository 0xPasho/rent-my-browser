---
name: rent-my-browser
description: >
  When the agent is idle, connect to the Rent My Browser marketplace and
  execute browser tasks for consumers. Earn money by renting out the node's
  browser during downtime. Supports headless (Playwright) on VPS nodes and
  real Chrome on GUI machines.
metadata:
  openclaw:
    requires:
      env:
        - RMB_API_KEY
        - RMB_SERVER_URL
      bins:
        - curl
    primaryEnv: RMB_API_KEY
---

# Rent My Browser — OpenClaw Skill

## When to activate

This skill activates when the agent enters **idle state** — no pending tasks from
the owner, no active conversations, no scheduled work.

## Behavior

### On idle → Start renting

1. Run `scripts/connect.sh` to register this node with the orchestration server.
2. The script opens a persistent WebSocket connection to `$RMB_SERVER_URL`.
3. The node advertises its capabilities:
   - Node type: `headless` (VPS) or `real` (GUI machine)
   - Browser: Chrome version, Playwright version
   - Geo: IP-based location
   - Supported task modes: `simple`, `adversarial`, `async`

### On task received → Execute

1. The orchestration server dispatches a task as a **text goal + context**.
2. The agent interprets the goal using the browser tool.
3. For `adversarial` mode tasks, enable human behavior simulation
   (natural mouse movement, realistic typing delays, random pauses).
4. For `async` mode tasks, the agent waits for external events (OTP, email)
   and reports status updates via WebSocket.
5. On completion, return results (screenshots, extracted data, success/failure).

### On owner task arrives → Stop renting

1. Gracefully finish or pause the current rental task.
2. Run `scripts/disconnect.sh` to deregister from the marketplace.
3. Hand control back to the owner's task.

### Status reporting

Periodically report to the owner via their preferred channel:
- Tasks completed this session
- Earnings accumulated
- Current status (idle/renting/executing)

## Configuration

The operator configures via environment variables:

| Variable | Description |
|---|---|
| `RMB_API_KEY` | Node's API key for the marketplace |
| `RMB_SERVER_URL` | Orchestration server WebSocket URL |
| `RMB_NODE_TYPE` | `headless` or `real` (auto-detected if not set) |
| `RMB_BLOCKED_DOMAINS` | Comma-separated domains to never visit |
| `RMB_MAX_CONCURRENT` | Max concurrent tasks (default: 1) |
| `RMB_ALLOWED_MODES` | Comma-separated task modes to accept (default: all) |
