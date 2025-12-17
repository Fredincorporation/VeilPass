'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, TrendingUp, Search, Filter, Plus, Edit, Eye, MoreVertical, Clock, Zap } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ToastContainer';

export default function SellerEventsPage() {
  const router = useRouter();
  const { showSuccess, showInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  const [events] = useState([
    {
      id: 'EV001',
      title: 'Summer Music Festival',
      date: '2025-06-15',
      time: '6:00 PM',
      location: 'Central Park, NYC',
      ticketsSold: 245,
      revenue: '$12,450',
      status: 'active',
      capacity: 500,
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=600&h=400&fit=crop',
      category: 'Music',
      attendees: '245/500',
      occupancy: 49,
    },
    {
      id: 'EV002',
      title: 'Comedy Night Live',
      date: '2025-07-22',
      time: '8:00 PM',
      location: 'Theatre District, NYC',
      ticketsSold: 128,
      revenue: '$6,400',
      status: 'upcoming',
      capacity: 300,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
      category: 'Comedy',
      attendees: '128/300',
      occupancy: 43,
    },
    {
      id: 'EV003',
      title: 'Art Exhibition 2025',
      date: '2025-05-10',
      time: '10:00 AM',
      location: 'Museum of Modern Art',
      ticketsSold: 89,
      revenue: '$4,450',
      status: 'ended',
      capacity: 200,
      image: 'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=600&h=400&fit=crop',
      category: 'Art',
      attendees: '89/200',
      occupancy: 45,
    },
    {
      id: 'EV004',
      title: 'Tech Conference 2025',
      date: '2025-08-05',
      time: '9:00 AM',
      location: 'Convention Center, NYC',
      ticketsSold: 342,
      revenue: '$17,100',
      status: 'active',
      capacity: 600,
      image: 'https://images.unsplash.com/photo-1540575467063-178f50002cbc?w=600&h=400&fit=crop',
      category: 'Conference',
      attendees: '342/600',
      occupancy: 57,
    },
  ]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800';
      case 'ended':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return 'from-red-500 to-pink-600';
    if (occupancy >= 60) return 'from-orange-500 to-red-600';
    if (occupancy >= 40) return 'from-blue-500 to-cyan-600';
    return 'from-green-500 to-emerald-600';
  };

  const handleEditEvent = (eventId: string, eventTitle: string) => {
    showInfo(`Opening edit for "${eventTitle}"...`);
    // TODO: Navigate to edit event page
  };

  const handleViewEvent = (eventId: string, eventTitle: string) => {
    showInfo(`Opening event details for "${eventTitle}"...`);
    // TODO: Navigate to event details page
  };

  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'active').length,
    totalRevenue: `$${events.reduce((sum, e) => sum + parseInt(e.revenue.replace(/[$,]/g, '')), 0).toLocaleString()}`,
    totalAttendees: events.reduce((sum, e) => sum + e.ticketsSold, 0),
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
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
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
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusColor(event.status)}`}>
                      {event.status === 'active' && <Zap className="w-3 h-3 inline mr-1" />}
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
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{event.time}</span>
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
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{event.occupancy}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getOccupancyColor(event.occupancy)} transition-all`}
                        style={{ width: `${event.occupancy}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Attendees</p>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{event.attendees}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Revenue</p>
                      <p className="text-sm font-bold text-green-900 dark:text-green-100">{event.revenue}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {event.status !== 'ended' && (
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4">
              <Calendar className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No events found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {searchTerm ? 'Try adjusting your search' : 'Start creating events to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
