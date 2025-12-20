import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { supabase } from '../../../../lib/supabase';

// Reveal signature domain/types should match the client when signing the reveal
const EIP712_DOMAIN = {
  name: 'VeilPass Auction',
  version: '1',
  chainId: 1,
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

const REVEAL_TYPES = {
  Reveal: [
    { name: 'auctionId', type: 'string' },
    { name: 'bidAmount', type: 'uint256' },
    { name: 'secret', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
  ],
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auctionId, bidAmount, secret, nonce = 0, signature } = body;
    if (!auctionId || bidAmount == null || !secret || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const value = {
      auctionId: String(auctionId),
      bidAmount: String(bidAmount),
      secret,
      nonce: Number(nonce),
    };

    let recovered: string;
    try {
      recovered = ethers.utils.verifyTypedData(EIP712_DOMAIN, REVEAL_TYPES, value, signature).toLowerCase();
    } catch (err) {
      return NextResponse.json({ error: 'Invalid signature for reveal' }, { status: 400 });
    }

    // compute commitment from revealed data (client must have used same encoding)
    const computedCommitment = ethers.utils.solidityKeccak256(
      ['uint256', 'bytes32', 'uint256'],
      [ethers.BigNumber.from(bidAmount).toString(), secret, Number(nonce)],
    );

    // find stored commitment by auctionId and computed commitment
    const { data: existing, error: fetchErr } = await supabase
      .from('auction_commitments')
      .select('*')
      .eq('auction_id', auctionId)
      .eq('commitment', computedCommitment)
      .eq('bidder_address', recovered)
      .eq('revealed', false)
      .limit(1);

    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'No matching commitment found or already revealed' }, { status: 404 });
    }

    const commitId = existing[0].id;

    const { data: upd, error: updErr } = await supabase
      .from('auction_commitments')
      .update({ revealed: true, revealed_amount: bidAmount, reveal_secret: secret, reveal_tx_hash: null })
      .eq('id', commitId)
      .select();

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, revealed: upd }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
