'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, Search, Filter, Plus } from 'lucide-react';
import { useDisputes, useCreateDispute, useUpdateDispute } from '@/hooks/useDisputes';
import { useDisputeMessages, useSendDisputeMessage } from '@/hooks/useDisputeMessages';
import { useWalletAuthentication } from '@/hooks/useWalletAuthentication';
import { useToast } from '@/components/ToastContainer';
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/date-formatter';

// Dispute Card Component - Separated to allow proper hook usage
function DisputeCard({
  dispute,
  isAdmin,
  onViewReason,
  onOpenMessages,
  getStatusColor,
  getStatusIcon,
  getStatusBadgeColor,
  getLastAdminMessage,
  hasUnrepliedMessages,
}: any) {
  // Hooks can now be safely called here (not in a loop)
  const { data: disputeMessages = [] } = useDisputeMessages(dispute.id);
  
  const lastAdminMsg = getLastAdminMessage(disputeMessages);
  const hasUnread = hasUnrepliedMessages(disputeMessages);

  return (
    <div
      className={`group relative bg-white dark:bg-gray-900 rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${getStatusColor(
        dispute.status
      )}`}
    >
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-start gap-4">
          <div className="pt-1">{getStatusIcon(dispute.status)}</div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Ticket ID: {dispute.ticket_id}</h3>
              <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getStatusBadgeColor(dispute.status)}`}>
                {dispute.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-mono">Dispute ID: {dispute.id}</span>
              <span>Reason: {dispute.reason}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Status</p>
          <p className="font-semibold text-gray-900 dark:text-white">{dispute.status}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Timeline</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Created: {formatDate(dispute.created_at)} • Updated: {formatDate(dispute.updated_at)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Description</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{dispute.description || 'No description provided'}</p>
      </div>

      {/* Last Admin Message Section */}
      {lastAdminMsg && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-2">Last Message from Admin</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{lastAdminMsg.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDateTime(lastAdminMsg.created_at)}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
        {dispute.status === 'REJECTED' && (
          <button
            onClick={() => onViewReason(dispute)}
            className="px-4 py-2 rounded-lg border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            View Reason
          </button>
        )}

        {/* Open Messages Button - Show for all users except RESOLVED and REJECTED */}
        {dispute.status !== 'RESOLVED' && dispute.status !== 'REJECTED' && (
          <button
            onClick={() => onOpenMessages(dispute)}
            className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition flex items-center gap-2"
          >
            Messages
            {hasUnread && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                1
              </span>
            )}
          </button>
        )}

        {/* Add Update Button - Only for Admins */}
        {isAdmin && (
          <button
            onClick={() => onOpenMessages(dispute)}
            className="px-4 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition"
          >
            Add Update
          </button>
        )}
      </div>
    </div>
  );
}

export default function DisputesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved' | 'rejected'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
  });
  const [messageData, setMessageData] = useState({
    message: '',
    status: 'OPEN',
  });

  // Fetch user's disputes from database
  const { data: disputes = [], isLoading } = useDisputes(account || '');
  const { mutate: createDispute } = useCreateDispute();
  const { mutate: updateDispute } = useUpdateDispute();
  const { showSuccess, showError } = useToast();
  
  // Get user role for admin check
  const { user } = useWalletAuthentication(account);
  const isAdmin = user?.role === 'admin';
  
  // Fetch messages for selected dispute
  const { data: messages = [] } = useDisputeMessages(selectedDispute?.id || null);
  const { mutate: sendMessage } = useSendDisputeMessage();

  useEffect(() => {
    const savedAccount = localStorage.getItem('veilpass_account');
    setAccount(savedAccount);
    console.log('[DisputesPage] Loaded account:', savedAccount);
  }, []);

  // Debug hook to log disputes updates
  useEffect(() => {
    console.log('[DisputesPage] Disputes updated:', disputes, 'Loading:', isLoading);
  }, [disputes, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      showError('Please connect your wallet first');
      return;
    }

    if (!formData.reason) {
      showError('Please fill in all required fields');
      return;
    }

    // Generate a ticket ID (can be anything - will be converted to UUID on backend)
    const generatedTicketId = `TICKET-${Date.now()}`;

    // Call the mutation to create dispute
    createDispute(
      {
        user_address: account,
        ticket_id: generatedTicketId,
        reason: formData.reason,
        description: formData.description,
      } as any,
      {
        onSuccess: () => {
          showSuccess('Dispute created successfully!');
          setFormData({ reason: '', description: '' });
          setShowModal(false);
        },
        onError: () => {
          showError('Failed to create dispute. Please try again.');
        },
      }
    );
  };

  const handleViewReason = (dispute: any) => {
    setSelectedDispute(dispute);
    setShowReasonModal(true);
  };

  const handleOpenMessages = (dispute: any) => {
    setSelectedDispute(dispute);
    setMessageData({ message: '', status: dispute.status });
    setShowMessageModal(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDispute || !messageData.message.trim()) {
      showError('Please enter a message');
      return;
    }

    if (!account) {
      showError('Please connect your wallet first');
      return;
    }

    const isStatusChange = messageData.status !== selectedDispute.status;

    // Send message to database
    sendMessage(
      {
        dispute_id: selectedDispute.id,
        sender_address: account,
        sender_role: isAdmin ? 'admin' : 'user',
        message: messageData.message,
        status: isStatusChange ? messageData.status : null,
        is_status_change: isStatusChange,
      } as any,
      {
        onSuccess: () => {
          // If admin changed status, update the dispute
          if (isAdmin && isStatusChange) {
            updateDispute(
              {
                id: selectedDispute.id,
                status: messageData.status,
              },
              {
                onSuccess: () => {
                  showSuccess('Message sent and status updated!');
                  setSelectedDispute({ ...selectedDispute, status: messageData.status });
                  setMessageData({ message: '', status: messageData.status });
                },
                onError: () => {
                  showError('Failed to update dispute status.');
                },
              }
            );
          } else {
            showSuccess('Message sent successfully!');
            setMessageData({ message: '', status: messageData.status });
          }
        },
        onError: () => {
          showError('Failed to send message. Please try again.');
        },
      }
    );
  };

  const getLastAdminMessage = (messages: any[]) => {
    return messages
      .filter((m) => m.sender_role === 'admin')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const hasUnrepliedMessages = (messages: any[]) => {
    if (messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    return lastMessage.sender_role === 'admin' && !isAdmin;
  };

  const filteredDisputes = disputes.filter((dispute: any) => {
    const matchesSearch =
      dispute.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.id?.toString().includes(searchTerm.toLowerCase()) ||
      dispute.reason?.toLowerCase().includes(searchTerm.toLowerCase());
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
            {filteredDisputes.map((dispute: any) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                isAdmin={isAdmin}
                onViewReason={handleViewReason}
                onOpenMessages={handleOpenMessages}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                getStatusBadgeColor={getStatusBadgeColor}
                getLastAdminMessage={getLastAdminMessage}
                hasUnrepliedMessages={hasUnrepliedMessages}
              />
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

        {/* View Reason Modal */}
        {showReasonModal && selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rejection Reason</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Dispute #{selectedDispute.id}</p>
                  </div>
                  <button
                    onClick={() => setShowReasonModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Reason:</p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedDispute.reason}</p>
                </div>

                {selectedDispute.description && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Additional Details</p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedDispute.description}</p>
                  </div>
                )}

                <button
                  onClick={() => setShowReasonModal(false)}
                  className="w-full px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Center Modal */}
        {showMessageModal && selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Message Center</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Dispute #{selectedDispute.id} • Status: {selectedDispute.status}</p>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_role === 'admin' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender_role === 'admin'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-900 dark:text-white'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="font-semibold text-xs mb-1 opacity-75">{msg.sender_role === 'admin' ? 'Admin' : 'You'}</p>
                        <p className="text-sm">{msg.message}</p>
                        {msg.is_status_change && (
                          <p className="text-xs mt-2 font-semibold text-blue-600 dark:text-blue-400">
                            Status changed to: {msg.status}
                          </p>
                        )}
                        <p className="text-xs mt-2 opacity-50">{formatDateTime(msg.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              {selectedDispute.status !== 'REJECTED' ? (
                <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={messageData.message}
                      onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                      placeholder="Type your message here..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                    />
                  </div>

                  {/* Admin Status Change Option */}
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                        Update Status (Optional)
                      </label>
                      <select
                        value={messageData.status}
                        onChange={(e) => setMessageData({ ...messageData, status: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition"
                      >
                        <option value={selectedDispute.status}>No Change</option>
                        <option value="OPEN">Open</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowMessageModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:shadow-lg"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-red-50 dark:bg-red-900/20">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    This dispute has been rejected and no further messages can be sent.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
