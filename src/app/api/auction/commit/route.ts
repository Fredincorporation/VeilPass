import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { supabase } from '../../../../lib/supabase';

// NOTE: The EIP-712 domain below must match the client-side domain used when signing.
const EIP712_DOMAIN = {
  name: 'VeilPass Auction',
  version: '1',
  // chainId and verifyingContract are included for compatibility — set to values used by clients
  chainId: 1,
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

const COMMITMENT_TYPES = {
  Commitment: [
    { name: 'commitment', type: 'bytes32' },
    { name: 'auctionId', type: 'string' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiresAt', type: 'uint256' },
  ],
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auctionId, commitment, signature, nonce = 0, expiresAt = 0 } = body;
    if (!auctionId || !commitment || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const value = {
      commitment,
      auctionId: String(auctionId),
      nonce: Number(nonce),
      expiresAt: Number(expiresAt),
    };

    // recover signer
    let recovered: string;
    try {
      recovered = ethers.utils.verifyTypedData(EIP712_DOMAIN, COMMITMENT_TYPES, value, signature);
      recovered = recovered.toLowerCase();
    } catch (err) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // persist to DB
    const { data, error } = await supabase.from('auction_commitments').insert([
      {
        auction_id: auctionId,
        bidder_address: recovered,
        commitment,
        signature,
        nonce: value.nonce,
        expires_at: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
      },
    ]).select();

    if (error) {
      // unique constraint might exist
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
