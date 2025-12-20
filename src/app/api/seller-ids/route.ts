import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import serverKeyManager from '@/lib/serverKeyManager';
import blacklistManager from '@/lib/blacklistManager';
import tfheEncryption from '@/lib/tfheEncryption';

/**
 * POST /api/seller-ids
 * Accepts { wallet_address, name, business_type, encrypted_id, id_type, location }
 * Inserts or updates the seller_ids table with the encrypted id hash and metadata
 */
export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (parseErr) {
      console.error('Error parsing request JSON:', parseErr);
      return NextResponse.json({ error: 'Invalid JSON', detail: String(parseErr) }, { status: 400 });
    }
    const { wallet_address, name, business_type, encrypted_id, id_type, location } = body;

    if (!wallet_address || !encrypted_id) {
      return NextResponse.json({ error: 'wallet_address and encrypted_id are required' }, { status: 400 });
    }

    // Attempt to fetch user's email from users table to satisfy NOT NULL constraints
    let userEmail: string | null = null;
    let userBusinessName: string | null = null;
    try {
      const { data: u, error: uErr } = await supabase
        .from('users')
        .select('email,business_name')
        .eq('wallet_address', wallet_address)
        .limit(1)
        .single();
      if (!uErr && u) {
        if (u.email) userEmail = u.email;
        if (u.business_name) userBusinessName = u.business_name;
      }
    } catch (uErr) {
      // ignore
    }

    // Check if row exists for this wallet
    const { data: existing, error: fetchErr } = await supabase
      .from('seller_ids')
      .select('*')
      .eq('wallet_address', wallet_address)
      .limit(1)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.warn('Warning fetching existing seller_id row:', fetchErr);
    }

    if (existing) {
      const { data: updated, error: updErr } = await supabase
        .from('seller_ids')
        .update({
          name: name || existing.name,
          business_type: business_type || existing.business_type,
          encrypted_id,
          id_type: id_type || existing.id_type,
          location: location || existing.location,
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', wallet_address)
        .select()
        .single();

      if (updErr) {
        console.error('Error updating seller_ids row:', updErr);
        return NextResponse.json({ error: 'Failed to update seller_ids' }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: updated });
    }


    // Insert new row (ensure email is set to empty string if missing to satisfy NOT NULL)
    const insertPayload: any = {
      wallet_address,
      // name is NOT NULL in schema, prefer provided name, then user's business_name, else empty string
      name: name || userBusinessName || '',
      business_type: business_type || null,
      encrypted_id,
      id_type: id_type || null,
      location: location || null,
      email: userEmail || '',
    };

    const { data, error } = await supabase
      .from('seller_ids')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Error inserting seller_ids row:', error);
      // Return Supabase error detail for debugging
      return NextResponse.json({ error: 'Failed to insert seller_ids', detail: error }, { status: 500 });
    }

    // Attempt in-memory decryption and lightweight verification (do NOT store raw data)
    let verification: any = { verified: false, reasons: [], scores: {} };
    try {
      if (encrypted_id) {
        try {
          const plain = serverKeyManager.decryptBase64(encrypted_id);
          // Expect JSON payload { raw: base64string, claimedDob?: 'YYYY-MM-DD', claimedExpiresAt?: 'YYYY-MM-DD' }
          let parsed: any = null;
          try {
            parsed = JSON.parse(plain);
          } catch (e) {
            // Try manual parsing for relaxed object syntax (handles unquoted keys and date values)
            try {
              const pairs = plain.trim().slice(1, -1).split(',');
              parsed = {};
              for (const pair of pairs) {
                const colonIdx = pair.indexOf(':');
                if (colonIdx > 0) {
                  const k = pair.substring(0, colonIdx).trim();
                  const v = pair.substring(colonIdx + 1).trim();
                  parsed[k] = v;
                }
              }
            } catch (e2) {
              parsed = { raw: plain };
            }
          }

          // Create homomorphic payload for verification (without storing raw data)
          const homomorphicPayload = tfheEncryption.createHomomorphicPayload(
            parsed.raw || '',
            parsed.claimedDob || '',
            parsed.claimedExpiresAt || ''
          );

          // Check deterministic hash against blacklist (no decryption needed)
          const isBlacklisted = await blacklistManager.isBlacklisted(homomorphicPayload.deterministicHash);

          // Perform homomorphic verification on metadata
          const homomorphicResult = tfheEncryption.verifyHomomorphic(
            homomorphicPayload,
            isBlacklisted ? new Set([homomorphicPayload.deterministicHash]) : new Set()
          );

          // Compute verification score (0-100)
          let score = 100;
          if (!homomorphicResult.ageVerified) score -= 30;
          if (!homomorphicResult.expirationVerified) score -= 30;
          if (!homomorphicResult.formatVerified) score -= 20;
          if (!homomorphicResult.blacklistVerified) score = 0; // Blacklisted = instant fail

          verification = {
            verified:
              homomorphicResult.ageVerified &&
              homomorphicResult.expirationVerified &&
              homomorphicResult.formatVerified &&
              homomorphicResult.blacklistVerified,
            reasons: homomorphicResult.reasons,
            scores: {
              age: homomorphicResult.ageVerified ? 30 : 0,
              expiration: homomorphicResult.expirationVerified ? 30 : 0,
              format: homomorphicResult.formatVerified ? 20 : 0,
              blacklist: homomorphicResult.blacklistVerified ? 20 : 0,
            },
            verificationScore: Math.max(0, score),
            deterministicHash: homomorphicPayload.deterministicHash,
            format: homomorphicPayload.claimedFormat,
          };

          // Log verification attempt (for compliance)
          try {
            await supabase.from('id_verification_log').insert({
              wallet_address,
              deterministic_hash: homomorphicPayload.deterministicHash,
              verification_result: verification,
              verified: verification.verified,
            });
          } catch (logErr) {
            console.warn('Warning: could not log verification:', logErr);
          }
        } catch (decErrInner: any) {
          console.warn('Could not decrypt/verify encrypted_id in-memory:', decErrInner);
          verification.reasons.push('decryption_failed:' + String(decErrInner?.message || decErrInner));
        }
      }
    } catch (decErr) {
      console.warn('Could not decrypt/verify encrypted_id in-memory:', decErr);
      verification.reasons.push('decryption_failed');
    }

    return NextResponse.json({ success: true, data, verification });
  } catch (error: any) {
    console.error('Error in seller-ids POST:', error);
    return NextResponse.json({ error: 'Server error', detail: String(error?.message || error) }, { status: 500 });
  }
}
