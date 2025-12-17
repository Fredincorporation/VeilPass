'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Zap, TrendingUp, Users, ChevronRight, History } from 'lucide-react';
import { getWalletRole } from '@/lib/wallet-roles';
import { useToast } from '@/components/ToastContainer';

export default function LoyaltyPage() {
  const router = useRouter();
  const { showSuccess, showWarning } = useToast();
  const [points] = useState(5450);
  const [isClient, setIsClient] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [redeemable] = useState([
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
  ]);

  useEffect(() => {
    setIsClient(true);
    const savedAccount = localStorage.getItem('veilpass_account');
    setAccount(savedAccount);

    if (savedAccount) {
      const role = getWalletRole(savedAccount);
      if (role !== 'customer') {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  if (!isClient || !account) return null;

  const handleRedeemReward = (reward: any) => {
    if (points >= reward.points) {
      showSuccess(`Successfully redeemed "${reward.title}"! Points will be applied to your account.`);
    } else {
      showWarning(`You need ${reward.points - points} more points to redeem this reward`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Points Hero */}
        <div className="mb-12 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm opacity-90 mb-2 uppercase tracking-wide font-semibold">Your Loyalty Points</p>
              <h1 className="text-6xl font-bold mb-2">{points.toLocaleString()}</h1>
              <p className="opacity-90 text-base">You're in the <span className="font-bold">GOLD TIER</span> - Earn 1.5x points on all purchases</p>
            </div>
            <div className="hidden sm:flex items-center justify-center w-20 h-20 bg-white/20 rounded-full">
              <Zap className="w-10 h-10" />
            </div>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 rounded-lg bg-white text-purple-600 font-semibold hover:bg-gray-100 transition">
              Share Referral Link
            </button>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Points Earned */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Points Earned</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">This month you've earned</p>
            <p className="text-3xl font-bold text-blue-600">1,245 pts</p>
          </div>

          {/* Referral Rewards */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-green-400 dark:hover:border-green-500 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Friend Referrals</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Friends who signed up</p>
            <p className="text-3xl font-bold text-green-600">12 friends</p>
          </div>

          {/* Tier Progress */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-yellow-400 dark:hover:border-yellow-500 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/50 transition-colors">
                <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Gold Tier Progress</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">Points to Platinum</p>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-2/3" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">7,500 / 10,000 pts</p>
          </div>
        </div>

        {/* Redeem Rewards */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Available Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {redeemable.map((reward) => {
              const canRedeem = reward.points <= points;
              return (
                <div
                  key={reward.id}
                  className={`group relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl p-6 border-2 transition-all duration-300 ${
                    canRedeem
                      ? 'border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-xl hover:scale-[1.02]'
                      : 'border-gray-200 dark:border-gray-800 opacity-60'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                        <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                        canRedeem
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {canRedeem ? 'Available' : 'Locked'}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{reward.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{reward.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{reward.points} pts</span>
                      <button
                        onClick={() => handleRedeemReward(reward)}
                        disabled={!canRedeem}
                        className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                          canRedeem
                            ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        Redeem
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {[
                { type: 'Earned', description: 'Purchased ticket to "Summer Music Festival"', points: '+250', date: '2 days ago' },
                { type: 'Redeemed', description: 'Redeemed 500 points for Event Discount', points: '-500', date: '1 week ago' },
                { type: 'Referral Bonus', description: 'Friend Jessica signed up with your code', points: '+200', date: '2 weeks ago' },
                { type: 'Earned', description: 'Purchased ticket to "Comedy Night"', points: '+175', date: '3 weeks ago' },
              ].map((activity, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{activity.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      activity.points.startsWith('+')
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {activity.points}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
