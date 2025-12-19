import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface RedeemableItem {
  id: number;
  title: string;
  points: number;
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch redeemable items from database
    // For now, returning hardcoded redeemables as a fallback
    // In production, you'd store these in a database table
    
    const redeemables: RedeemableItem[] = [
      {
        id: 1,
        title: 'Event Discount (10%)',
        points: 500,
        description: 'Get 10% off on next ticket purchase',
      },
      {
        id: 2,
        title: 'VIP Upgrade',
        points: 1000,
        description: 'Upgrade to VIP seating for any event',
      },
      {
        id: 3,
        title: '$25 Credit',
        points: 2500,
        description: 'Get $25 credit on your account',
      },
      {
        id: 4,
        title: 'Free Event Ticket',
        points: 5000,
        description: 'Redeem for one free event ticket',
      },
      {
        id: 5,
        title: 'Double Points Month',
        points: 7500,
        description: 'Earn 2x points on all purchases for 30 days',
      },
    ];

    return NextResponse.json(redeemables);
  } catch (error) {
    console.error('Error in /api/loyalty/redeemables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redeemables' },
      { status: 500 }
    );
  }
}
