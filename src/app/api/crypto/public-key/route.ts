import { NextRequest, NextResponse } from 'next/server';
import serverKeyManager from '@/lib/serverKeyManager';
import { captureException } from '@/lib/logger';

export async function GET(_request: NextRequest) {
  try {
    const pub = serverKeyManager.getPublicKeyPEM();
    return NextResponse.json({ publicKey: pub });
  } catch (err) {
    captureException('Failed to return public key:', err);
    return NextResponse.json({ error: 'Failed to get public key' }, { status: 500 });
  }
}
