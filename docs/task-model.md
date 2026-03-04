# Task Model

## How Tasks Work

A consumer submits a **goal** in natural language along with context and a
**max budget**. The platform validates, estimates complexity, and broadcasts
the task as an offer to eligible nodes. The first node to claim it receives
the **text goal + context** and executes autonomously, reporting each step
back to the platform. The consumer is charged for actual steps executed,
never more than their max budget.

**The node receives a text goal, not pre-decomposed steps with selectors.**
Pre-decomposition to exact selectors is impossible without seeing the page
first. The AI estimation is for pricing and validation only.

## Task Submission

```
POST /tasks
Authorization: Bearer <api_key>
{
  "goal": "Go to example.com/signup, fill the form with the provided data, submit it",
  "context": {
    "data": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tier": "real",          // optional: "headless" | "real" | "auto"
    "mode": "simple",        // "simple" | "adversarial"
    "geo": "US"              // optional geo requirement
  },
  "max_budget": 300          // max credits the consumer is willing to pay
}
```

Response:

```
202 Accepted
{
  "task_id": "uuid",
  "status": "queued",
  "estimate": {
    "tier": "real",
    "mode": "simple",
    "complexity": "medium",
    "estimated_steps": 5,
    "estimated_cost": 100
  },
  "routing": {
    "geo": "US",
    "site": "example.com",
    "requiresResidentialIp": false,
    "botDetectionLevel": "none"
  },
  "max_budget": 300
}
```

The estimate is a **quote**. The actual cost depends on how many steps the
node executes. The consumer's max_budget is the hard ceiling.

## AI Validation & Estimation

The AI layer processes the task before dispatch:

1. **Safety check** — reject malicious tasks (credential stuffing, abuse, etc.)
2. **Step estimation** — estimate semantic steps for pricing:
   - "Navigate to example.com/signup"
   - "Fill name field"
   - "Fill email field"
   - "Click submit"
   - "Screenshot confirmation"
3. **Complexity tier** — simple / medium / complex. Determines base price.
4. **Tier recommendation** — if tier is "auto", recommend headless or real
   based on the target site.
5. **Mode validation** — ensure the requested mode is compatible with available
   nodes.

The estimation is **not sent to the node**. It exists for pricing and validation
only. The node receives the original text goal + context.

## Two Task Modes

### Simple

Standard browser automation. Goal in, result out.

- Navigate, click, type, scrape, screenshot
- No special behavior simulation
- Available on both headless and real nodes

### Adversarial

Same as simple, but with a **human behavior simulation layer**:

- Bezier curve mouse movements (not straight lines)
- Realistic typing speed with variation and occasional corrections
- Random pauses between actions (not machine-precise timing)
- Natural scroll patterns
- Randomized viewport interactions

This mode is for sites with bot detection that analyze behavioral patterns
beyond just browser fingerprinting. Only available on real machine nodes.

## Node Step Reporting

As the node executes, it reports each step back to the platform:

```
POST /tasks/:id/steps
{
  "step": 1,
  "action": "navigated to example.com/signup",
  "screenshot": "base64..."    // optional
}
→ 200 {
    "step": 1,
    "action": "navigated to example.com/signup",
    "screenshot_url": "/uploads/task-id/step_1.png",
    "budget_remaining": 260
  }
```

The `budget_remaining` field tells the node how many credits are left.
When it reaches 0, the node must stop execution immediately.

This serves three purposes:

1. **Billing** — platform counts actual steps for pricing
2. **Progress** — consumers polling see step count progress
3. **Proof** — screenshots exist for dispute resolution, no AI analysis needed

The platform tracks the step count and cuts off the task if it hits the
consumer's max budget.

## Task Lifecycle States

```
submitted → estimating → queued → offered → claimed → running → completed
                                                │         │
                                                └── failed ┘
```

## How Consumers Receive Results

Consumers poll `GET /tasks/:id` until `status` is `completed` or `failed`.
Tasks typically take 10-60 seconds.

```
GET /tasks/:id → { status: "running", steps_completed: 2 }
GET /tasks/:id → { status: "completed", result: {...} }
```

## Task Result

```
{
  "task_id": "uuid",
  "status": "completed",
  "steps_executed": 4,
  "estimated_steps": 5,
  "actual_cost": 40,
  "max_budget": 300,
  "result": {
    "screenshots": ["https://cdn.../signed-url"],
    "extracted_data": { ... },
    "final_url": "https://example.com/signup/confirmation",
    "files": [
      { "name": "report.xlsx", "url": "https://cdn.../signed-url", "expires_at": "..." }
    ]
  },
  "duration_ms": 12400
}
```

Files and screenshots are stored in S3/R2 with signed, expiring URLs (24h TTL).
