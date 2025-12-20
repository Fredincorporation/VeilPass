#!/usr/bin/env node
/*
  Simple script to call the local settle endpoint. Useful for cron or scheduled tasks.
  Requires dev server running on localhost:3000 (or change URL below).
*/

const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

async function run() {
  try {
    const url = process.env.SETTLE_URL || 'http://localhost:3000/api/auction/settle';
    console.log('Calling settle endpoint:', url);
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const json = await res.json();
    console.log('Result:', JSON.stringify(json, null, 2));
    if (!res.ok) process.exit(1);
  } catch (err) {
    console.error('Error calling settle endpoint:', err);
    process.exit(2);
  }
}

if (require.main === module) run();
