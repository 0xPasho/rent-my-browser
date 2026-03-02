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
      "url": "https://api.rentmybrowser.com/mcp",
      "headers": {
        "Authorization": "Bearer rmb_c_your_key_here"
      }
    }
  }
}
```

## MCP Tools

### `submit_task`

Submit a browser task for execution.

```
Input:
  goal: "Go to example.com/signup, fill the form with the provided data, submit it"
  context: {
    data: { name: "John Doe", email: "john@example.com" },
    tier: "real",
    mode: "simple",
    geo: "US"
  }
  max_budget: 300

Output:
  task_id: "uuid"
  status: "queued"
  estimate: { steps: 5, cost: 100 }
```

Auth required. Deducts max_budget hold from credit balance.

### `get_task`

Check task status and retrieve results.

```
Input:
  task_id: "uuid"

Output:
  task_id: "uuid"
  status: "completed"
  steps_executed: 4
  actual_cost: 40
  result: {
    screenshots: ["https://cdn.../signed-url"],
    extracted_data: { confirmation_id: "ABC123" },
    final_url: "https://example.com/success",
    files: []
  }
```

Auth required.

### `get_balance`

Check credit balance.

```
Input: (none)

Output:
  balance: 800
  total_spent: 200
  tasks_completed: 3
```

Auth required.

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

| MCP Tool | REST Equivalent |
|---|---|
| `submit_task` | `POST /tasks` |
| `get_task` | `GET /tasks/:id` |
| `get_balance` | `GET /accounts/me` |

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
