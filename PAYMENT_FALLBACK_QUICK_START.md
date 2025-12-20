# Payment Fallback System - Quick Start Guide

## 1️⃣ Database Setup (5 minutes)

```bash
# Apply migration in Supabase SQL editor
cat DATABASE_MIGRATIONS_ADD_PAYMENT_FALLBACK.sql | psql <your-db-url>

# Or in Supabase UI:
# 1. Go to SQL Editor
# 2. New Query
# 3. Copy & paste DATABASE_MIGRATIONS_ADD_PAYMENT_FALLBACK.sql
# 4. Run
```

## 2️⃣ Deploy Backend (5 minutes)

Copy these files to your Next.js project:
- `src/app/api/auction/payment-fallback/route.ts`
- `src/app/api/auction/confirm-payment/route.ts`
- `src/app/api/auction/fallback-response/route.ts`

```bash
npm run build  # Verify no errors
npm run dev    # Test locally
```

## 3️⃣ Set Up Cron Jobs (5 minutes)

```bash
# Copy script
cp scripts/payment-fallback-check.js /usr/local/bin/

# Make executable
chmod +x /usr/local/bin/payment-fallback-check.js

# Add to crontab
crontab -e

# Paste these lines:
*/5 * * * * /usr/bin/node /var/www/veilpass/scripts/auto-close-auctions.js >> /var/log/veilpass/auto-close.log 2>&1
*/5 * * * * /usr/bin/node /var/www/veilpass/scripts/payment-fallback-check.js >> /var/log/veilpass/fallback-check.log 2>&1
```

## 4️⃣ Configure Environment

```bash
# .env.local
PAYMENT_FALLBACK_URL=https://yourdomain.com/api/auction/payment-fallback
MAX_FALLBACK_ATTEMPTS=3
```

## 5️⃣ Test It

```bash
# Test payment fallback endpoint
curl -X POST http://localhost:3000/api/auction/payment-fallback \
  -H "Content-Type: application/json" \
  -d '{"maxFallbackAttempts": 3}'

# Expected: {"ok":true,"fallbacks_initiated":[],"message":"No expired payments to process"}

# Test confirm payment endpoint
curl -X GET "http://localhost:3000/api/auction/confirm-payment?auctionResultId=1"

# Expected: {"ok":true,"result":{...}}
```

## Flow Diagram

```
AUTO-CLOSE (every 5 min)           PAYMENT FALLBACK (every 5 min)        USER ACTIONS
┌──────────────────────────────┐   ┌──────────────────────────────┐
│ 1. Find cutoff auctions      │   │ 1. Find expired payments     │
│ 2. Get highest bid           │   │ 2. Mark failed_payment       │
│ 3. Create auction_result     │   │ 3. Get fallback bidders      │
│    - status: pending_payment │   │ 4. Create fallback_log entry │
│    - deadline: +1 hour       │───→ 5. Offer to fallback bidder │
│ 4. Notify winner ✉️          │   │ 6. Notify fallback bidder ✉️ │
└──────────────────────────────┘   └──────────────────────────────┘
                                             ↓
                                    ┌─────────────────┐
                                    │ Bidder responds │
                                    └─────────────────┘
                                      ↓         ↓
                                 ACCEPT    REJECT
                                    ↓         ↓
                                 [Next bidder] ← Try bidder #2
                                    ↓
                           ┌──────────────────────┐
                           │ confirm-payment API  │
                           │ - Mark as paid       │
                           │ - Close payment window
                           └──────────────────────┘
```

## Status Transitions

```
pending_payment ──(deadline passed)──> failed_payment ──> fallback_offered
                                                              ↓
                                          ┌──────────────────┴──────────────────┐
                                          ↓                                      ↓
                                  fallback_accepted                      fallback_rejected/expired
                                          ↓                                      ↓
                                       paid                          fallback_offered (next bidder)
                                                                            ↓
                                                                     (repeat up to 3x)
                                                                            ↓
                                                                  failed_all_fallbacks
```

## Monitoring

```bash
# Watch logs in real-time
tail -f /var/log/veilpass/fallback-check.log

# Check payment status for specific auction
curl "http://localhost:3000/api/auction/confirm-payment?auctionResultId=123"

# Query database
psql your-db-url -c "
  SELECT 
    id, auction_id, status, winner_address, 
    payment_deadline, fallback_count 
  FROM auction_results 
  WHERE status IN ('pending_payment', 'fallback_offered')
  ORDER BY payment_deadline ASC;"
```

## Troubleshooting

### Fallbacks not being offered
```bash
# Check if payment-fallback-check.js is running
ps aux | grep payment-fallback

# Check cron logs
grep CRON /var/log/syslog

# Check script output
tail -20 /var/log/veilpass/fallback-check.log
```

### Bidders not receiving notifications
```sql
-- Check payment_fallback_log for pending offers
SELECT * FROM payment_fallback_log 
WHERE response_status = 'pending' 
AND NOW() > offer_expires_at;

-- These need manual notification or resend
```

### Auction stuck in fallback_offered
```sql
-- Check if offer expired
SELECT * FROM payment_fallback_log 
WHERE auction_result_id = 123
ORDER BY offer_timestamp DESC;

-- Manually expire if needed
UPDATE auction_results 
SET status = 'fallback_rejected' 
WHERE id = 123;
```

## Key Parameters to Adjust

```typescript
// In auto-close endpoint:
const paymentDeadline = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
// Change to 24 hours:
const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

// In payment-fallback endpoint:
const offerExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
const paymentDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

// Max fallback attempts (in fallback-response):
const maxAttempts = 3; // Try 3 bidders max
```

## Cron Timing Strategy

| Interval | Use Case | Load |
|----------|----------|------|
| */1 * * * * | Real-time (aggressive) | High |
| */5 * * * * | Standard (recommended) | Low-Medium |
| */10 * * * * | Conservative | Low |

**Recommendation:** Start with `*/5 * * * *` (every 5 minutes)

---

## Next Steps

1. ✅ Apply migration
2. ✅ Deploy code
3. ✅ Set up cron
4. ⏳ **Build frontend UI** for payment status
5. ⏳ **Add notifications** (email/SMS for fallback offers)
6. ⏳ **Set up monitoring** (alerts for failures)

---

**Questions?** See `PAYMENT_FALLBACK_SYSTEM_COMPLETE.md` for full documentation.
