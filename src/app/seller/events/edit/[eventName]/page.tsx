'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastContainer';
import { useSellerEvents } from '@/hooks/useSellerEvents';
import { ChevronLeft, Save, X } from 'lucide-react';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { showSuccess, showError, showInfo } = useToast();
  const eventName = decodeURIComponent(params.eventName as string);
  
  const [account, setAccount] = useState<string | null>(null);
  const { data: events = [] } = useSellerEvents(account || '');
  
  const [event, setEvent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [ethPrice, setEthPrice] = useState<number>(3500); // Default ETH price in USD
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    basePrice: '',
    capacity: '',
  });

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
    const savedAccount = localStorage.getItem('veilpass_account');
    setAccount(savedAccount);
  }, []);

  useEffect(() => {
    if (events.length === 0) return;
    
    // Find the event by name
    const foundEvent = events.find((e: any) => e.title === eventName);
    if (foundEvent) {
      setEvent(foundEvent);
      const { date, time } = formatDateForInput(foundEvent.date);
      setFormData({
        title: foundEvent.title || '',
        description: foundEvent.description || '',
        date: date,
        time: time,
        location: foundEvent.location || '',
        basePrice: foundEvent.base_price || '',
        capacity: foundEvent.capacity || '',
      });
    } else if (!notFound) {
      // Mark as not found to avoid repeated redirects
      setNotFound(true);
      showError('Event not found');
      setTimeout(() => router.push('/seller/events'), 1500);
    }
  }, [eventName, events]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateUsdtValue = () => {
    const basePriceEth = parseFloat(formData.basePrice) || 0;
    return basePriceEth * ethPrice;
  };

  // Helper function to format ISO string to separate date (YYYY-MM-DD) and time (HH:mm)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return { date: '', time: '' };
    try {
      const date = new Date(dateString);
      // Format date as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateFormatted = `${year}-${month}-${day}`;
      
      // Format time as HH:mm
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const timeFormatted = `${hours}:${minutes}`;
      
      return { date: dateFormatted, time: timeFormatted };
    } catch (err) {
      console.error('Error formatting date:', err);
      return { date: '', time: '' };
    }
  };

  // Helper function to combine date and time back to ISO format
  const combineDateTimeToISO = (date: string, time: string) => {
    if (!date || !time) return '';
    return `${date}T${time}:00`;
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('Event title is required');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare the update payload
      const updatePayload = {
        id: event.id,
        title: formData.title,
        description: formData.description,
        date: combineDateTimeToISO(formData.date, formData.time),
        location: formData.location,
        base_price: parseFloat(formData.basePrice) || 0,
        capacity: parseInt(formData.capacity) || 0,
      };

      // Call the update API
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save event');
      }

      // Invalidate the seller events cache to refresh the data
      if (account) {
        queryClient.invalidateQueries({ queryKey: ['sellerEvents', account] });
      }

      showSuccess(`Event "${formData.title}" updated successfully!`);
      setTimeout(() => {
        router.push('/seller/events');
      }, 1500);
    } catch (err) {
      showError(`Failed to save event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Event</h1>
            <p className="text-gray-600 dark:text-gray-400">{eventName}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Event title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Event description"
              />
            </div>

            {/* Date and Time and Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Event location"
                />
              </div>
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Base Price (ETH)
              </label>
              <div className="space-y-3">
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      USDT Equivalent
                    </span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      ${calculateUsdtValue().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Based on current ETH price: ${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Capacity (Total Tickets Available)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Note */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Changes will be saved to the database. Make sure all information is accurate before saving.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
