'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Search, Clock, Users, Zap, ChevronRight, X, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useAuctions } from '@/hooks/useAuctions';
import { useEthPrice } from '@/hooks/useEthPrice';
import { formatCurrencyPair } from '@/lib/currency-utils';
import { computeTimeLeft } from '@/lib/auctionCountdown';
import { useSafeWallet as useWallet } from '@/lib/wallet-context';
import { signBid, BidSignaturePayload } from '@/lib/bidSignature';
import { getMinimumNextBid, formatBidIncrementInfo, validateBidIncrement } from '@/lib/bidConfig';

export default function AuctionsPage() {
  const { showSuccess, showInfo } = useToast();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [timeState, setTimeState] = useState<{[key: number]: {timeLeft: string; progress: number}}>({});
  const [account, setAccount] = useState<string | null>(null);
  const wallet = useWallet();

  // Fetch auctions from database
  const { data: dbAuctions = [], isLoading } = useAuctions(activeFilter === 'all' ? undefined : activeFilter);

  // Use only database auctions - no mock data fallback
  const auctions: any[] = dbAuctions;

  const { price: ethPrice } = useEthPrice();

  useEffect(() => {
    // Prefer connected wallet from WalletProvider, fall back to localStorage
    const connected = wallet?.address ?? localStorage.getItem('veilpass_account');
    setAccount(connected);

    // Updates countdowns and progress bars for visible auctions every second.
    const updateTimers = () => {
      const now = Date.now();
      const newTimeState: {[key: number]: {timeLeft: string; progress: number}} = {};

      auctions.forEach((auction) => {
        const endRaw = auction.end_time ?? auction.endTime ?? auction.end;
        const createdRaw = auction.created_at ?? auction.createdAt ?? null;
        const durationHours = auction.duration_hours ?? auction.durationHours ?? auction.duration ?? null;

        const result = computeTimeLeft(endRaw, createdRaw, durationHours);
        newTimeState[auction.id] = result;
      });

      setTimeState(newTimeState);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000); // Update every second
    return () => clearInterval(interval);
  }, [auctions]);

  // Keep account in sync with the WalletProvider address
  useEffect(() => {
    if (wallet?.address) setAccount(wallet.address);
  }, [wallet?.address]);

  const handlePlaceBid = (auction: any) => {
    setSelectedAuction(auction);
    setBidAmount('');
    setShowBidModal(true);
  };

  const handleSubmitBid = () => {
    if (!bidAmount) {
      showInfo('Please enter a bid amount');
      return;
    }

    // Interpret user-entered bid amount as ETH
    const bidEth = Number(bidAmount);
    if (isNaN(bidEth) || bidEth <= 0) {
      showInfo('Enter a valid ETH amount');
      return;
    }

    // Determine minimum in ETH. If there's a current highest bid, require bids exceed it.
    const legacyMin = selectedAuction.listing_price ?? selectedAuction.start_bid ?? (
      selectedAuction.minBid && ethPrice ? Number((Number(selectedAuction.minBid) / ethPrice).toFixed(8)) : 0
    );
    const currentHighestEth = selectedAuction.current_highest ?? null;
    const minEth = currentHighestEth ? Math.max(Number(currentHighestEth), legacyMin) : legacyMin;

    // Validate bid using the tiered increment system
    const incrementValidation = validateBidIncrement(bidEth, minEth);
    if (!incrementValidation.valid) {
      const nextMinBid = getMinimumNextBid(minEth);
      showInfo(`Bid must be at least ${nextMinBid.toFixed(6)} ETH. ${formatBidIncrementInfo(minEth)}`);
      return;
    }

    const usdApprox = ethPrice ? `$${(bidEth * ethPrice).toFixed(2)}` : '≈ $--';

    // Post the bid to the server
    (async () => {
      try {
        if (!account) {
          showInfo('Connect your wallet or set your account before bidding');
          return;
        }

        // Create bid signature payload
        const bidSignatureData: BidSignaturePayload = {
          auction_id: selectedAuction.id,
          bidder_address: account,
          amount: bidEth,
          amount_usd: typeof ethPrice === 'number' && !Number.isNaN(ethPrice) ? Number((bidEth * ethPrice).toFixed(2)) : undefined,
          encrypted: true,
          timestamp: Math.floor(Date.now() / 1000),
        };

        // Sign the bid (for now, returns a mock signature; integrate with real wallet provider)
        const signature = await signBid(bidSignatureData, account);

        const payload: any = {
          ...bidSignatureData,
          signature, // Include the signature in the payload
        };

        const resp = await fetch('/api/bids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const err = await resp.json();
          // Show detailed error from RPC if available
          if (err?.minimumRequired && err?.currentHighest !== undefined) {
            showInfo(`Bid rejected: ${err?.error}\nCurrent highest: ${err.currentHighest?.toFixed(6) || 'N/A'} ETH\nMinimum required: ${err.minimumRequired?.toFixed(6) || 'N/A'} ETH`);
          } else {
            showInfo(`Failed to place bid: ${err?.error || resp.statusText}`);
          }
          return;
        }

        showSuccess(`Encrypted bid of ${bidEth} ETH (${usdApprox}) placed on "${selectedAuction?.title ?? selectedAuction?.ticket_id ?? `#${selectedAuction?.id}`}"!`);
        setShowBidModal(false);
        setBidAmount('');
      } catch (err: any) {
        console.error('Error placing bid:', err);
        showInfo('Failed to place bid. Try again.');
      }
    })();
  };

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
            const time = timeState[auction.id] || { timeLeft: 'Loading...', progress: 0 };
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
                                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          <div>Item: {auction.ticket_id ? `${String(auction.ticket_id).slice(0,8)}...` : `#${auction.id}`}</div>
                          {auction.event_title && <div>Event: {auction.event_title}</div>}
                          {auction.ticket_section && <div>Section: {auction.ticket_section}</div>}
                        </div>
                  </div>

                  {/* Time Left */}
                  <div className="mb-5 pb-5 border-b-2 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time Left</span>
                      </div>
                      {/* Announce time left updates and provide exact end timestamp on hover */}
                      {(() => {
                        const endRaw = auction.end_time ?? auction.endTime ?? auction.end;
                        const endDate = endRaw ? new Date(endRaw) : null;
                        return (
                          <span
                            className="text-sm font-bold text-red-600 dark:text-red-400"
                            title={endDate ? endDate.toLocaleString() : undefined}
                            aria-live="polite"
                          >
                            {time.timeLeft}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                        style={{ width: `${time.progress}%`, transition: 'width 1000ms linear' }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total Bids</p>
                      </div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">{auction.bid_count ?? 0}</p>
                    </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Min Bid</p>
                      </div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {(() => {
                          // Use current highest if available, otherwise use starting bid
                          const minEth = auction.current_highest ?? auction.listing_price ?? auction.start_bid ?? (auction.minBid && ethPrice ? Number((Number(auction.minBid) / ethPrice).toFixed(6)) : null);
                          if (minEth !== null && minEth !== undefined) {
                            return formatCurrencyPair(Number(minEth));
                          }
                          // Fallback to showing legacy USD value
                          return `$${auction.minBid ?? '—'}`;
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button onClick={() => handlePlaceBid(auction)} className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 group/btn flex items-center justify-center gap-2">
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

        {/* Bid Modal */}
        {showBidModal && selectedAuction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Place Encrypted Bid</h2>
                <button
                  onClick={() => setShowBidModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Auction Info */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 space-y-2 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Auction</p>
                  <p className="font-bold text-gray-900 dark:text-white line-clamp-2">{selectedAuction.title ?? selectedAuction.event_title ?? (selectedAuction.ticket_id ? `Ticket ${String(selectedAuction.ticket_id).slice(0,8)}...` : `Auction #${selectedAuction.id}`)}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
                    <div>
                      {selectedAuction.event_title && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">Event: <span className="font-semibold text-gray-900 dark:text-white">{selectedAuction.event_title}</span></p>
                      )}
                      {selectedAuction.ticket_section && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">Section: <span className="font-semibold text-gray-900 dark:text-white">{selectedAuction.ticket_section}</span></p>
                      )}
                      <p className="text-xs text-gray-600 dark:text-gray-400">Minimum Bid</p>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">
                        {(() => {
                          const minEth = selectedAuction.current_highest ?? selectedAuction.listing_price ?? selectedAuction.start_bid ?? (selectedAuction.minBid && ethPrice ? Number((Number(selectedAuction.minBid) / ethPrice).toFixed(6)) : null);
                          if (minEth !== null && minEth !== undefined) {
                            return formatCurrencyPair(Number(minEth));
                          }
                          return `$${selectedAuction.minBid ?? '—'}`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Current Bids</p>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{selectedAuction.bid_count ?? 0}</p>
                    </div>
                  </div>
                </div>

                {/* Bid Amount Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Your Bid Amount (ETH)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder={`e.g. ${selectedAuction.listing_price ?? ''}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Enter your bid in ETH. USD equivalent shown in toast after placing.</p>
                </div>

                {/* Security Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-2">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">All bids are encrypted and hidden from other bidders until auction ends</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBid}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold transition"
                >
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
