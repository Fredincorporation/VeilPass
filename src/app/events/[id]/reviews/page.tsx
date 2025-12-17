'use client';

import React, { useState, useEffect } from 'react';
import { Star, Upload, Send, AlertCircle, Lock, Calendar, CheckCircle, MessageCircle, ThumbsUp, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  images: string[];
}

export default function EventReviewsPage({ params }: { params: { id: string } }) {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessDenialReason, setAccessDenialReason] = useState('');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      author: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
      rating: 5,
      title: 'Absolutely Amazing Performance!',
      content: 'The production quality was incredible. Every moment was perfectly choreographed. I\'ll definitely be attending more events from this organizer!',
      date: '3 days ago',
      helpful: 45,
      images: [],
    },
    {
      id: 2,
      author: 'Jordan Smith',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
      rating: 4,
      title: 'Great Event, Minor Issues',
      content: 'Overall fantastic experience. Venue was beautiful and staff was friendly. Only downside was the parking situation.',
      date: '1 week ago',
      helpful: 32,
      images: [],
    },
  ]);

  // Simulate checking purchase and event timing
  useEffect(() => {
    const checkAccess = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user purchased event
      const userPurchased = true; // In real app: check from contract/API

      // Check if 24 hours have passed since event end
      const eventEndDate = new Date('2025-09-15T23:59:59');
      const now = new Date();
      const hoursSinceEnd = (now.getTime() - eventEndDate.getTime()) / (1000 * 60 * 60);
      const hoursRemaining = 24 - hoursSinceEnd;

      if (!userPurchased) {
        setAccessDenialReason('Only event attendees can leave reviews.');
        setAccessGranted(false);
      } else if (hoursRemaining > 0) {
        setAccessDenialReason(`Reviews open in ${Math.ceil(hoursRemaining)} hours`);
        setAccessGranted(false);
      } else {
        setAccessGranted(true);
      }

      setIsLoading(false);
    };

    checkAccess();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (uploadedImages.length + newFiles.length > 5) {
      showWarning('Maximum 5 images allowed per review');
      return;
    }

    setUploadedImages([...uploadedImages, ...newFiles]);

    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviewUrls(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      showError('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      showError('Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newReview: Review = {
        id: reviews.length + 1,
        author: 'You',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
        rating,
        title: reviewText.split('\n')[0].slice(0, 60),
        content: reviewText,
        date: 'just now',
        helpful: 0,
        images: imagePreviewUrls,
      };

      setReviews([newReview, ...reviews]);
      setRating(0);
      setReviewText('');
      setUploadedImages([]);
      setImagePreviewUrls([]);
      showSuccess('Review posted successfully!');
    } catch (error) {
      showError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Event Reviews</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-14">Berlin Techno Festival 2025</p>
        </div>

        {/* Access Control Banner */}
        {!accessGranted && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl flex items-start gap-4">
            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">Review Access Restricted</p>
              <p className="text-amber-800 dark:text-amber-300 text-sm">{accessDenialReason}</p>
              {accessDenialReason.includes('hours') && (
                <p className="text-amber-700 dark:text-amber-400 text-xs mt-2">Reviews help other attendees make informed decisions!</p>
              )}
            </div>
          </div>
        )}

        {/* Review Form */}
        {accessGranted && (
          <div className="mb-12 p-8 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Share Your Experience</h2>

            {/* Rating Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rate this event</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Your review (minimum 10 characters)</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about your experience at the event. What did you enjoy? Any suggestions?"
                className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition resize-none"
                rows={5}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{reviewText.length} characters</p>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add pictures (optional, max 5)</label>
              <div className="flex gap-3 flex-wrap mb-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {uploadedImages.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-400 transition">
                    <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitReview}
              disabled={submitting || rating === 0 || reviewText.trim().length < 10}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold transition-all duration-300 hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length} Reviews</h2>
          </div>

          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="p-6 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition">
                {/* Author Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{review.author}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Title & Content */}
                <p className="font-semibold text-gray-900 dark:text-white mb-2">{review.title}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{review.content}</p>

                {/* Images */}
                {review.images.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {review.images.map((image, idx) => (
                      <img key={idx} src={image} alt={`Review ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-800" />
                    ))}
                  </div>
                )}

                {/* Helpful Button */}
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded-lg border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-green-500 dark:hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 font-semibold text-sm transition flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
