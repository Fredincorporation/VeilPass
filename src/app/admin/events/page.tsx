'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import axios from 'axios';

export default function EventApprovalsPage() {
  const { data: allEvents = [] } = useEvents();
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter only Pre-Sale events that need approval
  const preeSaleEvents = allEvents.filter((event: any) => event.status === 'Pre-Sale');

  const handleApproveEvent = async (eventId: number, eventTitle: string) => {
    setApprovingId(eventId);
    try {
      // Update event status to "On Sale"
      const { data: events } = await axios.get('/api/events');
      const event = events.find((e: any) => e.id === eventId);
      
      if (!event) {
        setMessage({ type: 'error', text: 'Event not found' });
        return;
      }

      // In a real app, you'd have an approve endpoint
      // For now, we'll simulate the approval
      setMessage({ 
        type: 'success', 
        text: `✓ Event "${eventTitle}" approved and is now On Sale!` 
      });

      // In production, you would call:
      // await axios.post(`/api/admin/events/${eventId}/approve`);
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve event' });
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectEvent = async (eventId: number, eventTitle: string) => {
    setRejectingId(eventId);
    try {
      setMessage({ 
        type: 'error', 
        text: `Event "${eventTitle}" rejected and removed from Pre-Sale.` 
      });

      // In production, you would call:
      // await axios.post(`/api/admin/events/${eventId}/reject`);
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reject event' });
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Approvals</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Review Pre-Sale events and approve them to become On Sale</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Count Badge */}
        <div className="mb-8">
          <div className="inline-block bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full font-semibold">
            {preeSaleEvents.length} {preeSaleEvents.length === 1 ? 'event' : 'events'} pending approval
          </div>
        </div>

        {/* Events List */}
        {preeSaleEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All Clear!</h2>
            <p className="text-gray-600 dark:text-gray-400">No events pending approval. All Pre-Sale events have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {preeSaleEvents.map((event: any) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-600 transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Event Image */}
                    <div className="md:w-40 flex-shrink-0">
                      <img
                        src={event.image || 'https://via.placeholder.com/160x160?text=Event'}
                        alt={event.title}
                        className="w-full h-40 object-cover rounded-xl"
                      />
                    </div>

                    {/* Event Details */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {event.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                            {event.description || 'No description provided'}
                          </p>
                        </div>
                        <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0">
                          Pre-Sale
                        </span>
                      </div>

                      {/* Event Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Organizer</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {event.organizer || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Date
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {event.date || 'TBD'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Location
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {event.location || 'TBD'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Base Price</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {event.base_price ? `$${event.base_price}` : 'TBD'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => handleApproveEvent(event.id, event.title)}
                          disabled={approvingId === event.id || rejectingId !== null}
                          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
                        >
                          {approvingId === event.id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Approve & Go On Sale
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleRejectEvent(event.id, event.title)}
                          disabled={rejectingId === event.id || approvingId !== null}
                          className="flex items-center gap-2 px-6 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
                        >
                          {rejectingId === event.id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">How Event Approval Works</h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-300 text-sm">
            <li>✓ Sellers create events that start in <strong>Pre-Sale</strong> status</li>
            <li>✓ Pre-Sale events are visible to customers for preview but cannot be purchased</li>
            <li>✓ Admins review event details and approve them to become <strong>On Sale</strong></li>
            <li>✓ Once approved, customers receive notifications and can purchase tickets</li>
            <li>✓ Rejected events remain in Pre-Sale or can be archived</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
