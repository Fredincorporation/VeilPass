#!/usr/bin/env node

const settle_url = process.env.SETTLE_URL || 'http://localhost:3000/api/auction/auto-close';

(async () => {
  try {
    console.log(`[${new Date().toISOString()}] Calling auto-close endpoint:`, settle_url);
    
    const response = await fetch(settle_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`[${new Date().toISOString()}] Auto-close completed:`, JSON.stringify(data, null, 2));
      process.exit(0);
    } else {
      console.error(`[${new Date().toISOString()}] Auto-close failed:`, data);
      process.exit(1);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error in auto-close script:`, err.message);
    process.exit(2);
  }
})();
