#!/usr/bin/env node

const paymentFallbackUrl = process.env.PAYMENT_FALLBACK_URL || 'http://localhost:3000/api/auction/payment-fallback';
const maxFallbackAttempts = parseInt(process.env.MAX_FALLBACK_ATTEMPTS || '3', 10);

(async () => {
  try {
    console.log(`[${new Date().toISOString()}] Running payment fallback check at:`, paymentFallbackUrl);

    const response = await fetch(paymentFallbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxFallbackAttempts,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[${new Date().toISOString()}] Payment fallback check completed successfully`);
      console.log(JSON.stringify(data, null, 2));

      if (data.fallbacks_initiated && data.fallbacks_initiated.length > 0) {
        console.log(`[${new Date().toISOString()}] Initiated ${data.fallbacks_initiated.length} fallback offers`);
      } else {
        console.log(`[${new Date().toISOString()}] No expired payments requiring fallback`);
      }

      process.exit(0);
    } else {
      console.error(`[${new Date().toISOString()}] Payment fallback check failed:`, data);
      process.exit(1);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error in payment-fallback script:`, err.message);
    process.exit(2);
  }
})();
