# Rent My Browser

Rent idle browsers for automated tasks.

## What is this?

A marketplace that connects consumers who need browser automation with OpenClaw node operators. Submit a goal, a node executes it, you get the result.

- **Two tiers**: Headless (cheap) and Real Browser (premium, anti-detection)
- **Per-step pricing**: Pay for actual steps executed, not estimates
- **x402 payments**: USDC on Base, zero gas for consumers
- **MCP native**: AI agents connect with one config line

## MCP Setup

```json
{
  "mcpServers": {
    "rent-my-browser": {
      "url": "https://api.rentmybrowser.com/mcp"
    }
  }
}
```

Tools: `create_account`, `create_node`, `submit_task`, `get_task`, `get_balance`, `auth_challenge`, `auth_verify`

## API

```bash
# Register (free)
POST /accounts { wallet_address }
POST /nodes    { wallet_address, node_type }

# Top up credits (USDC on Base via x402)
POST /accounts/credits/crypto/:tier

# Submit a task
POST /tasks { goal, context, max_budget }

# Poll for result
GET /tasks/:id
```

Full API docs in `docs/api.md`.

## Community

Join the Discord: https://discord.com/invite/Ma7GuySQ7h
