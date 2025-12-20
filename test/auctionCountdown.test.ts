import assert from 'assert';
import { computeTimeLeft } from '@/lib/auctionCountdown';

// Simple smoke tests for computeTimeLeft
(async () => {
  console.log('Running auctionCountdown tests...');

  // Test 1: 90 seconds from now -> expect "1m" in timeLeft
  const end1 = new Date(Date.now() + 90 * 1000);
  const r1 = computeTimeLeft(end1);
  console.log('Test 1 result:', r1);
  assert(/m|s/.test(r1.timeLeft), 'Expected minutes or seconds in timeLeft');

  // Test 2: 2 hours from now -> expect "h" in timeLeft
  const end2 = new Date(Date.now() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000);
  const r2 = computeTimeLeft(end2);
  console.log('Test 2 result:', r2);
  assert(/h/.test(r2.timeLeft), 'Expected hours in timeLeft');

  // Test 3: ended auction
  const end3 = new Date(Date.now() - 1000);
  const r3 = computeTimeLeft(end3);
  console.log('Test 3 result:', r3);
  assert(r3.timeLeft === 'Ended', 'Expected Ended for past end date');

  console.log('All auctionCountdown tests passed');
})();
