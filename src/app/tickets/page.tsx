'use client';

import React, { useState } from 'react';
import { Ticket, QrCode, Download, Share2, Calendar, MapPin, Users, Search, TrendingUp, X, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function TicketsPage() {
  const { showSuccess, showInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [auctionForm, setAuctionForm] = useState({ listingPrice: '', minBid: '', reservePrice: '', duration: 24 });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [tickets] = useState([
    {
      id: 'TK001',
      event: 'Summer Music Fest',
      date: 'Jun 15, 2025',
      section: 'A10',
      price: 285,
      status: 'active',
      location: 'Central Park, NYC',
      capacity: 'VIP Section - 500 seats',
    },
    {
      id: 'TK002',
      event: 'Comedy Night',
      date: 'Jul 22, 2025',
      section: 'B5',
      price: 150,
      status: 'active',
      location: 'Theatre District, NYC',
      capacity: 'Standard - Unlimited',
    },
    {
      id: 'TK003',
      event: 'Art Expo 2025',
      date: 'Aug 10, 2025',
      section: 'General',
      price: 45,
      status: 'upcoming',
      location: 'Museum of Modern Art',
      capacity: 'General Admission',
    },
  ]);

  const filteredTickets = tickets.filter(ticket =>
    ticket.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowQR = (ticketId: string) => {
    showInfo(`Displaying QR code for ticket ${ticketId}`);
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

  const handleSubmitAuction = () => {
    if (!auctionForm.listingPrice || !auctionForm.minBid) {
      showInfo('Please fill in all required fields');
      return;
    }
    showSuccess(`"${selectedTicket.event}" listed for ${auctionForm.duration}h auction starting at $${auctionForm.minBid}!`);
    setShowAuctionModal(false);
    setAuctionForm({ listingPrice: '', minBid: '', reservePrice: '', duration: 24 });
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
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{ticket.event}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Ticket className="w-4 h-4" />
                        <span className="font-mono">{ticket.id}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full font-semibold text-sm transition-colors ${
                      ticket.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {ticket.status === 'active' ? '✓ Active' : '⏰ Upcoming'}
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
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-cyan-400/50 transition">
                      <div className="text-center">
                        <QrCode className="w-28 h-28 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-500">QR Code for entry</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleDownloadTicket(ticket.id, ticket.event)}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 group/btn">
                        <Download className="w-4 h-4" />
                        Download
                        <span className="absolute opacity-0 group-hover/btn:opacity-100 transition">→</span>
                      </button>
                      <button 
                        onClick={() => handleShareTicket(ticket.id, ticket.event)}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-cyan-400 dark:hover:border-cyan-500 text-gray-900 dark:text-white font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>

                    {ticket.status !== 'active' && (
                      <button 
                        onClick={() => handleBidAuction(ticket)}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 group/auction">
                        <TrendingUp className="w-4 h-4" />
                        List for Auction
                        <span className="absolute opacity-0 group-hover/auction:opacity-100 transition">→</span>
                      </button>
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
                  <p className="font-bold text-gray-900 dark:text-white">{selectedTicket.event}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Original Price: <span className="font-semibold text-cyan-600 dark:text-cyan-400">${selectedTicket.price}</span></p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Listing Price */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Listing Price (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Enter listing price"
                        value={auctionForm.listingPrice}
                        onChange={(e) => setAuctionForm({ ...auctionForm, listingPrice: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Minimum Bid */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Starting Bid (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Minimum starting bid"
                        value={auctionForm.minBid}
                        onChange={(e) => setAuctionForm({ ...auctionForm, minBid: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Reserve Price */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Reserve Price (USD) <span className="text-xs text-gray-500">Optional</span></label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Minimum acceptable offer"
                        value={auctionForm.reservePrice}
                        onChange={(e) => setAuctionForm({ ...auctionForm, reservePrice: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                      />
                    </div>
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
      </div>
    </div>
  );
}
