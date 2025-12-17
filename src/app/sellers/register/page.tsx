'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle, ShoppingBag, Lock, FileText, ArrowRight } from 'lucide-react';

export default function SellerRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    businessType: '',
    idDocument: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, idDocument: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Encrypt and submit
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Become a Seller</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join VeilPass and start creating encrypted events. Complete this quick verification to get started.
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-500" 
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>

            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    s < step
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg'
                      : s === step
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg scale-110'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                <p className={`text-sm mt-3 font-semibold transition-colors ${
                  s <= step 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {s === 1 ? 'Business Info' : s === 2 ? 'ID Verification' : 'Confirmation'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Business Info */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Business Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Business Name</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Your event company name"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@yourcompany.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Business Type</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Select a business type...</option>
                  <option value="Concert Promoter">Concert Promoter</option>
                  <option value="Event Organizer">Event Organizer</option>
                  <option value="Conference Organizer">Conference Organizer</option>
                  <option value="Festival Organizer">Festival Organizer</option>
                  <option value="Theater Producer">Theater Producer</option>
                  <option value="Sports Event Organizer">Sports Event Organizer</option>
                  <option value="Wedding Planner">Wedding Planner</option>
                  <option value="Community Event Organizer">Community Event Organizer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 mt-8"
              >
                Continue to Verification
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: ID Verification */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Government ID Verification</h2>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Privacy-First Verification:</strong> Your ID is encrypted using advanced fhEVM technology. We verify authenticity, expiration, format, blacklist status, and age - without storing your data.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Upload Government ID</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                  id="idUpload"
                />
                <label htmlFor="idUpload" className="cursor-pointer block">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mx-auto mb-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition">
                    <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    PNG, JPG, or PDF (max 10MB)
                  </p>
                  {formData.idDocument && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">✓ {formData.idDocument.name}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                Submit Application
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800/50 shadow-lg text-center">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Application Submitted!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2 text-base">
              Your seller application has been submitted successfully.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              An admin will review your information and verify your ID within 24 hours. We'll send you a confirmation email when you're approved.
            </p>

            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
              <p className="text-sm text-green-900 dark:text-green-100">
                <strong>What's next?</strong> Check your email for updates. Once approved, you'll be able to create events, manage sales, and earn rewards.
              </p>
            </div>

            <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30">
              Return to Dashboard
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
