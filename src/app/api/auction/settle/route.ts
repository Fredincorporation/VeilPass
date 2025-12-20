import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// This endpoint settles auctions by selecting the highest revealed bid per auction
// and inserting a row in `auction_results`.

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // optional: accept { auctionId }
    const { auctionId } = body || {};

    // find auctions with revealed bids that do not yet have results
    let auctionsQuery = supabase
      .from('auction_commitments')
      .select('auction_id')
      .eq('revealed', true);

    if (auctionId) auctionsQuery = auctionsQuery.eq('auction_id', auctionId);

    const { data: auctionsData, error: auctionsErr } = await auctionsQuery;
    if (auctionsErr) return NextResponse.json({ error: auctionsErr.message }, { status: 500 });

    const auctionIds = Array.from(new Set((auctionsData || []).map((r: any) => r.auction_id)));

    const results: any[] = [];

    for (const aid of auctionIds) {
      // skip if already settled
      const { data: existingResults, error: resErr } = await supabase
        .from('auction_results')
        .select('*')
        .eq('auction_id', aid)
        .limit(1);
      if (resErr) return NextResponse.json({ error: resErr.message }, { status: 500 });
      if (existingResults && existingResults.length > 0) continue;

      // get highest revealed bid for this auction
      const { data: bids, error: bidsErr } = await supabase
        .from('auction_commitments')
        .select('*')
        .eq('auction_id', aid)
        .eq('revealed', true)
        .order('revealed_amount', { ascending: false })
        .limit(1);

      if (bidsErr) return NextResponse.json({ error: bidsErr.message }, { status: 500 });
      if (!bids || bids.length === 0) continue; // nothing to settle

      const winner = bids[0];

      const { data: insertData, error: insertErr } = await supabase
        .from('auction_results')
        .insert([
          {
            auction_id: aid,
            winner_address: winner.bidder_address,
            winning_amount: winner.revealed_amount,
            commitment_id: winner.id,
          },
        ])
        .select();

      if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

      results.push({ auctionId: aid, winner: insertData });
    }

    return NextResponse.json({ ok: true, settled: results }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
