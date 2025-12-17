'use client';

import React, { useState } from 'react';
import { DollarSign, ShoppingCart, Lock, CheckCircle, Info, Users, Clock, MapPin, Tag, AlertCircle, Heart, Share2 } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function EventDetailPage() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [selectedTier, setSelectedTier] = useState<string>('standard');
  const [quantity, setQuantity] = useState(1);
  const [showDeFiModal, setShowDeFiModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'eth' | 'usdc'>('eth');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const event = {
    id: 1,
    title: 'Summer Music Festival 2025',
    date: 'June 15-17, 2025',
    location: 'Central Park, New York',
    basePrice: 0.25,
    dynamicPrice: 0.35,
    description: 'Experience the ultimate summer music festival with world-class artists and performances across 3 days.',
    image: 'gradient-to-br from-blue-500 to-purple-500',
    ticketsAvailable: 450,
    encryptedDemand: '****...',
    capacity: 5000,
    organizer: 'Festival Productions Inc.',
    status: 'Finished',
  };

  const tiers = [
    {
      id: 'general',
      name: 'General Admission',
      price: 0.25,
      description: 'Standard access to all performances',
      features: ['All 3-day performances', 'General seating', 'Access to common areas'],
      available: 2500,
    },
    {
      id: 'standard',
      name: 'Standard VIP',
      price: 0.35,
      description: 'Premium experience with reserved seating',
      features: ['VIP reserved seating', 'All 3-day performances', 'Early entry', 'Exclusive lounge access'],
      available: 1200,
    },
    {
      id: 'premium',
      name: 'Premium VIP',
      price: 0.55,
      description: 'Ultimate festival experience',
      features: ['Premium reserved seating', 'Meet & greet opportunity', 'Exclusive dining', 'VIP parking', 'Merchandise pack'],
      available: 300,
    },
  ];

  const selectedTierData = tiers.find(t => t.id === selectedTier);
  const totalPrice = selectedTierData ? selectedTierData.price * quantity : 0;

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
    if (isWishlisted) {
      showInfo('Removed from wishlist');
    } else {
      showSuccess('Added to wishlist!');
    }
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">{event.title}</h1>
              <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {event.capacity.toLocaleString()} capacity
              </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-lg border-2 transition ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-600 text-red-600' : 'text-gray-600 dark:text-gray-400'}`} />
              </button>
              <button className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 hover:border-blue-400 transition">
                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Event Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">Price adjusts dynamically based on encrypted demand</p>
              <p className="text-blue-800 dark:text-blue-200">{event.ticketsAvailable} tickets remaining • Organizer: {event.organizer}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Image & Description */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className={`bg-gradient-to-br ${event.image} rounded-2xl h-80 mb-8 shadow-lg`} />

            {/* Description */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border-2 border-gray-200 dark:border-gray-800 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{event.description}</p>
            </div>

            {/* Tier Selection */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border-2 border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Tag className="w-6 h-6" />
                Choose Your Ticket Tier
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${
                      selectedTier === tier.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{tier.name}</h3>
                      {selectedTier === tier.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tier.description}</p>
                    <div className="mb-4 pb-4 border-b-2 border-gray-200 dark:border-gray-800">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{tier.price} ETH</p>
                      <p className="text-xs text-gray-500 mt-1">per ticket</p>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {tier.available} available
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Purchase Summary</h3>

              {/* Tier Info */}
              {selectedTierData && (
                <div className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected Tier</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedTierData.name}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  Quantity (Max. 4)
                </label>
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center font-bold text-xl text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 4}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">1-4 tickets per purchase</p>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Unit Price</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedTierData?.price || 0} ETH</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Quantity</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{quantity} tickets</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Loyalty Points</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">+{quantity * 50} pts</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalPrice.toFixed(2)} ETH</p>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Purchase Tickets
              </button>

              {/* Info */}
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
                <Lock className="w-3 h-3 inline mr-1" />
                Encrypted transaction • Instant delivery
              </p>
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
