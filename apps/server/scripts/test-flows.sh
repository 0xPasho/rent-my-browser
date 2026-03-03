#!/usr/bin/env bash
# End-to-end test script
# Requires: server running on port 3000 with NODE_ENV=sandbox

set -euo pipefail

if [ -f .env ]; then
  export DATABASE_URL=$(grep '^DATABASE_URL=' .env | cut -d'=' -f2- | tr -d '"')
fi

BASE_URL="${BASE_URL:-http://localhost:3000}"
CONSUMER_WALLET="0x1111111111111111111111111111111111111111"
OPERATOR_WALLET="0x2222222222222222222222222222222222222222"

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
echo "=== Health ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /health" "200" "$STATUS" "$BODY"

echo ""
echo "=== Registration ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$CONSUMER_WALLET\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts (consumer) → 201" "201" "$STATUS" "$BODY"

CONSUMER_KEY=$(echo "$BODY" | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
echo "    Consumer key: ${CONSUMER_KEY:0:20}..."

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/nodes" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$OPERATOR_WALLET\", \"node_type\": \"real\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /nodes (operator) → 201" "201" "$STATUS" "$BODY"

OPERATOR_KEY=$(echo "$BODY" | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
echo "    Operator key: ${OPERATOR_KEY:0:20}..."

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$CONSUMER_WALLET\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts (duplicate) → 400" "400" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts" \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "not-a-wallet"}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts (invalid) → 400" "400" "$STATUS" "$BODY"

echo ""
echo "=== Auth ==="

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer $CONSUMER_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me → 200" "200" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (no auth) → 401" "401" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer fake_key")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (bad key) → 401" "401" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/challenge" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_address\": \"$CONSUMER_WALLET\"}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /auth/challenge → 200" "200" "$STATUS" "$BODY"

echo ""
echo "=== Credits (alternative topup — sandbox only) ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts/credits/alternative" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"amount": 1000}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /accounts/credits/alternative → 200" "200" "$STATUS" "$BODY"
echo "    Balance: $(echo "$BODY" | grep -o '"balance":[0-9]*' | cut -d: -f2)"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer $CONSUMER_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (after topup) → 200" "200" "$STATUS" "$BODY"
echo "    Balance: $(echo "$BODY" | grep -o '"balance":[0-9]*' | cut -d: -f2)"

echo ""
echo "=== Type Guards ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts/credits/alternative" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_KEY" \
  -d '{"amount": 1000}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /credits/alternative (operator → blocked) → 401" "401" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/accounts/withdrawals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"amount": 500}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /withdrawals (consumer → blocked) → 401" "401" "$STATUS" "$BODY"

echo ""
echo "=== Tasks ==="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"goal": "Go to example.com/signup, fill the form with name and email, then submit it", "context": {"data": {"name": "John", "email": "john@test.com"}, "tier": "auto", "mode": "simple"}, "max_budget": 300}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /tasks → 202" "202" "$STATUS" "$BODY"

TASK_ID=$(echo "$BODY" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)
echo "    Task ID: $TASK_ID"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $CONSUMER_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /tasks/:id → 200" "200" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
  -H "Authorization: Bearer $CONSUMER_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /accounts/me (after hold) → 200" "200" "$STATUS" "$BODY"
echo "    Balance: $(echo "$BODY" | grep -o '"balance":[0-9]*' | cut -d: -f2) (700 = 1000 - 300 hold)"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"goal": "Do something expensive beyond balance", "max_budget": 9999}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /tasks (insufficient) → 400" "400" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_KEY" \
  -d '{"goal": "Operators cannot submit tasks here", "max_budget": 100}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /tasks (operator → blocked) → 401" "401" "$STATUS" "$BODY"

echo ""
echo "=== Nodes + Dispatch ==="

OPERATOR_ID=$(psql "$DATABASE_URL" -t -A -c "SELECT id FROM accounts WHERE wallet_address = '$OPERATOR_WALLET' LIMIT 1" 2>/dev/null | tr -d '[:space:]')
NODE_ID=$(psql "$DATABASE_URL" -t -A -c "SELECT id FROM nodes WHERE account_id = '$OPERATOR_ID' LIMIT 1" 2>/dev/null | tr -d '[:space:]')
echo "    Node ID: $NODE_ID"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/nodes/$NODE_ID/heartbeat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_KEY" \
  -d '{"type": "real", "browser": {"name": "chrome", "version": "124.0"}, "geo": {"country": "US", "ip_type": "residential"}, "capabilities": {"modes": ["simple", "adversarial"], "max_concurrent": 1}}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /nodes/:id/heartbeat → 200" "200" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONSUMER_KEY" \
  -d '{"goal": "Navigate to example.com and fill the contact form with the provided data", "context": {"data": {"name": "Test"}, "tier": "real", "mode": "simple"}, "max_budget": 200}')
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "POST /tasks (dispatched) → 202" "202" "$STATUS" "$BODY"

TASK_ID2=$(echo "$BODY" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)

RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/nodes/$NODE_ID/offers" \
  -H "Authorization: Bearer $OPERATOR_KEY")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
check "GET /nodes/:id/offers → 200" "200" "$STATUS" "$BODY"

OFFER_ID=$(echo "$BODY" | grep -o '"offer_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$OFFER_ID" ]; then
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/offers/$OFFER_ID/claim" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERATOR_KEY" \
    -d "{\"node_id\": \"$NODE_ID\"}")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "POST /offers/:id/claim → 200" "200" "$STATUS" "$BODY"

  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/offers/$OFFER_ID/claim" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERATOR_KEY" \
    -d "{\"node_id\": \"$NODE_ID\"}")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "POST /offers/:id/claim (duplicate) → 409" "409" "$STATUS" "$BODY"

  echo ""
  echo "=== Execution + Settlement ==="

  for i in 1 2 3; do
    RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID2/steps" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $OPERATOR_KEY" \
      -d "{\"step\": $i, \"action\": \"Step $i action\"}")
    BODY=$(echo "$RESP" | sed '$d')
    STATUS=$(echo "$RESP" | tail -1)
    check "POST /tasks/:id/steps (step $i) → 200" "200" "$STATUS" "$BODY"
  done

  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID2/result" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERATOR_KEY" \
    -d '{"status": "completed", "extracted_data": {"ok": true}, "final_url": "https://example.com/done"}')
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "POST /tasks/:id/result → 200" "200" "$STATUS" "$BODY"
  echo "    Actual cost: $(echo "$BODY" | grep -o '"actual_cost":[0-9]*' | cut -d: -f2) credits"

  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
    -H "Authorization: Bearer $CONSUMER_KEY")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "Consumer balance after settlement → 200" "200" "$STATUS" "$BODY"
  echo "    Balance: $(echo "$BODY" | grep -o '"balance":[0-9]*' | cut -d: -f2)"

  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/accounts/me" \
    -H "Authorization: Bearer $OPERATOR_KEY")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "Operator balance after settlement → 200" "200" "$STATUS" "$BODY"
  echo "    Earned: $(echo "$BODY" | grep -o '"totalEarned":[0-9]*' | cut -d: -f2)"

  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/tasks/$TASK_ID2" \
    -H "Authorization: Bearer $CONSUMER_KEY")
  BODY=$(echo "$RESP" | sed '$d')
  STATUS=$(echo "$RESP" | tail -1)
  check "GET /tasks/:id (completed) → 200" "200" "$STATUS" "$BODY"
  echo "    Status: $(echo "$BODY" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)"
else
  echo "  ⚠ No offer — skipping claim + execution tests"
  FAIL=$((FAIL + 8))
fi

echo ""
echo "=============================="
echo "Results: $PASS passed, $FAIL failed"
echo "=============================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
