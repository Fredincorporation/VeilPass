'use client';

import React, { useState } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, Search, Filter, Plus } from 'lucide-react';

export default function DisputesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved' | 'rejected'>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ticketId: '',
    eventName: '',
    reason: '',
    description: '',
  });

  const [disputes, setDisputes] = useState([
    {
      id: 'D001',
      ticketId: 'TK123',
      event: 'Summer Music Fest',
      status: 'OPEN',
      reason: 'Ticket not received',
      description: 'I did not receive my ticket confirmation email',
      createdAt: '2025-01-15',
      updatedAt: '2025-01-15',
    },
    {
      id: 'D002',
      ticketId: 'TK456',
      event: 'Comedy Night',
      status: 'RESOLVED',
      reason: 'Event cancelled',
      description: 'Event was cancelled without notice',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-12',
    },
    {
      id: 'D003',
      ticketId: 'TK789',
      event: 'Art Expo 2025',
      status: 'OPEN',
      reason: 'Quality issue',
      description: 'Physical ticket has printing defect',
      createdAt: '2025-01-08',
      updatedAt: '2025-01-15',
    },
  ]);

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || dispute.status === filterStatus.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20';
      case 'RESOLVED':
        return 'border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/20';
      case 'REJECTED':
        return 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'RESOLVED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDispute = {
      id: `D${Math.floor(Math.random() * 10000)}`,
      ticketId: formData.ticketId,
      event: formData.eventName,
      status: 'OPEN',
      reason: formData.reason,
      description: formData.description,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDisputes([newDispute, ...disputes]);
    setFormData({ ticketId: '', eventName: '', reason: '', description: '' });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header with Icon */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Disputes</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage and track your disputes</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              Raise New Dispute
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by dispute ID, event, or ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 items-center flex-wrap">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('open')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'open'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'resolved'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Disputes List */}
        {filteredDisputes.length > 0 ? (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className={`group relative bg-white dark:bg-gray-900 rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${getStatusColor(
                  dispute.status
                )}`}
              >
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="pt-1">{getStatusIcon(dispute.status)}</div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{dispute.event}</h3>
                        <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getStatusBadgeColor(dispute.status)}`}>
                          {dispute.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-mono">Dispute ID: {dispute.id}</span>
                        <span>Ticket: {dispute.ticketId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Reason</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{dispute.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Timeline</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Created: {dispute.createdAt} • Updated: {dispute.updatedAt}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{dispute.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                  <button className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    View Details
                  </button>
                  {dispute.status === 'OPEN' && (
                    <button className="px-4 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition">
                      Add Update
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4">
              <AlertCircle className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No disputes found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {searchTerm ? 'Try adjusting your search' : 'You have no active disputes'}
            </p>
          </div>
        )}

        {/* Raise Dispute Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 dark:border-gray-800">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Raise a New Dispute</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Ticket ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ticketId}
                    onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
                    placeholder="e.g., TK001"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    placeholder="e.g., Summer Music Fest"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Reason
                  </label>
                  <select
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Ticket not received">Ticket not received</option>
                    <option value="Event cancelled">Event cancelled</option>
                    <option value="Quality issue">Quality issue</option>
                    <option value="Wrong ticket">Wrong ticket</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Please provide details about your dispute..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold transition-all duration-300 hover:shadow-lg"
                  >
                    Submit Dispute
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
