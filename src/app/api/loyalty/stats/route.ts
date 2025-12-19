import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Tier thresholds
const TIER_THRESHOLDS = {
  'Silver': { min: 0, max: 5000 },
  'Gold': { min: 5000, max: 10000 },
  'Platinum': { min: 10000, max: 25000 },
  'Diamond': { min: 25000, max: Infinity },
};

function getCurrentTierAndProgress(totalPoints: number) {
  let currentTier = 'Silver';
  let tierMin = 0;
  let tierMax = 5000;

  for (const [tier, thresholds] of Object.entries(TIER_THRESHOLDS)) {
    if (totalPoints >= thresholds.min && totalPoints < thresholds.max) {
      currentTier = tier;
      tierMin = thresholds.min;
      tierMax = thresholds.max;
      break;
    }
  }

  // If points exceed highest tier
  if (totalPoints >= 25000) {
    currentTier = 'Diamond';
    tierMin = 25000;
    tierMax = 50000; // Diamond tier goes up to 50k
  }

  const pointsInTier = totalPoints - tierMin;
  const tierRange = tierMax - tierMin;
  const percentage = Math.min((pointsInTier / tierRange) * 100, 100);

  return {
    tier: currentTier,
    current: pointsInTier,
    required: tierRange,
    percentage: Math.round(percentage),
  };
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

    // Get user data (total loyalty points)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('loyalty_points')
      .eq('wallet_address', address)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({
        pointsEarnedThisMonth: 0,
        referralCount: 0,
        currentTier: 'Silver',
        tierProgress: { current: 0, required: 5000, percentage: 0 },
      });
    }

    // Calculate points earned this month
    // Get current month start date
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartISO = monthStart.toISOString();
    
    // Query loyalty transactions for this month
    const { data: monthTransactions, error: txError } = await supabase
      .from('loyalty_transactions')
      .select('amount')
      .eq('user_address', address)
      .in('type', ['earned', 'referral']) // Only count earned and referral bonuses
      .gte('created_at', monthStartISO);

    let pointsEarnedThisMonth = 0;
    if (!txError && monthTransactions) {
      pointsEarnedThisMonth = monthTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    }

    // Get referral count from transactions
    const { data: referralTransactions, error: refError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_address', address)
      .eq('type', 'referral');

    const referralCount = refError ? 0 : (referralTransactions?.length || 0);

    // Get tier and progress
    const tierData = getCurrentTierAndProgress(user.loyalty_points);

    return NextResponse.json({
      pointsEarnedThisMonth,
      referralCount,
      currentTier: tierData.tier,
      tierProgress: {
        current: tierData.current,
        required: tierData.required,
        percentage: tierData.percentage,
      },
    });
  } catch (error) {
    console.error('Error in /api/loyalty/stats:', error);
    return NextResponse.json({
      pointsEarnedThisMonth: 0,
      referralCount: 0,
      currentTier: 'Silver',
      tierProgress: { current: 0, required: 5000, percentage: 0 },
    });
  }
}
