'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, QrCode, Download, Share2, Calendar, MapPin, Users, Search, TrendingUp, X, DollarSign, Gavel, Clock, Flame } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useEthPrice } from '@/hooks/useEthPrice';
import { useTickets } from '@/hooks/useTickets';
import { useAuctions } from '@/hooks/useAuctions';
import { useActiveBids, getHighestBid, isUserWinning } from '@/hooks/useUserBids';
import { getTicketStatusColor, getTicketStatusDisplay } from '@/lib/ticketStatusUtils';
import { useSafeWallet } from '@/lib/wallet-context';
import QRCode from 'qrcode.react';
import { encryptTicketQR, createQRPayload } from '@/lib/ticketQREncryption';

export default function TicketsPage() {
  const { showSuccess, showInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [auctionForm, setAuctionForm] = useState({ listingPrice: '', minBid: '', reservePrice: '', duration: 24 });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const wallet = useSafeWallet();

  // Fetch user's tickets from database
  const { data: dbTickets = [], isLoading } = useTickets(account || '');

  // Fetch user's active bids
  const { data: activeBids = [], isLoading: bidsLoading } = useActiveBids(account || '');
  // Get current ETH price for USD conversions
  const { price: ethPrice = 0 } = useEthPrice();

  useEffect(() => {
    // Prefer connected wallet from provider, fallback to localStorage
    const connectedAccount = wallet?.address ?? localStorage.getItem('veilpass_account');
    setAccount(connectedAccount);
  }, [wallet?.address]);

  // Use only database tickets - no mock data fallback
  const tickets: any[] = dbTickets;

  // Fetch active auctions to determine which tickets are already listed
  const { data: activeAuctions = [] } = useAuctions('active');
  const activeAuctionTicketIds = new Set((activeAuctions || []).map((a: any) => a.ticket_id));

  const filteredTickets = tickets.filter((ticket: any) =>
    (ticket.id && ticket.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (ticket.section && ticket.section.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleShowQR = (ticketId: string, ticket: any) => {
    // QR code will encode the ticket ID, event ID, and owner address for verification
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  const handleDownloadTicket = (ticketId: string, eventName: string) => {
    showSuccess(`Ticket for "${eventName}" downloaded successfully`);
  };

  const handleShareTicket = (ticketId: string, eventName: string) => {
    showSuccess(`"${eventName}" ticket link copied to clipboard`);
  };

  const handleBidAuction = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowAuctionModal(true);
  };

  const handleSubmitAuction = async () => {
    if (!auctionForm.listingPrice || !auctionForm.minBid) {
      showInfo('Please fill in all required fields');
      return;
    }

    if (!selectedTicket || !account) {
      showInfo('Missing ticket or account information');
      return;
    }

    try {
      const startBidEth = parseFloat(auctionForm.minBid);
      const listingPriceEth = parseFloat(auctionForm.listingPrice);
      const reservePriceEth = auctionForm.reservePrice ? parseFloat(auctionForm.reservePrice) : null;

      if (isNaN(startBidEth) || isNaN(listingPriceEth)) {
        showInfo('Please enter valid numbers for prices (in ETH)');
        return;
      }

      // Calculate end time based on duration
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + auctionForm.duration);

      // Create auction in database
      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          seller_address: account,
          // Store ETH values in the DB
          start_bid: startBidEth,
          listing_price: listingPriceEth,
          reserve_price: reservePriceEth,
          duration_hours: auctionForm.duration,
          end_time: endTime.toISOString(),
          status: 'active',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        showInfo(`Failed to list auction: ${error.error}`);
        return;
      }

      const auction = await response.json();

      // Show ETH and approximate USD value
      const startBidUsd = (startBidEth * ethPrice).toFixed(2);
      showSuccess(`✓ Ticket listed for ${auctionForm.duration}h auction! Starting bid: ${startBidEth} ETH (≈ $${startBidUsd})`);
      setShowAuctionModal(false);
      setAuctionForm({ listingPrice: '', minBid: '', reservePrice: '', duration: 24 });

      // Refresh page or refetch auctions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error creating auction:', error);
      showInfo('Failed to create auction. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header with Icon */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Tickets</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">View and manage your event tickets</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event name or ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Gradient Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative p-6">
                  {/* Header with Status */}
                  <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{ticket.event_title || `Event #${ticket.event_id}`}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Ticket className="w-4 h-4" />
                        <span className="font-mono">{ticket.id}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full font-semibold text-sm transition-colors ${getTicketStatusColor(ticket.status)}`}>
                      {getTicketStatusDisplay(ticket.status).icon} {getTicketStatusDisplay(ticket.status).text}
                    </span>
                  </div>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-cyan-500 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Date</p>
                        <p className="font-bold text-gray-900 dark:text-white">{ticket.date}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-cyan-500 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Location</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{ticket.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-cyan-500 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Section</p>
                        <p className="font-bold text-gray-900 dark:text-white">{ticket.section}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Price</p>
                      <p className="font-bold text-lg text-cyan-600 dark:text-cyan-400">${ticket.price}</p>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Your QR Code</p>
                    <button 
                      onClick={() => handleShowQR(ticket.id, ticket)}
                      className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-cyan-400/50 transition hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="text-center cursor-pointer">
                        <QrCode className="w-20 h-20 text-cyan-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-500">Click to view QR code</p>
                      </div>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleDownloadTicket(ticket.id, ticket.event_title || `Event #${ticket.event_id}`)}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 group/btn">
                        <Download className="w-4 h-4" />
                        Download
                        <span className="absolute opacity-0 group-hover/btn:opacity-100 transition">→</span>
                      </button>
                      <button 
                        onClick={() => handleShareTicket(ticket.id, ticket.event_title || `Event #${ticket.event_id}`)}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-cyan-400 dark:hover:border-cyan-500 text-gray-900 dark:text-white font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>

                    {ticket.status !== 'active' && (
                      !activeAuctionTicketIds.has(ticket.id) ? (
                        <button 
                          onClick={() => handleBidAuction(ticket)}
                          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 group/auction">
                          <TrendingUp className="w-4 h-4" />
                          List for Auction
                          <span className="absolute opacity-0 group-hover/auction:opacity-100 transition">→</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 text-gray-500 bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                        >
                          <TrendingUp className="w-4 h-4" />
                          Already Listed
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4">
              <Ticket className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No tickets found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your search or browse events to purchase tickets</p>
          </div>
        )}

        {/* My Active Bids Section */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
              <Gavel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Active Bids</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Auctions you're bidding on</p>
            </div>
          </div>

          {activeBids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBids.map((bid) => {
                const timeRemaining = new Date(bid.end_time).getTime() - new Date().getTime();
                const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const isWinning = isUserWinning(account || '', activeBids, bid.auction_id);

                return (
                  <div
                    key={bid.id}
                    className="group relative bg-white dark:bg-gray-900 rounded-xl border-2 border-amber-200 dark:border-amber-900/50 overflow-hidden hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Winning Badge */}
                    {isWinning && (
                      <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-green-500/90 text-white text-xs font-semibold flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Winning
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Auction #{bid.auction_id}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Ticket: {bid.ticket_id?.slice(0, 8)}...
                        </p>
                      </div>

                      {/* Bid Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Your Bid</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{bid.amount} ETH (≈ ${((bid.amount || 0) * ethPrice).toFixed(2)})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Starting Bid</span>
                          <span className="text-sm text-gray-900 dark:text-white">{bid.start_bid} ETH (≈ ${((bid.start_bid || 0) * ethPrice).toFixed(2)})</span>
                        </div>
                        {bid.reserve_price && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Reserve Price</span>
                            <span className="text-sm text-gray-900 dark:text-white">{bid.reserve_price} ETH (≈ ${((bid.reserve_price || 0) * ethPrice).toFixed(2)})</span>
                          </div>
                        )}
                      </div>

                      {/* Time Remaining */}
                      <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                          {hoursLeft}h {minutesLeft}m remaining
                        </span>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => window.location.href = '/auctions'}
                        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold transition-all duration-300"
                      >
                        View Auction
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 mb-3">
                <Gavel className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">No active bids</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Start bidding on auctions to see them here</p>
              <button
                onClick={() => window.location.href = '/auctions'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors"
              >
                <Gavel className="w-4 h-4" />
                Browse Auctions
              </button>
            </div>
          )}
        </div>

        {/* Auction Modal */}
        {showAuctionModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">List for Auction</h2>
                <button
                  onClick={() => setShowAuctionModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Ticket Info */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Event</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedTicket.event_title || `Event #${selectedTicket.event_id}`}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Original Price: <span className="font-semibold text-cyan-600 dark:text-cyan-400">{selectedTicket.price} ETH (≈ ${((selectedTicket.price || 0) * ethPrice).toFixed(2)} )</span></p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Listing Price */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Listing Price (ETH)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 w-4 h-4 text-gray-400">Ξ</span>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="0.25"
                        value={auctionForm.listingPrice}
                        onChange={(e) => setAuctionForm({ ...auctionForm, listingPrice: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">≈ ${((parseFloat(auctionForm.listingPrice || '0') || 0) * ethPrice).toFixed(2)} USD</p>
                  </div>

                  {/* Minimum Bid */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Starting Bid (ETH)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 w-4 h-4 text-gray-400">Ξ</span>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="0.05"
                        value={auctionForm.minBid}
                        onChange={(e) => setAuctionForm({ ...auctionForm, minBid: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">≈ ${((parseFloat(auctionForm.minBid || '0') || 0) * ethPrice).toFixed(2)} USD</p>
                  </div>

                  {/* Reserve Price */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Reserve Price (ETH) <span className="text-xs text-gray-500">Optional</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 w-4 h-4 text-gray-400">Ξ</span>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="Optional"
                        value={auctionForm.reservePrice}
                        onChange={(e) => setAuctionForm({ ...auctionForm, reservePrice: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{auctionForm.reservePrice ? `≈ $${((parseFloat(auctionForm.reservePrice || '0') || 0) * ethPrice).toFixed(2)} USD` : 'Optional'}</p>
                  </div>

                  {/* Auction Duration */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">Auction Duration</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setAuctionForm({ ...auctionForm, duration: 24 })}
                        className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                          auctionForm.duration === 24
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-600'
                        }`}
                      >
                        <div className="text-lg">24hrs</div>
                        <div className="text-xs opacity-75">1 day</div>
                      </button>
                      <button
                        onClick={() => setAuctionForm({ ...auctionForm, duration: 48 })}
                        className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                          auctionForm.duration === 48
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-600'
                        }`}
                      >
                        <div className="text-lg">48hrs</div>
                        <div className="text-xs opacity-75">2 days</div>
                      </button>
                      <button
                        onClick={() => setAuctionForm({ ...auctionForm, duration: 72 })}
                        className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                          auctionForm.duration === 72
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-600'
                        }`}
                      >
                        <div className="text-lg">72hrs</div>
                        <div className="text-xs opacity-75">3 days</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">💡 Tip: Set a starting bid lower than your listing price to attract more bidders.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowAuctionModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAuction}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold transition"
                >
                  List for Auction
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8 border-2 border-gray-200 dark:border-gray-800 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket QR Code</h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Ticket Information */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">EVENT</p>
                <p className="font-bold text-gray-900 dark:text-white mb-3">{selectedTicket.event_title || `Event #${selectedTicket.event_id}`}</p>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">TICKET ID</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white mb-3">{selectedTicket.id.slice(0, 16)}...</p>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">PRICE</p>
                <p className="font-bold text-cyan-600 dark:text-cyan-400">{selectedTicket.price} ETH</p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg mb-6 flex justify-center">
                {selectedTicket && (
                  <QRCode
                    value={createQRPayload(
                      encryptTicketQR({
                        ticketId: selectedTicket.id,
                        eventId: selectedTicket.event_id,
                        owner: selectedTicket.owner_address,
                        price: selectedTicket.price,
                        created_at: selectedTicket.created_at,
                        section: selectedTicket.section,
                        status: selectedTicket.status,
                      })
                    )}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  📱 <strong>Show this QR code at the event entrance to verify your ticket</strong>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const qrElement = document.querySelector('canvas');
                    if (qrElement) {
                      const link = document.createElement('a');
                      link.href = qrElement.toDataURL();
                      link.download = `ticket-${selectedTicket.id.slice(0, 8)}.png`;
                      link.click();
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  Save QR Code
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
