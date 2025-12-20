'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';
import { useSellerEvents } from '@/hooks/useSellerEvents';
import { useSafeWallet } from '@/lib/wallet-context';
import { ChevronLeft, Calendar, MapPin, DollarSign, Share2, Heart } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/date-formatter';

export default function ViewEventPage() {
  const router = useRouter();
  const params = useParams();
  const { showError } = useToast();
  const wallet = useSafeWallet();
  const eventName = decodeURIComponent(params.eventName as string);
  
  const [account, setAccount] = useState<string | null>(null);
  const { data: events = [] } = useSellerEvents(account);
  
  const [event, setEvent] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [ethPrice, setEthPrice] = useState<number>(3500); // Default ETH price in USD

  // Fetch ETH price on mount
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await response.json();
        if (data.ethereum?.usd) {
          setEthPrice(data.ethereum.usd);
        }
      } catch (err) {
        console.error('Failed to fetch ETH price:', err);
        // Keep default price on error
      }
    };

    fetchEthPrice();
  }, []);

  useEffect(() => {
    const connectedAddress = wallet?.address ?? localStorage.getItem('veilpass_account');
    setAccount(connectedAddress);
  }, [wallet?.address]);

  useEffect(() => {
    if (events.length === 0) return;
    
    // Find the event by name
    const foundEvent = events.find((e: any) => e.title === eventName);
    if (foundEvent) {
      setEvent(foundEvent);
    } else if (!notFound) {
      // Mark as not found to avoid repeated redirects
      setNotFound(true);
      showError('Event not found');
      setTimeout(() => router.push('/seller/events'), 1500);
    }
  }, [eventName, events]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          {/* Image */}
          {event.image && (
            <div className="relative w-full h-96 bg-gray-200 dark:bg-gray-800">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Title and Actions */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {event.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Organized by {event.organizer || 'Unknown'}
                </p>
              </div>
              <button
                onClick={() => setLiked(!liked)}
                className={`p-3 rounded-lg transition ${
                  liked
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Heart className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                event.status === 'On Sale'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : event.status === 'Pre-Sale'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}>
                {event.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-gray-200 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Date</p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDate(event.date)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Location</p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {event.location || 'TBD'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Price</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {event.base_price || '0'} ETH
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ≈ ${((event.base_price || 0) * ethPrice).toFixed(2)} USDT
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About This Event</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {event.description || 'No description available'}
              </p>
            </div>

            {/* Capacity */}
            {event.capacity && (
              <div className="py-6 border-t border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Capacity</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {event.capacity}
                </p>
              </div>
            )}

            {/* Share Button */}
            <div className="flex gap-3 mt-8">
              <button className="flex-1 px-6 py-3 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
