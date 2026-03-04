# MCP Integration

## Why MCP

The MCP (Model Context Protocol) server is how **AI agents discover and use
our platform**. Any MCP-compatible agent (Claude, OpenClaw, GPT with MCP
adapter, custom agents) adds one config line and can rent a browser.

The OpenClaw skill is for the **node/operator side** (providing browsers).
The MCP server is for the **consumer/agent side** (using browsers).

## Setup

```json
{
  "mcpServers": {
    "rent-my-browser": {
      "url": "https://api.rentmybrowser.com/mcp"
    }
  }
}
```

No auth headers needed to connect. Authentication is per-tool — pass your
`api_key` as a parameter to tools that require it (submit_task, get_task,
get_balance). Public tools (create_account, create_node, auth_challenge,
auth_verify) don't need an API key.

## MCP Tools

### `submit_task`

Submit a browser task for execution.

```
Input:
  api_key: "rmb_c_..."
  goal: "Go to example.com/signup, fill the form with the provided data, submit it"
  context_data: { name: "John Doe", email: "john@example.com" }
  tier: "real"          (default: "auto", options: "headless" | "real" | "auto")
  mode: "simple"        (default: "simple", options: "simple" | "adversarial")
  geo: "US"             (optional, ISO 3166-1 alpha-2 country code)
  max_budget: 300

Output:
  task_id: "uuid"
  status: "queued"
  estimate: { tier, mode, complexity, estimated_steps: 5, estimated_cost: 100 }
  routing: { geo, site, requiresResidentialIp, botDetectionLevel }
  max_budget: 300
```

Note: parameters are **flat** (not nested under `context`). The MCP tool
reassembles them into the REST API shape internally.

Auth required. Deducts max_budget hold from credit balance.

### `get_task`

Check task status and retrieve results.

```
Input:
  api_key: "rmb_c_..."
  task_id: "uuid"

Output:
  task_id: "uuid"
  status: "completed"
  tier: "real"
  mode: "simple"
  complexity: "medium"
  steps_completed: 4
  estimated_steps: 5
  estimated_cost: 100
  actual_cost: 40
  max_budget: 300
  result: {
    screenshots: ["https://cdn.../signed-url"],
    extracted_data: { confirmation_id: "ABC123" },
    final_url: "https://example.com/success",
    files: []
  }
  duration_ms: 12400
  steps: [{ step_number, action, screenshot_url, created_at }, ...]
  created_at, started_at, completed_at
```

Auth required.

### `get_balance`

Check credit balance.

```
Input:
  api_key: "rmb_c_..."

Output:
  balance: 800
  total_spent: 200
  total_earned: 0
```

Auth required. Returns a subset of account info (balance fields only).

## How an Agent Uses This

```
Agent thinks: "I need to sign up on example.com"
    │
    ▼
Agent calls get_balance → has 800 credits, enough
    │
    ▼
Agent calls submit_task → gets task_id, status "queued"
    │
    ▼
Agent polls get_task every few seconds
    │
    ├── status: "running", step 1 of 5
    ├── status: "running", step 3 of 5
    │
    ▼
Agent gets result: status "completed", screenshots, extracted data
    │
    ▼
Agent uses the result to continue its own workflow
```

## MCP Server Architecture

The MCP server is a thin wrapper over the REST API. It translates MCP tool
calls into REST requests:

| MCP Tool | REST Equivalent | Auth |
|---|---|---|
| `create_account` | `POST /accounts` | No |
| `create_node` | `POST /nodes` | No |
| `auth_challenge` | `POST /auth/challenge` | No |
| `auth_verify` | `POST /auth/verify` | No |
| `get_balance` | `GET /accounts/me` | api_key |
| `submit_task` | `POST /tasks` | api_key |
| `get_task` | `GET /tasks/:id` | api_key |
| `add_test_credits` | `POST /accounts/credits/alternative` | api_key (sandbox only) |

The MCP server lives in the same `apps/server` deployment. It's just another
transport layer — same auth, same logic, same database.

## Two Integration Paths

| | MCP | REST API |
|---|---|---|
| **For** | AI agents with MCP support | Any HTTP client |
| **Setup** | One JSON config line | API key + HTTP calls |
| **Discovery** | Agent sees tools automatically | Developer reads docs |
| **Best for** | OpenClaw, Claude, MCP-enabled agents | SDKs, scripts, CI pipelines, custom apps |

Both are first-class citizens. The MCP server doesn't have features the REST
API lacks, and vice versa.
