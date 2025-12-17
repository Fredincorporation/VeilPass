'use client';

import React, { useState } from 'react';
import { DollarSign, ShoppingCart, Lock } from 'lucide-react';

export default function EventDetailPage() {
  const [quantity, setQuantity] = useState(1);
  const [showDeFiModal, setShowDeFiModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'eth' | 'usdc'>('eth');

  const event = {
    id: 1,
    title: 'Summer Music Festival 2025',
    date: 'June 15, 2025',
    location: 'Central Park, New York',
    basePrice: 285,
    dynamicPrice: 315,
    description: 'Experience the ultimate summer music festival with world-class artists and performances.',
    image: 'gradient-to-br from-blue-500 to-purple-500',
    ticketsAvailable: 450,
    encryptedDemand: '****...',
  };

  const handlePurchase = () => {
    setShowDeFiModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Event Image */}
          <div className={`bg-gradient-to-br ${event.image} rounded-2xl h-96 md:h-auto md:min-h-96`} />

          {/* Event Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{event.date} • {event.location}</p>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8">{event.description}</p>

            {/* Pricing */}
            <div className="mb-8 p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dynamic Price (Encrypted Demand)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-600">${event.dynamicPrice}</span>
                  <span className="text-sm line-through text-gray-400">${event.basePrice}</span>
                  <Lock className="w-4 h-4 text-blue-600 ml-auto" />
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                Price adjusts homomorphically based on encrypted demand. {event.ticketsAvailable} tickets available.
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-lg text-gray-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Purchase {quantity} Ticket{quantity > 1 ? 's' : ''}
            </button>
          </div>
        </div>

        {/* DeFi Payment Modal */}
        {showDeFiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Payment Method</h2>

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
                      <p className="font-semibold text-gray-900 dark:text-white">{method.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quantity * event.dynamicPrice}
                  <span className="text-lg ml-2">{paymentMethod === 'eth' ? 'ETH' : 'USDC'}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeFiModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition">
                  <DollarSign className="w-4 h-4 inline mr-2" />
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
