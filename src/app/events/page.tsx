'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Zap, Users, Calendar, MapPin } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useEthPrice } from '@/hooks/useEthPrice';
import { formatDate } from '@/lib/date-formatter';
import { formatEth, ethToUsd } from '@/lib/currency-utils';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { data: events = [], isLoading, error } = useEvents();
  const { price: ethPrice } = useEthPrice();

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    const isNotRejected = event.status !== 'Rejected';
    return matchesSearch && matchesStatus && isNotRejected;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error loading events</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Events</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 ml-14">
            Discover and bid on encrypted events with VeilPass
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'On Sale', 'Pre-Sale', 'Almost Sold Out'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  selectedStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                {status === 'all' ? 'All Events' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Showing <span className="text-blue-600 dark:text-blue-400">{filteredEvents.length}</span> of <span className="text-blue-600 dark:text-blue-400">{events.length}</span> events
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            // Calculate occupancy from capacity and tickets_sold
            const capacity = event.capacity || 0;
            const ticketsSold = event.tickets_sold || 0;
            const capacityPercent = capacity > 0 ? Math.min((ticketsSold / capacity) * 100, 100) : 0;
            const available = Math.max(capacity - ticketsSold, 0);
            

            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 cursor-pointer h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border ${
                          event.status === 'On Sale'
                            ? 'bg-green-600/80 border-green-400 text-white'
                            : event.status === 'Pre-Sale'
                            ? 'bg-purple-600/80 border-purple-400 text-white'
                            : 'bg-red-600/80 border-red-400 text-white'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-6 flex flex-col flex-grow">
                    {/* Title & Location */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                          {event.title}
                        </h3>
                        <div className="p-1.5 bg-white dark:bg-gray-800 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-500 shadow-md transition-all duration-300 flex-shrink-0">
                          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Date & Capacity */}
                    <div className="space-y-3 mb-4 pb-4 border-b-2 border-gray-200 dark:border-gray-800 flex-grow">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Availability</span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{Math.round(capacityPercent)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${capacityPercent}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{available} / {capacity} tickets</p>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="space-y-2 mt-auto flex-shrink-0">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Base Price</span>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm text-blue-600 dark:text-blue-400">{formatEth(event.base_price)}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">{ethToUsd(event.base_price)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Loyalty Rewards</span>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">+100 pts/$1K in ETH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* No results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No events found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
