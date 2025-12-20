# Payment Fallback System - Testing & Validation Guide

## 🧪 Local Testing Setup

### Prerequisites
```bash
# Ensure dev server is running
npm run dev

# Keep in another terminal to watch logs
tail -f /var/log/veilpass/fallback-check.log
```

---

## Test 1: Database Schema Verification ✅

**Goal:** Verify migration applied correctly

```bash
# Connect to database
psql "postgresql://..."

# Check auction_results columns
\d auction_results;

# Expected output should include:
# - status (TEXT)
# - payment_deadline (TIMESTAMP WITH TIME ZONE)
# - payment_received_at (TIMESTAMP WITH TIME ZONE)
# - fallback_count (INT)
# - is_fallback_winner (BOOLEAN)
# - previous_winner_address (TEXT)

# Check payment_fallback_log table
\d payment_fallback_log;

# Check RPC functions
SELECT * FROM pg_proc WHERE proname = 'get_fallback_bidders';
SELECT * FROM pg_proc WHERE proname = 'mark_payment_received';
```

---

## Test 2: Auto-Close API (Existing)

**Goal:** Verify auction settlement works

```bash
# Test endpoint
curl -X POST http://localhost:3000/api/auction/auto-close \
  -H "Content-Type: application/json" \
  -d '{}' | jq

# Expected: {"ok":true,"closed":[]}

# Check auction_results table
psql "..." -c "SELECT * FROM auction_results LIMIT 5;"

# Verify payment_deadline is set
psql "..." -c "
  SELECT 
    id, auction_id, winner_address, 
    status, payment_deadline 
  FROM auction_results 
  WHERE status = 'pending_payment'
  LIMIT 5;
"
```

---

## Test 3: Payment Fallback API

**Goal:** Test fallback trigger logic

```bash
# 1. Manually expire a payment deadline
psql "..." -c "
  UPDATE auction_results 
  SET payment_deadline = NOW() - INTERVAL '1 hour'
  WHERE status = 'pending_payment'
  LIMIT 1;
"

# 2. Call payment-fallback endpoint
curl -X POST http://localhost:3000/api/auction/payment-fallback \
  -H "Content-Type: application/json" \
  -d '{"maxFallbackAttempts": 3}' | jq

# Expected: {"ok":true,"fallbacks_initiated":[...]}

# 3. Check payment_fallback_log
psql "..." -c "
  SELECT 
    id, auction_id, fallback_bidder_address, 
    response_status, offer_expires_at 
  FROM payment_fallback_log 
  ORDER BY created_at DESC LIMIT 5;
"

# 4. Verify auction_results updated
psql "..." -c "
  SELECT 
    id, status, winner_address, fallback_count,
    is_fallback_winner 
  FROM auction_results 
  WHERE status = 'fallback_offered';
"
```

---

## Test 4: Confirm Payment API

**Goal:** Mark payment as received

```bash
# Get a pending_payment result
RESULT_ID=$(psql "..." -c "
  SELECT id FROM auction_results 
  WHERE status = 'pending_payment' 
  LIMIT 1" -t | tr -d ' ')

echo "Testing with result ID: $RESULT_ID"

# Test GET (check status)
curl -s "http://localhost:3000/api/auction/confirm-payment?auctionResultId=$RESULT_ID" | jq

# Expected: 
# {
#   "ok": true,
#   "result": {
#     "id": 123,
#     "status": "pending_payment",
#     "isExpired": false,
#     "timeRemaining": 3600000,
#     "timeRemainingReadable": "1h 0m"
#   }
# }

# Test POST (mark as paid)
curl -X POST http://localhost:3000/api/auction/confirm-payment \
  -H "Content-Type: application/json" \
  -d "{\"auctionResultId\": \"$RESULT_ID\"}" | jq

# Expected: 
# {
#   "ok": true,
#   "message": "Payment confirmed successfully",
#   "result": {
#     "status": "paid",
#     "paymentReceivedAt": "2025-12-20T..."
#   }
# }

# Verify status changed
psql "..." -c "
  SELECT id, status, payment_received_at 
  FROM auction_results 
  WHERE id = $RESULT_ID;
"
```

---

## Test 5: Fallback Response API

**Goal:** Test bidder accept/reject logic

```bash
# Get a fallback_offered result with pending response
RESULT_ID=$(psql "..." -c "
  SELECT pfl.auction_result_id 
  FROM payment_fallback_log pfl
  WHERE pfl.response_status = 'pending'
  LIMIT 1" -t | tr -d ' ')

FALLBACK_LOG_ID=$(psql "..." -c "
  SELECT id FROM payment_fallback_log 
  WHERE auction_result_id = $RESULT_ID 
  AND response_status = 'pending'
  LIMIT 1" -t | tr -d ' ')

BIDDER=$(psql "..." -c "
  SELECT fallback_bidder_address 
  FROM payment_fallback_log 
  WHERE id = $FALLBACK_LOG_ID" -t | tr -d ' ')

echo "Result: $RESULT_ID, Log: $FALLBACK_LOG_ID, Bidder: $BIDDER"

# Test ACCEPT
curl -X POST http://localhost:3000/api/auction/fallback-response \
  -H "Content-Type: application/json" \
  -d "{
    \"auctionResultId\": \"$RESULT_ID\",
    \"fallbackLogId\": \"$FALLBACK_LOG_ID\",
    \"response\": \"accepted\",
    \"bidderAddress\": \"$BIDDER\"
  }" | jq

# Expected status should change to 'fallback_accepted'
psql "..." -c "
  SELECT id, status, payment_deadline 
  FROM auction_results 
  WHERE id = $RESULT_ID;
"

# Test REJECT on another fallback
# (Repeat steps above with a different result)
# curl ... -d '... "response": "rejected" ...'

# Expected: cascades to next bidder or fails_all_fallbacks
```

---

## Test 6: Cron Job Execution

**Goal:** Verify scripts run correctly

```bash
# Test auto-close script
node /path/to/scripts/auto-close-auctions.js
# Expected: [timestamp] Calling auto-close endpoint...
# Expected: Exit code 0 (success)

# Test payment-fallback script
PAYMENT_FALLBACK_URL=http://localhost:3000/api/auction/payment-fallback \
node /path/to/scripts/payment-fallback-check.js
# Expected: [timestamp] Running payment fallback check...
# Expected: Exit code 0 (success)

# Simulate cron (every 5 minutes)
watch -n 300 'node /path/to/scripts/payment-fallback-check.js'
```

---

## Test 7: End-to-End Scenario

**Goal:** Test complete flow from settlement to fallback

### Setup
```bash
# 1. Create test auction (via UI or direct DB insert)
# 2. Ensure cutoff_time has passed (auto-close will trigger)
# 3. Add 3+ revealed bids from different bidders

psql "..." << 'SQL'
-- Create test data
INSERT INTO auctions (id, ticket_id, status, cutoff_time) 
VALUES ('test-auction-1', 'ticket-123', 'active', NOW() - INTERVAL '1 hour');

INSERT INTO auction_commitments 
  (auction_id, bidder_address, revealed, revealed_amount) 
VALUES 
  ('test-auction-1', '0x1111...', true, 2.50),
  ('test-auction-1', '0x2222...', true, 2.25),
  ('test-auction-1', '0x3333...', true, 2.00);
SQL
```

### Step 1: Auto-Close
```bash
# Run auto-close
curl -X POST http://localhost:3000/api/auction/auto-close \
  -H "Content-Type: application/json" \
  -d '{"auctionId": "test-auction-1"}' | jq

# Verify:
# - auction_results created with winner 0x1111
# - status='pending_payment'
# - payment_deadline set to +1 hour
```

### Step 2: Expire Payment
```bash
# Update to simulate expired deadline
psql "..." -c "
  UPDATE auction_results 
  SET payment_deadline = NOW() - INTERVAL '1 minute'
  WHERE auction_id = 'test-auction-1';
"
```

### Step 3: Trigger Fallback
```bash
# Run payment-fallback check
curl -X POST http://localhost:3000/api/auction/payment-fallback \
  -H "Content-Type: application/json" \
  -d '{}' | jq

# Verify:
# - status changed to 'failed_payment' then 'fallback_offered'
# - winner_address changed to 0x2222 (2nd highest)
# - payment_fallback_log created
```

### Step 4: Accept Fallback
```bash
# Get fallback log ID
FALLBACK_LOG_ID=$(psql "..." -c "
  SELECT id FROM payment_fallback_log 
  WHERE auction_id = 'test-auction-1' LIMIT 1" -t)

# Bidder accepts
curl -X POST http://localhost:3000/api/auction/fallback-response \
  -H "Content-Type: application/json" \
  -d "{
    \"auctionResultId\": \"...\",
    \"fallbackLogId\": \"$FALLBACK_LOG_ID\",
    \"response\": \"accepted\",
    \"bidderAddress\": \"0x2222...\"
  }" | jq

# Verify: status='fallback_accepted'
```

### Step 5: Confirm Payment
```bash
# Bidder pays
RESULT_ID=$(psql "..." -c "
  SELECT id FROM auction_results 
  WHERE auction_id = 'test-auction-1'" -t)

curl -X POST http://localhost:3000/api/auction/confirm-payment \
  -H "Content-Type: application/json" \
  -d "{\"auctionResultId\": \"$RESULT_ID\"}" | jq

# Verify: status='paid', payment_received_at set
```

---

## Test 8: Failure Scenarios

### Scenario A: Primary Winner Misses Deadline
```bash
# Already tested in Test 3
# Expected: Cascades to fallback_offered
```

### Scenario B: All Fallback Bidders Reject
```bash
# 1. Expire first fallback payment
# 2. Reject fallback-response (instead of accept)
# 3. Process payment-fallback again
# 4. Repeat until fallback_count > maxFallbackAttempts

# Expected: status='failed_all_fallbacks' after 3 attempts
```

### Scenario C: Fallback Offer Expires
```bash
# 1. Expire the offer_expires_at timestamp
# 2. Fallback bidder doesn't respond
# 3. Payment-fallback runs and cascades

psql "..." -c "
  UPDATE payment_fallback_log 
  SET offer_expires_at = NOW() - INTERVAL '1 minute'
  WHERE response_status = 'pending'
  LIMIT 1;
"

# Run payment-fallback
curl -X POST http://localhost:3000/api/auction/payment-fallback ...

# Expected: Treated as rejection, tries next bidder
```

---

## Test 9: API Error Handling

### Invalid Auction Result
```bash
curl -X POST http://localhost:3000/api/auction/confirm-payment \
  -H "Content-Type: application/json" \
  -d '{"auctionResultId": "999999"}' | jq

# Expected: {"error": "Auction result not found"}
```

### Unauthorized Bidder
```bash
curl -X POST http://localhost:3000/api/auction/fallback-response \
  -H "Content-Type: application/json" \
  -d "{
    \"auctionResultId\": \"123\",
    \"fallbackLogId\": \"456\",
    \"response\": \"accepted\",
    \"bidderAddress\": \"0xWRONG...\"
  }" | jq

# Expected: {"error": "Bidder address does not match..."}
```

### Expired Offer
```bash
# Try to respond after offer_expires_at
# Expected: {"error": "Fallback offer has expired"}
```

---

## Performance Testing

### Database Query Performance
```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM auction_results 
WHERE status = 'pending_payment' 
  AND payment_deadline < NOW();

-- Should use index on (status, payment_deadline)
```

### Cron Job Load
```bash
# Monitor during cron execution
watch -n 1 'ps aux | grep node'

# Check memory usage
top -p $(pgrep -f payment-fallback)
```

### API Response Time
```bash
# Time endpoint
time curl http://localhost:3000/api/auction/payment-fallback

# Expected: < 500ms for typical workload
```

---

## Monitoring Checklist

- [ ] Logs are being written to `/var/log/veilpass/fallback-check.log`
- [ ] Cron jobs executing every 5 minutes
- [ ] `payment_fallback_log` growing with each fallback attempt
- [ ] `auction_results` status values transitioning correctly
- [ ] API response times under 500ms
- [ ] Database query times under 100ms
- [ ] No orphaned records in fallback_log
- [ ] No auctions stuck in intermediate states > 1 hour

---

## Test Summary Checklist

- [ ] Test 1: Schema verification
- [ ] Test 2: Auto-close functionality
- [ ] Test 3: Fallback trigger
- [ ] Test 4: Payment confirmation
- [ ] Test 5: Bidder response
- [ ] Test 6: Cron jobs
- [ ] Test 7: End-to-end flow
- [ ] Test 8: Failure scenarios
- [ ] Test 9: Error handling
- [ ] Performance testing

---

## Quick Test Script

```bash
#!/bin/bash
# save as test-payment-system.sh

echo "Testing Payment Fallback System"
echo "================================"

API="http://localhost:3000"

# Test 1: Auto-close
echo -e "\n[TEST 1] Auto-close API"
curl -s -X POST $API/api/auction/auto-close \
  -H "Content-Type: application/json" -d '{}' | jq '.ok'

# Test 2: Payment fallback
echo -e "\n[TEST 2] Payment fallback API"
curl -s -X POST $API/api/auction/payment-fallback \
  -H "Content-Type: application/json" -d '{}' | jq '.ok'

# Test 3: Get payment status
echo -e "\n[TEST 3] Get payment status"
curl -s "$API/api/auction/confirm-payment?auctionResultId=1" | jq '.ok'

echo -e "\n================================"
echo "All tests completed!"
```

---

**Created:** December 20, 2025
**Status:** Ready for testing
