# VeilPass Security Audit & Hardening Report

## Critical Issues Found & Fixes Applied

### 1. **Missing Authentication/Authorization Checks**

**Issue**: Admin routes do not verify that the caller is actually an admin. Using public/anon Supabase key.

**Files Affected**:
- `src/app/api/admin/**/*.ts` (all admin routes)
- `src/app/api/auction/payment-fallback/route.ts`
- `src/app/api/auction/confirm-payment/route.ts`

**Risk Level**: 🔴 CRITICAL

**Fix**: 
- Add `getAuth()` call to verify user identity
- Check if user has `admin` or `seller` role in `users` table
- Return 401/403 on unauthorized access

---

### 2. **Unvalidated Input Parameters**

**Issue**: Query parameters and request bodies are not validated before use in SQL queries.

**Files Affected**:
- `src/app/api/admin/sellers/route.ts`: `status` param
- `src/app/api/auction/payment-fallback/route.ts`: `auctionId`, `maxFallbackAttempts`
- `src/app/api/auction/confirm-payment/route.ts`: `auctionResultId`, `paymentTxHash`

**Risk Level**: 🔴 CRITICAL (potential SQL injection)

**Fix**:
- Use Zod schema validation for all inputs
- Sanitize strings, validate integers/UUIDs
- Whitelist allowed values for enums

---

### 3. **Integer Overflow/Underflow in Solidity**

**Issue**: `VeilPassCore.sol` and `DisputeResolution.sol` perform arithmetic without SafeMath or Solidity 0.8.20+ checked ops.

**Files Affected**:
- `contracts/VeilPassCore.sol` (lines 173, 245)
- All counter increments: `ticketIdCounter++`, `eventIdCounter++`, `auctionIdCounter++`

**Risk Level**: 🟡 MEDIUM (Solidity 0.8.20+ has built-in overflow checks, but explicit guards are better)

**Fix**:
- Add explicit `require()` checks for counter increments
- Use `SafeMath` patterns or explicit bounds

---

### 4. **Missing Reentrancy Guards in Contracts**

**Issue**: `VeilPassCore.purchaseTicket()` transfers ETH/USDC but doesn't follow checks-effects-interactions pattern strictly.

**Files Affected**:
- `contracts/VeilPassCore.sol` lines 141–173

**Risk Level**: 🟡 MEDIUM

**Fix**:
- Add `nonReentrant` modifier (already imported from OpenZeppelin)
- Move all state updates BEFORE external calls

---

### 5. **Unencrypted Sensitive Data in Logs**

**Issue**: Wallet addresses, amounts, and user data are logged to console in production.

**Files Affected**:
- Multiple API routes: `console.log()` statements

**Risk Level**: 🟡 MEDIUM

**Fix**:
- Remove/redact console logs in production
- Use structured logging with redacted fields

---

### 6. **Missing CORS & Rate Limiting**

**Issue**: No CORS headers, no rate limiting → DDoS risk, data exposure.

**Files Affected**:
- All API routes

**Risk Level**: 🟡 MEDIUM

**Fix**:
- Add CORS middleware
- Implement rate limiting (e.g., Turnstile CAPTCHA, IP-based throttling)
- Add request ID tracking

---

### 7. **Weak Input Validation for Addresses**

**Issue**: Ethereum addresses not validated with `ethers.isAddress()`.

**Files Affected**:
- `src/app/api/auction/payment-fallback/route.ts`: `winner_address`
- `src/app/api/auction/confirm-payment/route.ts`: No validation

**Risk Level**: 🟡 MEDIUM

**Fix**:
- Validate all addresses with `ethers.getAddress()` or `isAddress()`
- Reject invalid addresses early

---

### 8. **No CSRF Protection**

**Issue**: POST/PUT/DELETE endpoints don't validate CSRF tokens.

**Files Affected**:
- All state-changing endpoints

**Risk Level**: 🟡 MEDIUM

**Fix**:
- Add CSRF token validation via middleware

---

### 9. **Hardcoded Service Role Key Exposure**

**Issue**: `SUPABASE_SERVICE_ROLE_KEY` used directly in API routes (immutable in built code).

**Files Affected**:
- All admin routes

**Risk Level**: 🔴 CRITICAL

**Fix**:
- Use Supabase's `getAuth()` from `@supabase/auth-helpers-nextjs`
- Create admin client only on server side, never expose key to client

---

### 10. **No Request Size Limits**

**Issue**: Large payloads can cause memory exhaustion or DoS.

**Files Affected**:
- All `POST` endpoints

**Risk Level**: 🟡 MEDIUM

**Fix**:
- Set `bodyParser` limits in Next.js
- Validate payload size before processing

---

### 11. **SQL Injection via RPC Calls**

**Issue**: `get_fallback_bidders()` RPC doesn't validate `p_auction_id` or `p_exclude_address`.

**Files Affected**:
- `src/app/api/auction/payment-fallback/route.ts` line 92
- `DATABASE_MIGRATIONS_ADD_PAYMENT_FALLBACK.sql`

**Risk Level**: 🔴 CRITICAL

**Fix**:
- Validate UUID format for `auction_id`
- Validate Ethereum address format for `exclude_address`
- Use Supabase's built-in type validation

---

### 12. **Missing Timestamp Validation**

**Issue**: `payment_deadline` and other timestamps not validated before use.

**Files Affected**:
- `src/app/api/auction/payment-fallback/route.ts`

**Risk Level**: 🟡 MEDIUM

**Fix**:
- Validate timestamp is in the future
- Reject past or zero timestamps

---

## Applied Fixes (Detailed Below)

See `SECURITY_PATCHES.md` for the applied patches.

---

## Performance Improvements

### 1. **Database Query Optimization**

- Added indexes for frequently queried fields:
  - `auction_results(payment_deadline, status)` (for cron queries)
  - `users(role, seller_status)` (for seller lookups)
  - `payment_fallback_log(auction_result_id, response_status)`

### 2. **Caching Strategy**

- Implement in-memory cache for read-only endpoints:
  - `/api/admin/sellers` (cache 5 min)
  - `/api/auctions` (cache 1 min)
- Add ETag support for 304 Not Modified responses

### 3. **Connection Pooling**

- Supabase client is already shared globally (best practice)
- No changes needed; already optimized

### 4. **Request Deduplication**

- Multiple simultaneous requests for same auction result should share response
- Implement using simple in-memory cache with request deduplication key

### 5. **Rate Limiting**

- Implement per-IP rate limiting (e.g., 100 req/min per IP)
- Stricter limits for mutation endpoints (10 req/min)

---

## Files Modified

1. ✅ `src/app/api/middleware/auth.ts` (NEW) — Auth middleware
2. ✅ `src/app/api/middleware/validation.ts` (NEW) — Input validation schemas
3. ✅ `src/app/api/middleware/security.ts` (NEW) — CORS, rate limiting, CSRF
4. ✅ `src/app/api/auction/confirm-payment/route.ts` (UPDATED) — Auth + validation
5. ✅ `src/app/api/auction/payment-fallback/route.ts` (UPDATED) — Auth + validation
6. ✅ `src/app/api/auction/fallback-response/route.ts` (UPDATED) — Auth + validation
7. ✅ `src/app/api/admin/sellers/route.ts` (UPDATED) — Auth + validation
8. ✅ `contracts/VeilPassCore.sol` (UPDATED) — Reentrancy guards + bounds checks
9. ✅ `contracts/GovernmentIDVerification.sol` (UPDATED) — Input validation
10. ✅ `src/lib/validation.ts` (NEW) — Shared validation helpers

---

## Testing Recommendations

1. Run Slither (static analysis) on contracts
2. Unit test all input validation schemas
3. Penetration test with invalid inputs (fuzzing)
4. Test with Burp Suite for CSRF/CORS bypass
5. Load test with k6 or Artillery

---

## Deployment Checklist

- [ ] Review all hardening changes
- [ ] Run security static analysis (Slither, ESLint security plugin)
- [ ] Run full test suite
- [ ] Update environment variables (no hardcoded keys)
- [ ] Deploy to staging first
- [ ] Enable rate limiting in production
- [ ] Monitor logs for suspicious activity

---

**Generated**: December 21, 2025  
**Status**: 🔒 HARDENING IN PROGRESS
