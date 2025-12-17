'use client';

import React, { useState } from 'react';
import { Gavel, Search, Filter, MessageSquare, CheckCircle, XCircle, Clock, Eye, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminDisputesPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const [disputes, setDisputes] = useState([
    {
      id: 'D001',
      ticketId: 'TK123',
      event: 'Summer Music Fest',
      status: 'OPEN',
      reason: 'Ticket not received',
      description: 'I did not receive my ticket confirmation email',
      claimant: 'john.doe@example.com',
      seller: 'Event Promoter Inc',
      createdAt: '2025-01-15',
      priority: 'HIGH',
      amount: '$285',
    },
    {
      id: 'D002',
      ticketId: 'TK456',
      event: 'Comedy Night',
      status: 'UNDER_REVIEW',
      reason: 'Event cancelled',
      description: 'Event was cancelled without proper notice',
      claimant: 'sarah.smith@example.com',
      seller: 'Comedy Org LLC',
      createdAt: '2025-01-12',
      priority: 'MEDIUM',
      amount: '$150',
    },
    {
      id: 'D003',
      ticketId: 'TK789',
      event: 'Art Expo 2025',
      status: 'OPEN',
      reason: 'Quality issue',
      description: 'Physical ticket has printing defect',
      claimant: 'mike.wilson@example.com',
      seller: 'Art Events Co',
      createdAt: '2025-01-10',
      priority: 'LOW',
      amount: '$95',
    },
  ]);

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dispute.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dispute.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || dispute.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-800';
      case 'UNDER_REVIEW':
        return 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-800';
      case 'RESOLVED':
        return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-800';
      default:
        return 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'MEDIUM':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'LOW':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const handleResolve = (disputeId: string, action: 'approve' | 'reject') => {
    if (!resolution.trim() && action === 'approve') {
      showError('Please enter a resolution note');
      return;
    }

    setDisputes(disputes.map(d => 
      d.id === disputeId 
        ? { ...d, status: action === 'approve' ? 'RESOLVED' : 'REJECTED' }
        : d
    ));

    if (action === 'approve') {
      showSuccess(`Dispute ${disputeId} has been resolved - refund approved`);
    } else {
      showError(`Dispute ${disputeId} has been rejected - claimant notified`);
    }

    setSelectedDispute(null);
    setResolution('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
              <Gavel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Resolve Disputes</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Review and mediate platform disputes and claims</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by dispute ID, event name, or ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 items-center flex-wrap">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              {['all', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterStatus === status
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {status === 'all' ? 'All Disputes' : status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Disputes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Disputes List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredDisputes.length > 0 ? (
              filteredDisputes.map((dispute) => (
                <div
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute.id)}
                  className={`group relative bg-gradient-to-br ${getStatusColor(dispute.status)} rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] ${
                    selectedDispute === dispute.id ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{dispute.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(dispute.priority)}`}>
                          {dispute.priority} PRIORITY
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{dispute.event}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      dispute.status === 'OPEN'
                        ? 'bg-red-600 text-white'
                        : dispute.status === 'UNDER_REVIEW'
                        ? 'bg-amber-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}>
                      {dispute.status === 'OPEN' && <Clock className="w-3 h-3" />}
                      {dispute.status === 'UNDER_REVIEW' && <Eye className="w-3 h-3" />}
                      {dispute.status === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
                      {dispute.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Ticket ID</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{dispute.ticketId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Amount</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{dispute.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Created</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{dispute.createdAt}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Claim Reason</p>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">{dispute.reason}</p>
                  </div>

                  {/* Parties */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Claimant</p>
                      <p className="text-sm text-gray-900 dark:text-white">{dispute.claimant}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Seller</p>
                      <p className="text-sm text-gray-900 dark:text-white">{dispute.seller}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Gavel className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">No disputes found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          {selectedDispute && filteredDisputes.find(d => d.id === selectedDispute) && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 h-fit sticky top-24">
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Dispute Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">ID: {selectedDispute}</p>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {filteredDisputes.find(d => d.id === selectedDispute)?.description}
                  </p>
                </div>
              </div>

              {/* Resolution Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-red-600" />
                    Resolution Note
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Enter your resolution decision and reasoning..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition resize-none h-32"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(selectedDispute, 'approve')}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleResolve(selectedDispute, 'reject')}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
