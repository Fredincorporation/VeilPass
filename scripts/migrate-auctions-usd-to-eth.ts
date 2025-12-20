/**
 * Migration script to populate ETH fields from legacy USD snapshot values.
 * Usage: Set environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` then run:
 *    node -r ts-node/register scripts/migrate-auctions-usd-to-eth.ts
 */
import { createClient } from '@supabase/supabase-js';
import { fetchEthPrice } from '@/lib/currency-utils';

async function run() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
  }

  const supabaseAdmin = createClient(url, key);

  console.log('Fetching current ETH price...');
  const ethPrice = await fetchEthPrice();
  console.log('ETH price:', ethPrice);

  // Find auctions that have USD snapshot but missing ETH fields
  const { data: auctions, error } = await supabaseAdmin
    .from('auctions')
    .select('*')
    .or('listing_price.is.null,start_bid.is.null,reserve_price.is.null')
    .limit(1000);

  if (error) {
    console.error('Error fetching auctions:', error);
    process.exit(1);
  }

  if (!auctions || auctions.length === 0) {
    console.log('No auctions to migrate');
    return;
  }

  for (const a of auctions) {
    const updates: any = {};
    if ((a.listing_price === null || a.listing_price === undefined) && a.listing_price_usd) {
      updates.listing_price = Number((Number(a.listing_price_usd) / ethPrice).toFixed(8));
    }
    if ((a.start_bid === null || a.start_bid === undefined) && a.start_bid_usd) {
      updates.start_bid = Number((Number(a.start_bid_usd) / ethPrice).toFixed(8));
    }
    if ((a.reserve_price === null || a.reserve_price === undefined) && a.reserve_price_usd) {
      updates.reserve_price = Number((Number(a.reserve_price_usd) / ethPrice).toFixed(8));
    }

    if (Object.keys(updates).length > 0) {
      const { error: upErr } = await supabaseAdmin
        .from('auctions')
        .update(updates)
        .eq('id', a.id);

      if (upErr) {
        console.error('Failed to update auction', a.id, upErr);
      } else {
        console.log('Updated auction', a.id, updates);
      }
    }
  }

  console.log('Migration complete');
}

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
