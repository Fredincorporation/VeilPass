#!/usr/bin/env node
/*
  payment-fallback-test-runner.js

  Simple automated test that:
  - Runs verification SQL against the provided Supabase Postgres DB
  - Calls the payment-fallback API endpoint

  Usage:
    SUPABASE_DB_URL="postgresql://..." API_URL="http://localhost:3000" \
      node ./scripts/payment-fallback-test-runner.js

  Required env:
    - SUPABASE_DB_URL  (postgres connection string, service_role recommended)
    - API_URL          (base URL of your running backend, e.g. http://localhost:3000)

  Exit codes:
    0 = success (all checks passed)
    1 = failure (error encountered)

*/

const { Pool } = require('pg');

(async function main() {
  try {
    const dbUrl = process.env.SUPABASE_DB_URL;
    const apiUrl = process.env.API_URL;

    if (!dbUrl) {
      console.error('\nERROR: SUPABASE_DB_URL environment variable is required.');
      process.exit(1);
    }
    if (!apiUrl) {
      console.error('\nERROR: API_URL environment variable is required.');
      process.exit(1);
    }

    console.log('Connecting to DB...');
    const pool = new Pool({ connectionString: dbUrl });
    await pool.connect();

    const results = {};

    // 1) Check auction_results has expected columns
    const checkColumnsSql = `
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'auction_results'
        AND column_name IN ('status', 'payment_deadline', 'payment_received_at', 'fallback_count', 'is_fallback_winner', 'previous_winner_address')
      ORDER BY column_name;
    `;
    const colRes = await pool.query(checkColumnsSql);
    results.auction_results_columns = colRes.rows.map((r) => r.column_name);
    console.log('\nFound auction_results columns:', results.auction_results_columns);

    // 2) Check payment_fallback_log exists
    const fallbackTableSql = `SELECT to_regclass('public.payment_fallback_log') as regclass;`;
    const fallbackTableRes = await pool.query(fallbackTableSql);
    results.payment_fallback_log = fallbackTableRes.rows[0].regclass !== null;
    console.log('payment_fallback_log exists:', results.payment_fallback_log);

    // 3) Check functions exist
    const funcsSql = `
      SELECT proname FROM pg_proc
      WHERE proname IN ('get_fallback_bidders','mark_payment_received');
    `;
    const funcsRes = await pool.query(funcsSql);
    results.functions = funcsRes.rows.map((r) => r.proname);
    console.log('Found functions:', results.functions);

    // 4) Optionally, run a quick sanity check query on auction_results counts
    const sampleSql = `SELECT COUNT(*)::int AS cnt FROM auction_results;`;
    const sampleRes = await pool.query(sampleSql);
    results.auction_results_count = sampleRes.rows[0].cnt;
    console.log('auction_results rows:', results.auction_results_count);

    // Close DB connection
    await pool.end();

    // 5) Call the payment-fallback API endpoint
    const endpoint = `${apiUrl.replace(/\/$/, '')}/api/auction/payment-fallback`;
    console.log('\nCalling payment-fallback endpoint:', endpoint);

    const body = { maxFallbackAttempts: 3 };

    // use global fetch (Node 18+) or fallback to node-fetch
    const fetchFn = typeof fetch === 'undefined' ? (await import('node-fetch')).default : fetch;

    const resp = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    let respJson = null;
    try {
      respJson = await resp.json();
    } catch (e) {
      respJson = { status: resp.status, text: await resp.text() };
    }

    results.payment_fallback_api = { status: resp.status, body: respJson };
    console.log('payment-fallback response status:', resp.status);
    console.log('payment-fallback response body:', JSON.stringify(respJson, null, 2));

    // Summarize
    console.log('\n=== SUMMARY ===');
    console.log('Columns check OK:', results.auction_results_columns.length >= 1);
    console.log('fallback_log exists:', results.payment_fallback_log);
    console.log('functions found:', results.functions);
    console.log('auction_results count:', results.auction_results_count);
    console.log('payment-fallback API status:', results.payment_fallback_api.status);

    // Decide exit code: success if table + functions exist and API returned 200/201/204/202
    const apiOk = [200, 201, 202, 204].includes(results.payment_fallback_api.status);
    const dbOk = results.payment_fallback_log && results.functions.length >= 1;

    if (apiOk && dbOk) {
      console.log('\nAll checks passed.');
      process.exit(0);
    }

    console.error('\nSome checks failed. See output above.');
    process.exit(1);
  } catch (err) {
    console.error('\nERROR running tests:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
