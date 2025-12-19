import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface LoyaltyActivity {
  type: 'Earned' | 'Redeemed' | 'Referral Bonus' | 'Adjustment';
  description: string;
  points: number;
  date: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Fetch loyalty transactions from the database
    const { data: transactions, error: txError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_address', address)
      .order('created_at', { ascending: false })
      .limit(20);

    if (txError) {
      console.error('Error fetching loyalty transactions:', txError);
      return NextResponse.json([]);
    }

    // Transform transactions to activity format
    const activities: LoyaltyActivity[] = (transactions || []).map((tx: any) => {
      // Map transaction type to display type
      let displayType = 'Earned';
      if (tx.type === 'redeemed') displayType = 'Redeemed';
      if (tx.type === 'referral') displayType = 'Referral Bonus';
      if (tx.type === 'adjustment') displayType = 'Adjustment';

      return {
        type: displayType as any,
        description: tx.description,
        points: tx.amount,
        date: new Date(tx.created_at).toLocaleDateString(),
      };
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error in /api/loyalty/activity:', error);
    return NextResponse.json([]);
  }
}
