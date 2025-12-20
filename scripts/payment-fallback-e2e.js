#!/usr/bin/env node
/*
  payment-fallback-e2e.js

  End-to-end automated test for payment fallback flow.

  WARNING: Run this ONLY against a test or staging database. The script will INSERT and DELETE rows.
  Use a Supabase test project or a copy of your DB.

  Required environment variables:
    - SUPABASE_DB_URL  (postgres connection string with write permissions)
    - API_URL          (base URL of the running backend, e.g. http://localhost:3000)

  Run:
    SUPABASE_DB_URL="postgresql://..." API_URL="http://localhost:3000" node ./scripts/payment-fallback-e2e.js

*/

const { Pool } = require('pg');
const { randomUUID } = require('crypto');

(async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  const apiUrl = process.env.API_URL;

  if (!dbUrl || !apiUrl) {
    console.error('ERROR: SUPABASE_DB_URL and API_URL must be set.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const testId = `e2e-${Date.now()}-${randomUUID().slice(0,6)}`;
  const auctionId = `e2e-auction-${testId}`;

  // Test bidders (unique addresses for test)
  const bidders = [`0x${randomUUID().replace(/-/g,'').slice(0,40)}`, `0x${randomUUID().replace(/-/g,'').slice(0,40)}`, `0x${randomUUID().replace(/-/g,'').slice(0,40)}`];

  try {
    // Safety: require explicit confirmation before running destructive E2E test
    await ensureConfirmed();
    console.log('E2E test id:', testId);
    console.log('Connecting to DB...');
    await pool.connect();

    // 1) Insert test auction with cutoff_time in the past
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
    console.log('Creating test auction:', auctionId);
    await pool.query(
      'INSERT INTO auctions (id, ticket_id, status, cutoff_time) VALUES ($1,$2,$3,$4)',
      [auctionId, `ticket-${testId}`, 'active', cutoffTime]
    );

    // 2) Insert 3 revealed commitments (bids)
    console.log('Inserting revealed commitments (bids)...');
    const amounts = [2.5, 2.25, 2.0];
    for (let i = 0; i < bidders.length; i++) {
      await pool.query(
        `INSERT INTO auction_commitments (auction_id, bidder_address, revealed, revealed_amount, created_at)
         VALUES ($1,$2,$3,$4,NOW())`,
        [auctionId, bidders[i], true, amounts[i]]
      );
    }

    // 3) Call auto-close endpoint to create auction_result
    const autoCloseUrl = `${apiUrl.replace(/\/$/, '')}/api/auction/auto-close`;
    console.log('Calling auto-close endpoint for auction:', auctionId);
    const fetchFn = typeof fetch === 'undefined' ? (await import('node-fetch')).default : fetch;
    let res = await fetchFn(autoCloseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auctionId }),
    });
    const autoCloseBody = await res.json().catch(() => ({}));
    console.log('auto-close response:', res.status, autoCloseBody);

    // 4) Read the auction_result for our auction
    const arRes = await pool.query('SELECT * FROM auction_results WHERE auction_id = $1 LIMIT 1', [auctionId]);
    if (!arRes.rows || arRes.rows.length === 0) throw new Error('No auction_result found after auto-close');
    const auctionResult = arRes.rows[0];
    console.log('Created auction_result id:', auctionResult.id, 'winner:', auctionResult.winner_address, 'status:', auctionResult.status);

    // 5) Expire payment_deadline (set to 1 hour ago)
    console.log('Expiring payment_deadline for auction_result id:', auctionResult.id);
    await pool.query('UPDATE auction_results SET payment_deadline = NOW() - INTERVAL \"1 hour\" WHERE id = $1', [auctionResult.id]);

    // 6) Trigger payment-fallback
    const fallbackUrl = `${apiUrl.replace(/\/$/, '')}/api/auction/payment-fallback`;
    console.log('Calling payment-fallback endpoint...');
    res = await fetchFn(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxFallbackAttempts: 3 }),
    });
    const fallbackBody = await res.json().catch(() => ({}));
    console.log('payment-fallback response:', res.status, fallbackBody);

    // 7) Check payment_fallback_log for our auction
    const pflRes = await pool.query('SELECT * FROM payment_fallback_log WHERE auction_id = $1 ORDER BY created_at DESC LIMIT 5', [auctionId]);
    console.log('payment_fallback_log rows found:', pflRes.rows.length);
    if (pflRes.rows.length === 0) throw new Error('No fallback log entries found');
    const latestFallback = pflRes.rows[0];
    console.log('Latest fallback entry:', latestFallback.id, latestFallback.fallback_bidder_address, latestFallback.response_status);

    // 8) Simulate fallback bidder accepting the offer
    const fallbackResponseUrl = `${apiUrl.replace(/\/$/, '')}/api/auction/fallback-response`;
    console.log('Simulating fallback bidder acceptance by', latestFallback.fallback_bidder_address);
    res = await fetchFn(fallbackResponseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auctionResultId: String(auctionResult.id),
        fallbackLogId: String(latestFallback.id),
        response: 'accepted',
        bidderAddress: latestFallback.fallback_bidder_address,
      }),
    });
    const fallbackResponseBody = await res.json().catch(() => ({}));
    console.log('fallback-response result:', res.status, fallbackResponseBody);

    // 9) Confirm payment (simulate bidder paid)
    const confirmUrl = `${apiUrl.replace(/\/$/, '')}/api/auction/confirm-payment`;
    console.log('Confirming payment for auction_result id:', auctionResult.id);
    res = await fetchFn(confirmUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auctionResultId: String(auctionResult.id) }),
    });
    const confirmBody = await res.json().catch(() => ({}));
    console.log('confirm-payment response:', res.status, confirmBody);

    // 10) Verify auction_results status = 'paid'
    const finalRes = await pool.query('SELECT status, payment_received_at FROM auction_results WHERE id = $1', [auctionResult.id]);
    console.log('Final auction_result status:', finalRes.rows[0]);
    if (finalRes.rows[0].status !== 'paid') throw new Error('Final status is not paid');

    console.log('\nE2E flow completed successfully. Cleaning up test rows...');

    // CLEANUP - remove inserted rows for this auction
    await pool.query('DELETE FROM payment_fallback_log WHERE auction_id = $1', [auctionId]);
    await pool.query('DELETE FROM auction_results WHERE auction_id = $1', [auctionId]);
    await pool.query('DELETE FROM auction_commitments WHERE auction_id = $1', [auctionId]);
    await pool.query('DELETE FROM auctions WHERE id = $1', [auctionId]);

    console.log('Cleanup complete. Test finished OK.');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\nE2E test failed:', err && err.message ? err.message : err);
    try { await pool.end(); } catch (e) {}
    process.exit(1);
  }
})();

// Ensure the user confirmed intent explicitly. Allows either a CLI flag `--confirm`
// or an interactive prompt typing the literal word `CONFIRM`.
async function ensureConfirmed() {
  const args = process.argv.slice(2) || [];
  if (args.includes('--confirm')) {
    console.log('Confirmation flag --confirm detected. Proceeding.');
    return;
  }

  // If not a TTY (CI), refuse to run unless --confirm provided
  if (!process.stdin.isTTY) {
    console.error('\nERROR: This script performs database writes and requires confirmation.');
    console.error('Re-run with the --confirm flag to proceed in non-interactive environments.');
    process.exit(2);
  }

  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const answer = await new Promise((resolve) => {
    rl.question('\nThis is a DESTRUCTIVE end-to-end test that will INSERT and DELETE rows in the database.\nType CONFIRM to proceed: ', (ans) => {
      rl.close();
      resolve((ans || '').trim());
    });
  });

  if (String(answer) !== 'CONFIRM') {
    console.error('\nConfirmation failed. Aborting.');
    process.exit(3);
  }

  console.log('Confirmation accepted — proceeding with E2E test.');
}
