'use client';

import React, { useState, useEffect } from 'react';
import { Gavel, Search, Filter, MessageSquare, CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useAdminDisputes, useUpdateDisputeStatus } from '@/hooks/useAdmin';
import { useDisputeMessages, useSendDisputeMessage } from '@/hooks/useDisputeMessages';
import { useWalletAuthentication } from '@/hooks/useWalletAuthentication';

export default function AdminDisputesPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { userAddress } = useWalletAuthentication();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<number | null>(null);
  const [resolution, setResolution] = useState('');
  const [messageText, setMessageText] = useState('');

  // Fetch disputes from database
  const { data: disputes = [], isLoading } = useAdminDisputes(filterStatus === 'all' ? undefined : filterStatus);
  const { mutate: updateDisputeStatus } = useUpdateDisputeStatus();
  
  // Fetch messages for selected dispute
  const { data: messages = [], isLoading: messagesLoading } = useDisputeMessages(selectedDispute);
  const { mutate: sendMessage } = useSendDisputeMessage();

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = String(dispute.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dispute.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(dispute.ticket_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || dispute.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-800';
      case 'RESOLVED':
        return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-800';
      case 'REJECTED':
        return 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-800';
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

  const handleResolve = (disputeId: number, action: 'approve' | 'reject') => {
    if (!resolution.trim() && action === 'approve') {
      showError('Please enter a resolution note');
      return;
    }

    const newStatus = action === 'approve' ? 'RESOLVED' : 'REJECTED';
    
    updateDisputeStatus(
      {
        id: disputeId,
        status: newStatus,
        resolution: resolution.trim(),
      },
      {
        onSuccess: () => {
          if (action === 'approve') {
            showSuccess(`Dispute ${disputeId} has been resolved - refund approved`);
          } else {
            showSuccess(`Dispute ${disputeId} has been rejected - claimant notified`);
          }
          setSelectedDispute(null);
          setResolution('');
        },
        onError: () => {
          showError('Failed to update dispute status');
        },
      }
    );
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      showError('Please enter a message');
      return;
    }

    if (!selectedDispute) {
      showError('No dispute selected');
      return;
    }

    sendMessage(
      {
        dispute_id: selectedDispute,
        sender_address: userAddress || '0x0000000000000000000000000000000000000000',
        sender_role: 'admin',
        message: messageText.trim(),
        is_status_change: false,
      },
      {
        onSuccess: () => {
          showSuccess('Message sent successfully');
          setMessageText('');
        },
        onError: () => {
          showError('Failed to send message');
        },
      }
    );
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
              {['all', 'OPEN', 'RESOLVED', 'REJECTED'].map(status => (
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
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">Loading disputes...</p>
              </div>
            ) : filteredDisputes.length > 0 ? (
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
                        ? 'bg-blue-600 text-white'
                        : dispute.status === 'REJECTED'
                        ? 'bg-red-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}>
                      {dispute.status === 'OPEN' && <Clock className="w-3 h-3" />}
                      {dispute.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {dispute.status === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
                      {dispute.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Ticket ID</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{dispute.ticket_id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Created</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{dispute.created_at}</p>
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

          {/* Details Sidebar - Only show for OPEN disputes */}
          {selectedDispute && filteredDisputes.find(d => d.id === selectedDispute)?.status === 'OPEN' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 h-fit sticky top-24 max-h-[80vh] overflow-y-auto flex flex-col">
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

              {/* Messages Section */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800 flex-grow">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Messages ({messages.length})
                </h4>
                
                {messagesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Loading messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg text-sm ${
                          msg.sender_role === 'admin'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            msg.sender_role === 'admin'
                              ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {msg.sender_role === 'admin' ? 'Admin' : 'User'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-4">No messages yet</p>
                )}
              </div>

              {/* Send Message Form */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Send a message to the user..."
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition resize-none text-sm h-20"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-full mt-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all text-sm"
                >
                  Send Message
                </button>
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
