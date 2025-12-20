#!/usr/bin/env node
/**
 * Direct Supabase settle script.
 * Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env, then run:
 *   node scripts/settle_auctions_direct.js
 *
 * This script is safe to run as a cron job on a trusted server (it requires
 * the Supabase service role key). It runs the same settlement logic as
 * the HTTP settle endpoint but operates directly against the DB.
 */

(async () => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
      process.exit(2);
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log('Finding auctions with revealed bids...');
    const { data: auctionsData, error: aErr } = await supabase
      .from('auction_commitments')
      .select('auction_id')
      .eq('revealed', true);

    if (aErr) throw aErr;

    const auctionIds = Array.from(new Set((auctionsData || []).map(r => r.auction_id)));
    console.log('Auctions to consider:', auctionIds.length);

    for (const aid of auctionIds) {
      // skip if already settled
      const { data: existing, error: exErr } = await supabase
        .from('auction_results')
        .select('id')
        .eq('auction_id', aid)
        .limit(1);

      if (exErr) throw exErr;
      if (existing && existing.length) {
        console.log('Skipping already settled auction', aid);
        continue;
      }

      // get highest revealed bid
      const { data: bids, error: bidsErr } = await supabase
        .from('auction_commitments')
        .select('*')
        .eq('auction_id', aid)
        .eq('revealed', true)
        .order('revealed_amount', { ascending: false })
        .limit(1);

      if (bidsErr) throw bidsErr;
      if (!bids || bids.length === 0) {
        console.log('No revealed bids for', aid);
        continue;
      }

      const winner = bids[0];
      const { data: inserted, error: insErr } = await supabase
        .from('auction_results')
        .insert([{
          auction_id: aid,
          winner_address: winner.bidder_address,
          winning_amount: winner.revealed_amount,
          commitment_id: winner.id,
        }])
        .select();

      if (insErr) throw insErr;

      console.log('Settled', aid, 'winner', winner.bidder_address, 'amount', winner.revealed_amount);
    }

    console.log('Settle run completed');
    process.exit(0);
  } catch (err) {
    console.error('Error in settle_auctions_direct:', err);
    process.exit(3);
  }
})();
