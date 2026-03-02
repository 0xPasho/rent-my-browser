# Architecture Overview

Rent My Browser is a marketplace that connects **consumers** who need browser
automation with **node operators** running OpenClaw instances. When an OpenClaw
agent has no tasks from its owner, it connects to the marketplace and executes
browser tasks for paying consumers.

The platform is a **pure intermediary** — it never touches a browser. It receives
a task and payment, decomposes the task into text instructions via AI, dispatches
to an available node, and returns the result. The Uber model.

## System Components

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  Consumer    │         │  Orchestration       │         │  Node           │
│             │  POST   │  Server              │  WS     │  (OpenClaw)     │
│  - SDK      │────────>│                      │────────>│                 │
│  - API key  │  task   │  - Task intake       │  task   │  - Skill        │
│  - Credits  │<────────│  - AI decomposition  │<────────│  - Browser      │
│             │  result │  - x402 / credits    │  result │  - Agent        │
│             │         │  - Node routing      │         │                 │
│             │         │  - Ledger            │         │                 │
└─────────────┘         └──────────────────────┘         └─────────────────┘
```

## Request Lifecycle

1. Consumer submits a task via `POST /tasks` with a goal and context.
2. The orchestration server passes the task through **AI decomposition** — an LLM
   breaks the natural language goal into semantic steps and estimates complexity.
3. **Pricing**: `base_price × step_count`. Deterministic, no AI involved.
4. If paying via x402: server returns `402` with price + lightning invoice.
   Consumer pays and resends with proof. If paying via credits: deducted
   immediately, no 402 round-trip.
5. Server **routes** the task to the best available node based on tier (headless
   vs real), geo, capabilities, and current load.
6. The node's OpenClaw agent receives the task as a **text goal + context**. It
   interprets the live DOM at runtime, executes the steps autonomously, and
   returns results (screenshots, extracted data, success/failure).
7. Server records the transaction in the **double-entry ledger**, splitting
   payment into platform fee + operator balance.
8. Consumer receives the result.

## Monorepo Structure

```
rent-my-browser/
├── docs/                    # Architecture & design docs
├── apps/
│   └── server/              # Orchestration API
├── packages/
│   ├── shared/              # Types, schemas, constants
│   ├── sdk/                 # Consumer SDK
│   ├── node-agent/          # Browser manager + task executor
│   └── ai/                  # Task decomposition & validation
└── skill/                   # OpenClaw skill (SKILL.md + scripts)
```

## Design Principles

- **The platform never touches the browser.** Nodes are autonomous workers.
- **Text goals, not pre-decomposed selectors.** You can't know CSS selectors
  without seeing the page. The node's OpenClaw agent interprets the DOM at
  runtime.
- **Deterministic pricing.** Per-step, calculated from the decomposition output.
  No AI in the billing path.
- **Two node classes.** VPS nodes (headless, cheap) and real machine nodes
  (GUI, premium, anti-detection). The architecture handles both.
- **Payment before execution.** x402 or credits. No post-hoc billing.
