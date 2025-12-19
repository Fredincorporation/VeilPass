'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, TrendingUp, Search, Filter, Plus, Edit, Eye, MoreVertical, Clock, Zap, AlertCircle, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ToastContainer';
import { useSellerEvents } from '@/hooks/useSellerEvents';
import { formatDate, formatTime } from '@/lib/date-formatter';

export default function SellerEventsPage() {
  const router = useRouter();
  const { showSuccess, showInfo, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'ended' | 'rejected'>('all');
  const [account, setAccount] = useState<string | null>(null);
  const [selectedRejection, setSelectedRejection] = useState<{ title: string; reason: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedAccount = localStorage.getItem('veilpass_account');
    if (savedAccount) {
      setAccount(savedAccount);
    } else {
      showError('Please connect your wallet to view your events');
    }
  }, [showError]);

  // Fetch seller's events from database - only when account is set and client-side
  const { data: dbEvents = [], isLoading, error } = useSellerEvents(isClient && account ? account : '');

  // Use only database events - no mock data fallback
  const events = dbEvents;

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pre-Sale':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800';
      case 'Live Auction':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800';
      case 'ended':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700';
      case 'Rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  // Helper function to format ISO date string to display format
  const formatEventDate = (dateString: string) => {
    return formatDate(dateString);
  };

  // Helper function to extract time from ISO date string
  const formatEventTime = (dateString: string) => {
    return formatTime(dateString);
  };

  // Helper function to get attendees count (placeholder - will be calculated from bids/tickets)
  const getAttendees = (event: any) => {
    // For now, return 0 as we don't have ticket/bid data in events table
    // This can be updated when ticket system is fully integrated
    return event.tickets_sold || 0;
  };

  // Helper function to calculate revenue (base_price * attendees or tickets sold)
  const getRevenue = (event: any) => {
    const basePrice = event.base_price || 0;
    const ticketsSold = event.tickets_sold || 0;
    const revenue = basePrice * ticketsSold;
    return `${revenue.toFixed(2)} ETH`;
  };

  // Helper function to get occupancy percentage (placeholder)
  const getOccupancy = (event: any) => {
    // Calculate occupancy based on tickets sold vs capacity
    const capacity = event.capacity || 0;
    const ticketsSold = event.tickets_sold || 0;
    
    if (capacity === 0) return 0;
    
    const occupancy = Math.round((ticketsSold / capacity) * 100);
    return Math.min(occupancy, 100); // Cap at 100%
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return 'from-red-500 to-pink-600';
    if (occupancy >= 60) return 'from-orange-500 to-red-600';
    if (occupancy >= 40) return 'from-blue-500 to-cyan-600';
    return 'from-green-500 to-emerald-600';
  };

  const handleEditEvent = (eventId: string, eventTitle: string) => {
    showInfo(`Opening edit for "${eventTitle}"...`);
    router.push(`/seller/events/edit/${encodeURIComponent(eventTitle)}`);
  };

  const handleViewEvent = (eventId: string, eventTitle: string) => {
    showInfo(`Opening event details for "${eventTitle}"...`);
    router.push(`/seller/events/view/${encodeURIComponent(eventTitle)}`);
  };

  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter((e: any) => e.status === 'Live Auction').length,
    totalRevenue: '$0',
    totalAttendees: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Events</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage and track your events and sales</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/seller/create-event')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Active</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.activeEvents}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalRevenue}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Total Attendees</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalAttendees.toLocaleString()}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 items-center flex-wrap">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('upcoming')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'upcoming'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilterStatus('ended')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'ended'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Ended
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {!isClient ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">Loading...</div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">Fetching your events...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl p-6 text-red-700 dark:text-red-400">
            <p className="font-semibold">Error loading events</p>
            <p className="text-sm mt-1">{String(error)}</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: any) => (
              <div
                key={event.id}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border-2 cursor-pointer hover:scale-110 transition-transform ${getStatusColor(event.status)}`}
                          onClick={() => event.status === 'Rejected' && event.rejection_reason ? setSelectedRejection({ title: event.title, reason: event.rejection_reason }) : null}>
                      {event.status === 'active' && <Zap className="w-3 h-3 inline mr-1" />}
                      {event.status === 'Rejected' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                      {event.status === 'Pre-Sale' && '⏳'}
                      {event.status === 'Live Auction' && '🎉'}
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 rounded-lg bg-white/90 dark:bg-gray-900/90 text-xs font-bold text-gray-900 dark:text-white">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2">{event.title}</h3>

                  {/* Date & Time */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{formatEventTime(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Occupancy</p>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{getOccupancy(event)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getOccupancyColor(getOccupancy(event))} transition-all`}
                        style={{ width: `${getOccupancy(event)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Attendees</p>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{getAttendees(event)}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Revenue</p>
                      <p className="text-sm font-bold text-green-900 dark:text-green-100">{getRevenue(event)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {event.status !== 'ended' && event.status !== 'Rejected' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditEvent(event.id, event.title)}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition text-sm flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleViewEvent(event.id, event.title)}
                        className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold transition text-sm flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  )}

                  {/* Rejected Event Info */}
                  {event.status === 'Rejected' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">Event Rejected</p>
                          <p className="text-xs text-red-700 dark:text-red-300">{event.rejection_reason || 'No reason provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4">
              <Calendar className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">
              {searchTerm ? 'No events match your search' : 'You haven\'t created any events yet'}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Click the "Create Event" button to get started'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => router.push('/seller/create-event')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <Plus className="w-5 h-5" />
                Create Your First Event
              </button>
            )}
          </div>
        )

        {/* Rejection Reason Modal */}
        {selectedRejection && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rejection Reason</h2>
                </div>
                <button
                  onClick={() => setSelectedRejection(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Event: <span className="font-semibold text-gray-900 dark:text-white">{selectedRejection.title}</span>
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-900 dark:text-red-200 whitespace-pre-wrap">
                    {selectedRejection.reason}
                  </p>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  You can resubmit this event for approval after addressing the issues mentioned above.
                </p>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setSelectedRejection(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
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
