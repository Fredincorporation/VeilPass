import { NextResponse } from 'next/server';
import { recoverAddress } from 'ethers';
import { _TypedDataEncoder } from '@ethersproject/hash';

// Debug endpoint: POST a JSON body { domain, types, message, signature, expected }
// Returns: { hash, recovered, matchesExpected }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, types, message, signature, expected } = body || {};

    if (!domain || !types || !message || !signature) {
      return NextResponse.json({ error: 'Missing required fields: domain, types, message, signature' }, { status: 400 });
    }

    // Normalize chainId if provided as hex string
    if (domain.chainId && typeof domain.chainId === 'string' && domain.chainId.startsWith('0x')) {
      try {
        // convert hex string (e.g. '0x1') to number
        // keep numeric value for _TypedDataEncoder
        // eslint-disable-next-line no-param-reassign
        // @ts-ignore
        domain.chainId = Number.parseInt(domain.chainId, 16);
      } catch (e) {
        // ignore parse error and let encoder fail
      }
    }

    // Compute typed-data hash
    let hash: string;
    try {
      hash = _TypedDataEncoder.hash(domain, types, message);
    } catch (err: any) {
      return NextResponse.json({ error: 'Failed to hash typed data', details: String(err?.message || err) }, { status: 400 });
    }

    // Recover address from signature
    let recovered: string;
    try {
      recovered = recoverAddress(hash, signature).toLowerCase();
    } catch (err: any) {
      return NextResponse.json({ error: 'Failed to recover address from signature', details: String(err?.message || err) }, { status: 400 });
    }

    const matchesExpected = typeof expected !== 'undefined' ? (String(expected).toLowerCase() === recovered) : null;

    return NextResponse.json({ hash, recovered, matchesExpected }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
