'use client';

import React, { useState } from 'react';
import { Lock, Search, Clock, Users, Zap, ChevronRight } from 'lucide-react';

export default function AuctionsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const auctions = [
    {
      id: 1,
      title: 'Summer Music Fest - Front Row',
      encryptedBid: '****...',
      timeLeft: '2h 30m',
      bids: 12,
      minBid: 250,
    },
    {
      id: 2,
      title: 'Tech Conference - VIP Pass',
      encryptedBid: '****...',
      timeLeft: '5h 15m',
      bids: 8,
      minBid: 500,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Blind Auctions</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 ml-14">
            Bid securely on exclusive tickets with complete privacy
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search auctions by name..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Auction Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => {
            const timeProgress = 100 - Math.random() * 40;
            return (
              <div
                key={auction.id}
                className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2"
              >
                {/* Gradient Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-blue-500/10 rounded-full blur-2xl -z-10" />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {auction.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Encrypted Bid</span>
                      </div>
                    </div>
                  </div>

                  {/* Encrypted Bid Display */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-5 border border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-2 uppercase tracking-wide">Hidden Bid Amount</p>
                    <p className="font-mono text-lg text-gray-900 dark:text-white tracking-wider">{auction.encryptedBid}</p>
                  </div>

                  {/* Time Left */}
                  <div className="mb-5 pb-5 border-b-2 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time Left</span>
                      </div>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{auction.timeLeft}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full" style={{ width: `${timeProgress}%` }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total Bids</p>
                      </div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">{auction.bids}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Min Bid</p>
                      </div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">${auction.minBid}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 group/btn flex items-center justify-center gap-2">
                    Place Encrypted Bid
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {auctions.length === 0 && (
          <div className="text-center py-16">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No active auctions</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Check back soon for exclusive blind auctions</p>
          </div>
        )}
      </div>
    </div>
  );
}
