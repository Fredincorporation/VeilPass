'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useWishlists, useRemoveFromWishlist } from '@/hooks/useWishlists';
import { formatDate } from '@/lib/date-formatter';
import Link from 'next/link';

interface WishlistItem {
  event_id: number;
  user_address: string;
  created_at: string;
  event?: {
    id: number;
    title: string;
    date: string;
    location: string;
    base_price: number;
    status: string;
    image: string;
    capacity: number;
    tickets_sold: number;
  };
}

export default function WishlistPage() {
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [account, setAccount] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch user's wishlisted events from database
  const { data: wishlists = [], isLoading } = useWishlists(account || '');
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();

  useEffect(() => {
    const savedAccount = localStorage.getItem('veilpass_account');
    setAccount(savedAccount);
  }, []);

  // Fetch event details for wishlisted items
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!wishlists || wishlists.length === 0) {
        setWishlistItems([]);
        return;
      }

      setIsLoadingEvents(true);
      try {
        const itemsWithEvents = await Promise.all(
          wishlists.map(async (wishlist: any) => {
            try {
              const response = await fetch(`/api/events/${wishlist.event_id}`);
              if (response.ok) {
                const event = await response.json();
                return { ...wishlist, event };
              }
            } catch (error) {
              console.error(`Error fetching event ${wishlist.event_id}:`, error);
            }
            return wishlist;
          })
        );
        setWishlistItems(itemsWithEvents);
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEventDetails();
  }, [wishlists]);

  const filteredItems = wishlistItems.filter((item: any) => {
    const eventTitle = item.event?.title || '';
    const eventLocation = item.event?.location || '';
    return (
      eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eventLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleRemoveFromWishlist = (userAddress: string, eventId: number) => {
    removeFromWishlist(
      { user_address: userAddress, event_id: eventId },
      {
        onSuccess: () => {
          setWishlistItems(wishlistItems.filter(item => item.event_id !== eventId));
          showSuccess('Removed from wishlist');
        },
        onError: () => {
          showError('Failed to remove from wishlist');
        },
      }
    );
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
            {filteredItems.length} event{filteredItems.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || isLoadingEvents) && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading wishlist...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isLoadingEvents && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No wishlisted events</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding events to your wishlist to see them here
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
            >
              Browse Events
            </Link>
          </div>
        )}

        {/* Wishlist Items Grid */}
        {!isLoading && !isLoadingEvents && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item: any) => (
              <div
                key={`${item.user_address}-${item.event_id}`}
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition group"
              >
                {/* Event Image */}
                {item.event?.image && (
                  <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img
                      src={item.event.image}
                      alt={item.event?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}

                {/* Event Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white flex-1">
                      {item.event?.title || 'Event'}
                    </h3>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.user_address, item.event_id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>📅 {item.event?.date ? formatDate(item.event.date) : 'N/A'}</p>
                    <p>📍 {item.event?.location || 'N/A'}</p>
                    <p>💰 {item.event?.base_price || 0} ETH</p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold rounded-full">
                      {item.event?.status || 'Unknown'}
                    </span>
                  </div>

                  {/* View Event Button */}
                  <Link
                    href={`/events/${item.event_id}`}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition text-center"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
