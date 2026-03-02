#!/usr/bin/env bash
# End-to-end test script for Phases 1-5
# Requires: Postgres running, migrations applied, server running on port 3000
#
# Setup:
#   1. Start Postgres (docker, local, etc.)
#   2. Run migrations: pnpm db:migrate
#   3. Start server:   pnpm dev
#   4. Run this:        bash scripts/test-flows.sh

set -euo pipefail

# Load DATABASE_URL from .env for psql queries
if [ -f .env ]; then
  export DATABASE_URL=$(grep '^DATABASE_URL=' .env | cut -d'=' -f2- | tr -d '"')
fi

BASE_URL="${BASE_URL:-http://localhost:3000}"
CONSUMER_WALLET="0x1111111111111111111111111111111111111111"
OPERATOR_WALLET="0x2222222222222222222222222222222222222222"
FAKE_TX="0x0000000000000000000000000000000000000000000000000000000000000001"
FAKE_TX2="0x0000000000000000000000000000000000000000000000000000000000000002"

PASS=0
FAIL=0

check() {
  local name="$1"
  local expected_status="$2"
  local actual_status="$3"
  local body="$4"

  if [ "$actual_status" = "$expected_status" ]; then
    echo "  ✓ $name (HTTP $actual_status)"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $name — expected $expected_status, got $actual_status"
    echo "    $body"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=== Phase 1: Health ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /health" "200" "$STATUS" "$BODY"

echo ""
echo "=== Phase 2: Auth — Consumer Registration ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$CONSUMER_WALLET\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts → 402" "402" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts/confirm" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$CONSUMER_WALLET\", \"tx_hash\": \"$FAKE_TX\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts/confirm → 200" "200" "$STATUS" "$BODY"

CONSUMER_KEY=$(echo "$BODY" | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
echo "    Consumer API key: ${CONSUMER_KEY:0:20}..."

echo ""
echo "=== Phase 2: Auth — Operator Registration ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/nodes" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$OPERATOR_WALLET\", \"node_type\": \"real\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /nodes → 402" "402" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/nodes/confirm" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$OPERATOR_WALLET\", \"tx_hash\": \"$FAKE_TX2\", \"node_type\": \"real\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /nodes/confirm → 200" "200" "$STATUS" "$BODY"

OPERATOR_KEY=$(echo "$BODY" | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
echo "    Operator API key: ${OPERATOR_KEY:0:20}..."

echo ""
echo "=== Phase 2: Auth — Duplicate Registration ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$CONSUMER_WALLET\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts (duplicate) → 400" "400" "$STATUS" "$BODY"

echo ""
echo "=== Phase 2: Auth — Validation ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "not-a-wallet"}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts (invalid wallet) → 400" "400" "$STATUS" "$BODY"

echo ""
echo "=== Phase 2: Auth — Challenge ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/challenge" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$CONSUMER_WALLET\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /auth/challenge → 200" "200" "$STATUS" "$BODY"

echo ""
echo "=== Phase 3: Accounts — Get Me ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer $CONSUMER_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (consumer) → 200" "200" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer $OPERATOR_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (operator) → 200" "200" "$STATUS" "$BODY"

echo ""
echo "=== Phase 3: Accounts — Auth Guard ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (no auth) → 401" "401" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer fake_key_12345")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (bad key) → 401" "401" "$STATUS" "$BODY"

echo ""
echo "=== Phase 3: Accounts — Topup ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts/credits" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"amount": 1000}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts/credits → 402" "402" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts/credits/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d "{\"tx_hash\": \"$FAKE_TX\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts/credits/confirm → 200" "200" "$STATUS" "$BODY"
echo "    Balance after topup: $(echo "$BODY" | grep -o '"balance":[0-9]*' | cut -d: -f2)"

echo ""
echo "=== Phase 3: Accounts — Verify Balance ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer $CONSUMER_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (after topup) → 200" "200" "$STATUS" "$BODY"
echo "    Balance: $(echo "$BODY" | grep -o '"balance":[0-9]*' | cut -d: -f2)"

echo ""
echo "=== Phase 3: Accounts — Type Guards ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts/credits" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_KEY" \
  -d '{"amount": 1000}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts/credits (operator → blocked) → 401" "401" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts/withdrawals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"amount": 500}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts/withdrawals (consumer → blocked) → 401" "401" "$STATUS" "$BODY"

echo ""
echo "=== Phase 4: Tasks — Submit Task ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"goal": "Go to example.com/signup, fill the form with name and email, then submit it", "context": {"data": {"name": "John", "email": "john@test.com"}, "tier": "auto", "mode": "simple"}, "max_budget": 300}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /tasks → 202" "202" "$STATUS" "$BODY"

TASK_ID=$(echo "$BODY" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)
echo "    Task ID: $TASK_ID"
echo "    Estimate: $(echo "$BODY" | grep -o '"estimated_cost":[0-9]*' | cut -d: -f2) credits"

echo ""
echo "=== Phase 4: Tasks — Get Task ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $CONSUMER_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /tasks/:id → 200" "200" "$STATUS" "$BODY"
echo "    Status: $(echo "$BODY" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"

echo ""
echo "=== Phase 4: Tasks — Balance After Hold ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer $CONSUMER_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (after task hold) → 200" "200" "$STATUS" "$BODY"
echo "    Balance: $(echo "$BODY" | grep -o '"balance":[0-9]*' | cut -d: -f2) (should be 700 = 1000 - 300 hold)"

echo ""
echo "=== Phase 4: Tasks — Insufficient Balance ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"goal": "Do something that costs more than remaining balance", "max_budget": 9999}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /tasks (insufficient balance) → 400" "400" "$STATUS" "$BODY"

echo ""
echo "=== Phase 4: Tasks — Operator Cannot Submit ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_KEY" \
  -d '{"goal": "Operators should not submit tasks", "max_budget": 100}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /tasks (operator → blocked) → 401" "401" "$STATUS" "$BODY"

echo ""
echo "=== Phase 4: Tasks — Validation ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"goal": "short", "max_budget": 100}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /tasks (goal too short) → 400" "400" "$STATUS" "$BODY"

echo ""
echo "=== Phase 5: Nodes — Get Node ID ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer $OPERATOR_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
OPERATOR_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# We need the node_id — query it from the DB via a task lookup workaround
# Actually, the node was created during operator registration. Let's get it.
# The node_id isn't returned in accounts/me, so we'll get it from the heartbeat flow.
# First, we need to find the node. Let's use psql or just try heartbeating with the account.

echo ""
echo "=== Phase 5: Nodes — Heartbeat ==="

# Get node ID by looking up what was created during registration
NODE_ID_RESP=$(psql "$DATABASE_URL" -t -A -c "SELECT id FROM nodes WHERE account_id = '$OPERATOR_ID' LIMIT 1" 2>/dev/null)
NODE_ID=$(echo "$NODE_ID_RESP" | tr -d '[:space:]')
echo "    Node ID: $NODE_ID"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/nodes/$NODE_ID/heartbeat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_KEY" \
  -d '{"type": "real", "browser": {"name": "chrome", "version": "124.0"}, "geo": {"country": "US", "ip_type": "residential"}, "capabilities": {"modes": ["simple", "adversarial"], "max_concurrent": 1}}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /nodes/:id/heartbeat → 200" "200" "$STATUS" "$BODY"

echo ""
echo "=== Phase 5: Nodes — Submit Task (triggers dispatch) ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"goal": "Navigate to example.com and fill the contact form with the provided data", "context": {"data": {"name": "Test"}, "tier": "real", "mode": "simple"}, "max_budget": 200}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /tasks (with node online) → 202" "202" "$STATUS" "$BODY"

TASK_ID2=$(echo "$BODY" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "=== Phase 5: Nodes — Poll Offers ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/nodes/$NODE_ID/offers" \
  -H "Authorization: Bearer $OPERATOR_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /nodes/:id/offers → 200" "200" "$STATUS" "$BODY"

OFFER_ID=$(echo "$BODY" | grep -o '"offer_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "    Offer ID: ${OFFER_ID:-none}"

echo ""
echo "=== Phase 5: Offers — Claim ==="

if [ -n "$OFFER_ID" ]; then
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/offers/$OFFER_ID/claim" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERATOR_KEY" \
    -d "{\"node_id\": \"$NODE_ID\"}")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "POST /offers/:id/claim → 200" "200" "$STATUS" "$BODY"
  echo "    Got task payload: $(echo "$BODY" | grep -o '"goal":"[^"]*"' | cut -d'"' -f4 | head -c 50)..."

  echo ""
  echo "=== Phase 5: Offers — Double Claim (conflict) ==="
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/offers/$OFFER_ID/claim" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERATOR_KEY" \
    -d "{\"node_id\": \"$NODE_ID\"}")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "POST /offers/:id/claim (duplicate) → 409" "409" "$STATUS" "$BODY"

  echo ""
  echo "=== Phase 5: Tasks — Verify Claimed Status ==="
  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/tasks/$TASK_ID2" \
    -H "Authorization: Bearer $CONSUMER_KEY")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "GET /tasks/:id (after claim) → 200" "200" "$STATUS" "$BODY"
  echo "    Status: $(echo "$BODY" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)"
  echo ""
  echo "=== Phase 6: Execution — Report Steps ==="

  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID2/steps" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERATOR_KEY" \
    -d '{"step": 1, "action": "Navigated to example.com"}')
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "POST /tasks/:id/steps (step 1) → 200" "200" "$STATUS" "$BODY"
  echo "    Budget remaining: $(echo "$BODY" | grep -o '"budget_remaining":[0-9]*' | cut -d: -f2)"

  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID2/steps" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERATOR_KEY" \
    -d '{"step": 2, "action": "Filled contact form with name"}')
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "POST /tasks/:id/steps (step 2) → 200" "200" "$STATUS" "$BODY"

  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID2/steps" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERATOR_KEY" \
    -d '{"step": 3, "action": "Clicked submit button"}')
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "POST /tasks/:id/steps (step 3) → 200" "200" "$STATUS" "$BODY"

  echo ""
  echo "=== Phase 6: Execution — Task Status While Running ==="

  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/tasks/$TASK_ID2" \
    -H "Authorization: Bearer $CONSUMER_KEY")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "GET /tasks/:id (running) → 200" "200" "$STATUS" "$BODY"
  echo "    Status: $(echo "$BODY" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)"
  echo "    Steps: $(echo "$BODY" | grep -o '"steps_completed":[0-9]*' | cut -d: -f2)"

  echo ""
  echo "=== Phase 6: Execution — Submit Result ==="

  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID2/result" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERATOR_KEY" \
    -d '{"status": "completed", "extracted_data": {"confirmation": "success"}, "final_url": "https://example.com/done"}')
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "POST /tasks/:id/result → 200" "200" "$STATUS" "$BODY"
  echo "    Actual cost: $(echo "$BODY" | grep -o '"actual_cost":[0-9]*' | cut -d: -f2) credits"
  echo "    Steps executed: $(echo "$BODY" | grep -o '"steps_executed":[0-9]*' | cut -d: -f2)"

  echo ""
  echo "=== Phase 6: Settlement — Consumer Balance ==="

  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
    -H "Authorization: Bearer $CONSUMER_KEY")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "GET /accounts/me (consumer after settlement) → 200" "200" "$STATUS" "$BODY"
  echo "    Balance: $(echo "$BODY" | grep -o '"balance":[0-9]*' | cut -d: -f2)"
  echo "    Total spent: $(echo "$BODY" | grep -o '"totalSpent":[0-9]*' | cut -d: -f2)"

  echo ""
  echo "=== Phase 6: Settlement — Operator Balance ==="

  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
    -H "Authorization: Bearer $OPERATOR_KEY")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "GET /accounts/me (operator after settlement) → 200" "200" "$STATUS" "$BODY"
  echo "    Balance: $(echo "$BODY" | grep -o '"balance":[0-9]*' | cut -d: -f2)"
  echo "    Total earned: $(echo "$BODY" | grep -o '"totalEarned":[0-9]*' | cut -d: -f2)"

  echo ""
  echo "=== Phase 6: Completed Task ==="

  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/tasks/$TASK_ID2" \
    -H "Authorization: Bearer $CONSUMER_KEY")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "GET /tasks/:id (completed) → 200" "200" "$STATUS" "$BODY"
  echo "    Status: $(echo "$BODY" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)"

else
  echo "  ⚠ No offer found — skipping claim + execution tests"
  FAIL=$((FAIL + 12))
fi

echo ""
echo "=============================="
echo "Results: $PASS passed, $FAIL failed"
echo "=============================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
