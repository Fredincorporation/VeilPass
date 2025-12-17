'use client';

import React, { useState } from 'react';
import { Heart, Search, Filter, Trash2, Clock, MapPin, TicketIcon, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function WishlistPage() {
  const { showSuccess, showInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      title: 'Berlin Techno Festival 2025',
      date: 'Sep 12-15, 2025',
      location: 'Berlin, Germany',
      price: '0.25-0.85 ETH',
      status: 'Live Auction',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=400&fit=crop',
      daysRemaining: 24,
    },
    {
      id: 2,
      title: 'Web3 Summit Europe',
      date: 'Oct 8-10, 2025',
      location: 'Lisbon, Portugal',
      price: '0.5-2.0 ETH',
      status: 'Pre-Sale',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop',
      daysRemaining: 45,
    },
    {
      id: 3,
      title: 'Paris Fashion Week 2025',
      date: 'Jan 20-27, 2025',
      location: 'Paris, France',
      price: '1.5-5.0 ETH',
      status: 'Pre-Sale',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop',
      daysRemaining: 90,
    },
  ]);

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRemoveFromWishlist = (id: number) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
    showSuccess('Removed from wishlist');
  };

  const handleBuyNow = (title: string) => {
    showInfo(`Navigating to ${title} purchase page...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live Auction':
        return 'bg-blue-600/80 border-blue-400 text-white';
      case 'Pre-Sale':
        return 'bg-purple-600/80 border-purple-400 text-white';
      case 'Almost Sold Out':
        return 'bg-red-600/80 border-red-400 text-white';
      default:
        return 'bg-gray-600/80 border-gray-400 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 ml-14">
            {wishlistItems.length} event{wishlistItems.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'Live Auction', 'Pre-Sale', 'Almost Sold Out'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30'
                    : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:border-red-400 dark:hover:border-red-500'
                }`}
              >
                {status === 'all' ? 'All Events' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Wishlist Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2">
                {/* Image */}
                <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Days Remaining */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-xs font-semibold opacity-90">Ends in</p>
                    <p className="text-xl font-bold">{item.daysRemaining} days</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b-2 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Price Range</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{item.price}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBuyNow(item.title)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <TicketIcon className="w-4 h-4" />
                      Buy Now
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-400 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400 font-semibold transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No events in wishlist</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Start adding events to your wishlist by clicking the heart icon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
