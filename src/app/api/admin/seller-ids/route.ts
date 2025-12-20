import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import serverKeyManager from '@/lib/serverKeyManager';
import blacklistManager from '@/lib/blacklistManager';
import tfheEncryption from '@/lib/tfheEncryption';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * GET /api/admin/seller-ids
 * Fetch seller ID verification records - customers who applied to be sellers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    console.log('📋 Fetching seller ID applicants with status filter:', status);

    // Query users who are in 'awaiting_seller' role (applied to be sellers, awaiting review)
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'awaiting_seller'); // Only show awaiting_seller applicants

    // Filter by KYC status if provided
    if (status && status !== 'all') {
      query = query.eq('kyc_status', status);
    }

    const { data: sellerApplicants, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching seller ID applicants:', error);
      return NextResponse.json([]);
    }

    console.log('✅ Found', sellerApplicants?.length || 0, 'seller ID applicants');

    // Fetch any seller_ids records for these applicants so we can include encrypted hashes
    const walletAddresses = (sellerApplicants || []).map((a: any) => a.wallet_address).filter(Boolean);

    let sellerIdRows: any[] = [];
    if (walletAddresses.length > 0) {
      const { data: sRows, error: sError } = await supabase
        .from('seller_ids')
        .select('*')
        .in('wallet_address', walletAddresses);

      if (sError) {
        console.warn('Warning: could not fetch seller_ids rows:', sError);
      } else {
        sellerIdRows = sRows || [];
      }
    }

    // Map by wallet for quick lookup
    const sellerIdMap: Record<string, any> = {};
    for (const row of sellerIdRows) {
      if (row && row.wallet_address) sellerIdMap[row.wallet_address] = row;
    }

    // Transform to match expected format for ID verification
    const formattedSellers = [] as any[];

    for (const applicant of (sellerApplicants || [])) {
      const sellerRow = sellerIdMap[applicant.wallet_address] || null;

      // Attempt to decrypt encrypted_id for homomorphic verification (do NOT store raw)
      let verification: any = null;
      let encryptedIDVal: string | null = null;
      let verificationScore: number = 0;
      
      if (sellerRow && sellerRow.encrypted_id) {
        encryptedIDVal = sellerRow.encrypted_id;
        try {
          const plain = serverKeyManager.decryptBase64(encryptedIDVal || '');
          let parsed = null;
          try {
            parsed = JSON.parse(plain);
          } catch (e) {
            // Try manual parsing for relaxed object syntax
            try {
              const pairs = plain.trim().slice(1, -1).split(',');
              parsed = {} as any;
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

          // Create homomorphic payload
          const homomorphicPayload = tfheEncryption.createHomomorphicPayload(
            parsed.raw || '',
            parsed.claimedDob || '',
            parsed.claimedExpiresAt || ''
          );

          // Check blacklist
          const isBlacklisted = await blacklistManager.isBlacklisted(homomorphicPayload.deterministicHash);

          // Perform homomorphic verification
          const homomorphicResult = tfheEncryption.verifyHomomorphic(
            homomorphicPayload,
            isBlacklisted ? new Set([homomorphicPayload.deterministicHash]) : new Set()
          );

          // Compute verification score
          let score = 100;
          if (!homomorphicResult.ageVerified) score -= 30;
          if (!homomorphicResult.expirationVerified) score -= 30;
          if (!homomorphicResult.formatVerified) score -= 20;
          if (!homomorphicResult.blacklistVerified) score = 0;

          verificationScore = Math.max(0, score);
          verification = {
            verified:
              homomorphicResult.ageVerified &&
              homomorphicResult.expirationVerified &&
              homomorphicResult.formatVerified &&
              homomorphicResult.blacklistVerified,
            reasons: homomorphicResult.reasons,
            score: verificationScore,
            format: homomorphicPayload.claimedFormat,
            blacklisted: !homomorphicResult.blacklistVerified,
          };
        } catch (decErr) {
          verification = { verified: false, reasons: ['decryption_failed'] };
        }
      }

      formattedSellers.push({
        id: applicant.id,
        name: applicant.business_name || 'Unknown',
        email: applicant.email || 'N/A',
        status: applicant.kyc_status || 'PENDING',
        walletAddress: applicant.wallet_address,
        idDocument: applicant.id_document_url || null,
        encryptedID: encryptedIDVal,
        verification,
        submittedAt: applicant.created_at 
          ? new Date(applicant.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : 'N/A',
        businessType: applicant.business_type || 'Not specified',
        kycStatus: applicant.kyc_status || 'PENDING',
      });
    }

    return NextResponse.json(formattedSellers);
  } catch (error) {
    console.error('❌ Error in seller-ids GET:', error);
    return NextResponse.json([]);
  }
}

/**
 * PUT /api/admin/seller-ids/:id
 * Update seller ID verification status (KYC verification)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, verificationScore } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating seller KYC verification for:', id, 'Status:', status);

    // Update user's KYC status based on ID verification
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        kyc_status: status, // 'VERIFIED', 'REJECTED', 'PENDING'
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating seller KYC:', error);
      throw error;
    }

    console.log('✅ Seller KYC status updated:', updatedUser);

    // Send notification to the applicant about their KYC status
    try {
      if (status === 'VERIFIED') {
        await supabase
          .from('notifications')
          .insert({
            user_address: updatedUser.wallet_address,
            type: 'kyc_verified',
            title: 'ID Verification Approved',
            message: 'Your ID has been verified successfully. The admin will now review your seller application.',
          });
      } else if (status === 'REJECTED') {
        await supabase
          .from('notifications')
          .insert({
            user_address: updatedUser.wallet_address,
            type: 'kyc_rejected',
            title: 'ID Verification Rejected',
            message: 'Your ID verification was rejected. Please submit a clear, valid government ID.',
          });
      }
    } catch (notificationError) {
      console.error('Error creating KYC notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Seller ID verification status updated to ${status}`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('❌ Error in seller-ids PUT:', error);
    return NextResponse.json(
      { error: 'Failed to update seller ID verification' },
      { status: 500 }
    );
  }
}
