# Task Model

## How Tasks Work

A consumer submits a **goal** in natural language (or structured format) along
with context. The platform's AI layer decomposes this into semantic steps, prices
it, and dispatches the text goal to a node. The node's OpenClaw agent interprets
the DOM at runtime and executes autonomously.

**The node receives a text goal, not pre-decomposed steps with selectors.** Pre-
decomposition to exact selectors is impossible without seeing the page first. The
AI decomposition is for pricing and validation, not for execution instructions.

## Task Submission

```
POST /tasks
{
  "goal": "Go to example.com/signup, fill the form with the provided data, submit it",
  "context": {
    "data": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tier": "real",          // optional: "headless" | "real" | "auto"
    "mode": "simple",        // "simple" | "adversarial" | "async"
    "geo": "US"              // optional geo requirement
  }
}
```

## AI Decomposition

The AI validation layer processes the task before dispatch:

1. **Safety check** — reject malicious tasks (credential stuffing, abuse, etc.)
2. **Step decomposition** — break the goal into semantic steps for pricing:
   - "Navigate to example.com/signup"
   - "Fill name field with 'John Doe'"
   - "Fill email field with 'john@example.com'"
   - "Click submit"
   - "Screenshot the confirmation"
3. **Step count** — used for deterministic pricing (see [Payment](./payment.md))
4. **Tier recommendation** — if tier is "auto", recommend headless or real based
   on the target site
5. **Mode validation** — ensure the requested mode is compatible with available
   nodes

The decomposed steps are **not sent to the node**. They exist for pricing and
validation only. The node receives the original text goal + context.

## Three Task Modes

### Simple

Standard browser automation. Goal in, result out.

- Navigate, click, type, scrape, screenshot
- No special behavior simulation
- Available on both headless and real nodes
- Stateless from the platform's perspective

### Adversarial

Same as simple, but with a **human behavior simulation layer**:

- Bezier curve mouse movements (not straight lines)
- Realistic typing speed with variation and occasional corrections
- Random pauses between actions (not machine-precise timing)
- Natural scroll patterns
- Randomized viewport interactions

This mode is for sites with bot detection that analyze behavioral patterns
beyond just browser fingerprinting. Only available on real machine nodes.

### Async

Tasks that **pause waiting for external events**:

- OTP codes (SMS, authenticator app)
- Email confirmations (click a link in an email)
- Third-party callbacks
- Manual human verification steps

Async tasks require:

- A **state machine** on the platform: `running → waiting → running → complete`
- **WebSocket connection** to the consumer for real-time status updates
- **Consumer input channel** — the consumer may need to provide data mid-task
  (e.g., forward an OTP code)
- **Timeout policy** — how long to wait for the external event
- The browser session stays alive during the wait

Only available on real machine nodes.

## Task Lifecycle States

```
submitted → decomposing → priced → paid → queued → dispatched → running → completed
                                                        │                      │
                                                        ├── waiting ──┘        │
                                                        │   (async only)       │
                                                        │                      │
                                                        └── failed ────────────┘
```

## Task Result

```
{
  "task_id": "uuid",
  "status": "completed" | "failed",
  "steps_executed": 5,
  "steps_total": 5,
  "result": {
    "screenshots": ["https://..."],
    "extracted_data": { ... },
    "final_url": "https://example.com/signup/confirmation"
  },
  "error": null,
  "duration_ms": 12400
}
```
