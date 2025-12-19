'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, Calendar, Users, DollarSign, FileText, Image as ImageIcon, ArrowRight, Trash2, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useCreateEvent } from '@/hooks/useSellerEvents';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  quantity: string;
  description: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { showSuccess, showError, showWarning } = useToast();
  const [step, setStep] = useState(1);
  const [usePricingTiers, setUsePricingTiers] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);

  // Create event mutation
  const { mutate: createEvent, isPending } = useCreateEvent();

  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    { id: '1', name: 'General Admission', price: '', quantity: '', description: '' },
  ]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    basePrice: '',
    category: '',
    image: null as File | null,
  });

  useEffect(() => {
    const savedAccount = localStorage.getItem('veilpass_account');
    const savedBusinessName = localStorage.getItem('veilpass_business_name');
    setAccount(savedAccount);
    setBusinessName(savedBusinessName);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTierChange = (id: string, field: keyof PricingTier, value: string) => {
    setPricingTiers((prev) =>
      prev.map((tier) =>
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    );
  };

  const addTier = () => {
    const newId = (Math.max(...pricingTiers.map(t => parseInt(t.id) || 0)) + 1).toString();
    setPricingTiers((prev) => [
      ...prev,
      { id: newId, name: '', price: '', quantity: '', description: '' },
    ]);
  };

  const removeTier = (id: string) => {
    if (pricingTiers.length > 1) {
      setPricingTiers((prev) => prev.filter((tier) => tier.id !== id));
    }
  };

  const duplicateTier = (id: string) => {
    const tierToDuplicate = pricingTiers.find((tier) => tier.id === id);
    if (tierToDuplicate) {
      const newId = (Math.max(...pricingTiers.map(t => parseInt(t.id) || 0)) + 1).toString();
      setPricingTiers((prev) => [
        ...prev,
        { ...tierToDuplicate, id: newId, name: `${tierToDuplicate.name} (Copy)` },
      ]);
    }
  };

  // Trigger confetti animation
  const triggerConfetti = () => {
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setConfetti(confettiPieces);
  };

  // Auto-redirect after 3 seconds
  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        router.push('/seller/events');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfirmation, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields for current step
    if (step === 1) {
      if (!formData.title.trim()) {
        showError('Event title is required');
        return;
      }
      if (!formData.description.trim()) {
        showError('Event description is required');
        return;
      }
      if (!formData.category) {
        showError('Please select an event category');
        return;
      }
    } else if (step === 2) {
      if (!formData.date) {
        showError('Event date is required');
        return;
      }
      if (!formData.time) {
        showError('Event time is required');
        return;
      }
      if (!formData.location.trim()) {
        showError('Event location is required');
        return;
      }
      if (!formData.capacity || parseInt(formData.capacity) <= 0) {
        showError('Valid event capacity is required');
        return;
      }
    } else if (step === 3) {
      if (!imagePreview) {
        showWarning('Event image is recommended');
      }
      
      if (!formData.basePrice || (usePricingTiers && pricingTiers.some(t => !t.price || !t.name))) {
        showError('Please fill in all pricing information');
        return;
      }
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit to database
      if (!account) {
        showError('Please connect your wallet first');
        return;
      }

      // Prepare event data for submission - map form fields to database columns
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: `${formData.date} at ${formData.time}`, // Combine date and time
        location: formData.location,
        capacity: formData.capacity, // Store as is from form
        organizer: businessName || account || '', // Use Business Name, fallback to account address
        base_price: parseFloat(formData.basePrice),
        image: imagePreview || '', // Map image_url to image
        status: 'Pre-Sale', // Map active to Pre-Sale status
        // Include ticket tiers if pricing tiers option is enabled
        ...(usePricingTiers && {
          ticket_tiers: pricingTiers.map((tier) => ({
            name: tier.name,
            description: tier.description,
            price: parseFloat(tier.price) || 0,
            quantity: parseInt(tier.quantity) || 0,
            features: tier.description ? [tier.description] : [],
          })),
        }),
      };

      createEvent(eventData, {
        onSuccess: () => {
          triggerConfetti();
          setShowConfirmation(true);
          showSuccess('Event created successfully!');
        },
        onError: (error: any) => {
          showError(`Failed to create event: ${error.message}`);
          console.error('Event creation error:', error);
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Create Event</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Launch your event and start selling tickets</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= num
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white scale-110'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step > num ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Event Details</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Name & Description</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Event Info</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Date & Location</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Media & Pricing</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Image & Price</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Summer Music Festival"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Describe your event in detail..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition"
                    >
                      <option value="">Select a category...</option>
                      <option value="music">Music</option>
                      <option value="sports">Sports</option>
                      <option value="comedy">Comedy</option>
                      <option value="art">Art & Exhibition</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Event Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Info</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Central Park, NYC"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                      Ticket Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 500"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Media & Pricing */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Event Image */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <ImageIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  Event Image
                </h2>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Preview</p>
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 max-w-sm">
                      <img src={imagePreview} alt="Event preview" className="w-full h-auto object-cover" />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setFormData((prev) => ({ ...prev, image: null }));
                        }}
                        type="button"
                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Upload Event Image</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Drag and drop or click to select</p>
                    </div>
                  </div>
                  {formData.image && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-4 font-semibold">✓ {formData.image.name}</p>
                  )}
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    Ticket Pricing
                  </h2>
                </div>

                {/* Toggle for Pricing Tiers */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                  <button
                    onClick={() => setUsePricingTiers(!usePricingTiers)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      usePricingTiers ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        usePricingTiers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Create Ticket Tiers</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {usePricingTiers ? 'Offer different ticket levels' : 'Use single price for all tickets'}
                    </p>
                  </div>
                </div>

                {/* Single Price Option */}
                {!usePricingTiers && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                      Ticket Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-600 dark:text-gray-400 font-semibold">$</span>
                      <input
                        type="number"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        required
                        placeholder="0.00"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition"
                      />
                    </div>
                  </div>
                )}

                {/* Pricing Tiers Option */}
                {usePricingTiers && (
                  <div className="space-y-4">
                    {pricingTiers.map((tier, index) => (
                      <div
                        key={tier.id}
                        className="bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-900 dark:text-white">Tier {index + 1}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => duplicateTier(tier.id)}
                              type="button"
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                              title="Duplicate tier"
                            >
                              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => removeTier(tier.id)}
                              type="button"
                              disabled={pricingTiers.length === 1}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove tier"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                              Tier Name
                            </label>
                            <input
                              type="text"
                              value={tier.name}
                              onChange={(e) => handleTierChange(tier.id, 'name', e.target.value)}
                              placeholder="e.g., VIP, Standard, Early Bird"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                              Price per Ticket
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-gray-600 dark:text-gray-400 font-semibold">$</span>
                              <input
                                type="number"
                                value={tier.price}
                                onChange={(e) => handleTierChange(tier.id, 'price', e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                              Quantity Available
                            </label>
                            <input
                              type="number"
                              value={tier.quantity}
                              onChange={(e) => handleTierChange(tier.id, 'quantity', e.target.value)}
                              placeholder="e.g., 100"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                              Description
                            </label>
                            <input
                              type="text"
                              value={tier.description}
                              onChange={(e) => handleTierChange(tier.id, 'description', e.target.value)}
                              placeholder="e.g., Includes meet & greet"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Tier Button */}
                    <button
                      onClick={addTier}
                      type="button"
                      className="w-full py-3 rounded-xl border-2 border-dashed border-green-300 dark:border-green-700 hover:border-green-500 dark:hover:border-green-500 text-green-600 dark:text-green-400 font-semibold transition-all flex items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/10"
                    >
                      <Plus className="w-5 h-5" />
                      Add Another Tier
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Previous
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg"
            >
              {step < 3 ? (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>

        {/* Confetti Animation */}
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="fixed pointer-events-none animate-pulse"
            style={{
              left: `${piece.left}%`,
              top: '-10px',
              animation: `fall ${2 + Math.random()}s linear forwards`,
              animationDelay: `${piece.delay}s`,
            }}
          >
            <span className="text-2xl" style={{ opacity: 0.8 }}>
              {['🎉', '✨', '🎊', '⭐', '🌟'][Math.floor(Math.random() * 5)]}
            </span>
          </div>
        ))}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 max-w-md mx-4 text-center animate-bounce">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                🎉 Event Created!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Your event "{formData.title}" has been created successfully!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Redirecting to your events in a moment...
              </p>
              
              {/* Loading Bar */}
              <div className="mt-6 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse"
                  style={{
                    animation: 'slideIn 3s ease-in-out forwards',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
          @keyframes slideIn {
            from {
              width: 0;
            }
            to {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
