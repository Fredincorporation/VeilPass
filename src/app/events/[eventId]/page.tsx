'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DollarSign, ShoppingCart, Lock, CheckCircle, Info, Users, Clock, MapPin, Heart, Share2 } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useEventDetail } from '@/hooks/useEventDetail';
import { useWishlists, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlists';
import { formatDate, formatTime } from '@/lib/date-formatter';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showDeFiModal, setShowDeFiModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'eth' | 'usdc'>('eth');
  const [account, setAccount] = useState<string | null>(null);

  // Fetch specific event from database
  const { data: event, isLoading, error } = useEventDetail(eventId);

  // Fetch user's wishlists
  const { data: wishlists = [] } = useWishlists(account || '');
  const { mutate: addToWishlist, isPending: isAddingWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemovingWishlist } = useRemoveFromWishlist();

  // Check if current event is in user's wishlist
  const isWishlisted = account && event && wishlists.some((w: any) => w.event_id === parseInt(eventId));

  useEffect(() => {
    const savedAccount = localStorage.getItem('veilpass_account');
    setAccount(savedAccount);
  }, []);

  // Use ticket tiers from database if available, otherwise use empty array
  const tiers = event?.ticket_tiers || [];

  // Set default selected tier when tiers load
  useEffect(() => {
    if (tiers.length > 0 && selectedTier === null) {
      setSelectedTier(tiers[0].id);
    } else if (tiers.length === 0 && selectedTier !== null) {
      // Reset selected tier if tiers are no longer available
      setSelectedTier(null);
    }
  }, [tiers, selectedTier]);

  const selectedTierData = tiers.find(t => t.id === selectedTier);
  // Use selected tier price, fallback to base_price if no tier selected, default to 0
  const ticketPrice = selectedTierData?.price || event?.base_price || 0;
  const totalPrice = ticketPrice * quantity;
  
  const ticketsRemaining = event && event.capacity ? event.capacity - event.tickets_sold : 0;
  const selloutPercentage = event && event.capacity ? Math.min(100, Math.round((event.tickets_sold / event.capacity) * 100)) : 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      showWarning('Minimum 1 ticket required per purchase');
      return;
    }
    if (newQuantity > 4) {
      showWarning('Maximum 4 tickets per purchase.');
      return;
    }
    setQuantity(newQuantity);
  };

  const handlePurchase = () => {
    if (!selectedTierData) return;
    if (quantity < 1) {
      showError('Minimum 1 ticket required');
      return;
    }
    showInfo(`Proceeding to purchase ${quantity} ${selectedTierData.name} tickets...`);
    setShowDeFiModal(true);
  };

  const handlePayment = () => {
    const loyaltyPoints = Math.floor((totalPrice * 1000) / 10); // 100 pts per $1K in ETH
    showSuccess(`Successfully purchased ${quantity} tickets! You earned ${loyaltyPoints} loyalty points.`);
    setShowDeFiModal(false);
    setQuantity(1);
  };

  const handleWishlist = () => {
    if (!account) {
      showError('Please connect your wallet first');
      return;
    }

    if (!event) {
      showError('Event not found');
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(
        { user_address: account, event_id: parseInt(eventId) },
        {
          onSuccess: () => {
            showSuccess('Removed from wishlist');
          },
          onError: () => {
            showError('Failed to remove from wishlist');
          },
        }
      );
    } else {
      addToWishlist(
        { user_address: account, event_id: parseInt(eventId) },
        {
          onSuccess: () => {
            showSuccess('Added to wishlist!');
          },
          onError: () => {
            showError('Failed to add to wishlist');
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">Event not found</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The event you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-2">
            {/* Product Title & Meta with Action Icons */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex-1">{event.title}</h1>
                {/* Wishlist & Share Icons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-lg transition ${
                      isWishlisted
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title="Add to wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
                  </button>
                  <button 
                    className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    title="Share event"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{event.capacity?.toLocaleString()} attending</span>
                </div>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">Date & Time</p>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{formatDate(event.date)}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{formatTime(event.date)}</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">Location</p>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Tickets Selling</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selloutPercentage}% sold</span>
                </div>
                <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{ width: `${selloutPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200 mt-2">{ticketsRemaining} tickets available</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{event.description}</p>
              
              <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Instant Delivery</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Digital tickets immediately</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Encrypted</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Secure blockchain verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Tiers as Product Options - Only show if event has tiers */}
            {tiers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Your Ticket Tier</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`text-left p-6 rounded-xl border-2 transition-all ${
                        selectedTier === tier.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{tier.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tier.description}</p>
                        </div>
                        {selectedTier === tier.id && (
                          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{tier.price.toFixed(4)} ETH</p>
                      <p className="text-xs text-gray-500 mb-4">per ticket</p>
                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
              {/* Price Section */}
              <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Price Per Ticket</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {ticketPrice.toFixed(4)} <span className="text-lg font-semibold text-gray-500">ETH</span>
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                  Quantity
                </label>
                <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex w-full justify-center">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="flex-1 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center font-bold text-2xl text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 4}
                    className="flex-1 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Max 4 tickets per order</p>
              </div>

              {/* Order Summary */}
              <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Unit price</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{ticketPrice.toFixed(4)} ETH</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Quantity</span>
                  <span className="font-semibold text-gray-900 dark:text-white">×{quantity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Loyalty Points</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">+{quantity * 50}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-8 p-5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalPrice.toFixed(2)} ETH</p>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg hover:shadow-lg transition flex items-center justify-center gap-2 mb-4"
              >
                <ShoppingCart className="w-5 h-5" />
                Get Tickets
              </button>

              {/* Trust Signals */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Secure encrypted transaction
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
                  <CheckCircle className="w-3 h-3" />
                  Instant digital delivery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showDeFiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8 border-2 border-gray-200 dark:border-gray-800 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Complete Purchase</h2>

              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Order Summary</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{quantity}x {selectedTierData?.name}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPrice.toFixed(2)} ETH</p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { id: 'eth', label: 'Ethereum (ETH)', desc: 'Pay with ETH' },
                  { id: 'usdc', label: 'USDC (Testnet)', desc: 'Pay with test USDC' },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value as 'eth' | 'usdc')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{method.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeFiModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
