import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchEthPrice } from '@/lib/currency-utils';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');
    
    let query = supabase
      .from('auctions')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: auctions, error } = await query;

    if (error) throw error;

    // If auctions reference tickets, fetch related ticket rows to provide a friendly title/event.
    const ticketIds = Array.from(new Set((auctions || []).map((a: any) => a.ticket_id).filter(Boolean)));
    let ticketsById: Record<string, any> = {};
    let eventsById: Record<string, any> = {};

    if (ticketIds.length > 0) {
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id,event_id,section')
        .in('id', ticketIds as any[]);

      if (tickets && Array.isArray(tickets)) {
        ticketsById = tickets.reduce((acc: Record<string, any>, t: any) => {
          acc[String(t.id)] = t;
          return acc;
        }, {} as Record<string, any>);

        const eventIds = Array.from(new Set(tickets.map((t: any) => t.event_id).filter(Boolean)));
        if (eventIds.length > 0) {
          const { data: events } = await supabase
            .from('events')
            .select('id,title')
            .in('id', eventIds as any[]);

          if (events && Array.isArray(events)) {
            eventsById = events.reduce((acc: Record<string, any>, e: any) => {
              acc[String(e.id)] = e;
              return acc;
            }, {} as Record<string, any>);
          }
        }
      }
    }

    // Compute highest bid and count per auction so UI can show current leading bid and total bids
    const auctionIds = Array.from(new Set((auctions || []).map((a: any) => a.id).filter(Boolean)));
    let highestByAuction: Record<string, any> = {};
    let countByAuction: Record<string, number> = {};
    if (auctionIds.length > 0) {
      const { data: bids } = await supabase
        .from('bids')
        .select('auction_id,amount')
        .in('auction_id', auctionIds as any[])
        .order('amount', { ascending: false });

      if (bids && Array.isArray(bids)) {
        // Reduce to highest amount per auction and count bids
        highestByAuction = {};
        countByAuction = {};
        for (const b of bids) {
          const key = String(b.auction_id);
          if (!highestByAuction[key]) highestByAuction[key] = b.amount;
          countByAuction[key] = (countByAuction[key] || 0) + 1;
        }
      }
    }

    const enriched = (auctions || []).map((a: any) => {
      const t = a.ticket_id ? ticketsById[String(a.ticket_id)] : null;
      const ev = t?.event_id ? eventsById[String(t.event_id)] : null;
      return {
        ...a,
        ticket_id: a.ticket_id,
        event_title: ev?.title ?? null,
        ticket_section: t?.section ?? null,
        current_highest: highestByAuction[String(a.id)] ?? null,
        bid_count: countByAuction[String(a.id)] ?? 0,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Ensure USD snapshot fields exist. If client didn't provide them,
    // compute them server-side using CoinGecko-backed ETH price.
    const ethPrice = await fetchEthPrice();

    const bodyWithUsd = { ...body } as any;

    if (body.listing_price !== undefined && body.listing_price_usd === undefined) {
      bodyWithUsd.listing_price_usd = Number((Number(body.listing_price) * ethPrice).toFixed(2));
    }
    if (body.start_bid !== undefined && body.start_bid_usd === undefined) {
      bodyWithUsd.start_bid_usd = Number((Number(body.start_bid) * ethPrice).toFixed(2));
    }
    if (body.reserve_price !== undefined && body.reserve_price_usd === undefined && body.reserve_price !== null) {
      bodyWithUsd.reserve_price_usd = Number((Number(body.reserve_price) * ethPrice).toFixed(2));
    }

    const { data, error } = await supabase
      .from('auctions')
      .insert([bodyWithUsd])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating auction:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
