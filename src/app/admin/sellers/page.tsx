'use client';

import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, Upload, FileCheck, Calendar, Search, Filter, Eye, Loader } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useAdminSellers } from '@/hooks/useAdmin';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminSellersPage() {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Fetch sellers from database
  const { data: dbSellers = [], isLoading, refetch } = useAdminSellers(filterStatus === 'all' ? undefined : filterStatus);

  // Use live data from database
  const sellers = dbSellers;

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || seller.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = useCallback(async (sellerId: string, sellerName: string) => {
    setApprovingId(sellerId);
    try {
      const response = await fetch(`/api/admin/sellers?id=${sellerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (!response.ok) {
        const error = await response.json();
        showError(error.error || `Failed to approve ${sellerName}`);
        return;
      }

      showSuccess(`✅ ${sellerName} has been approved as a seller`);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['adminSellers'] });
    } catch (error) {
      showError(`Failed to approve ${sellerName}`);
      console.error(error);
    } finally {
      setApprovingId(null);
    }
  }, [showSuccess, showError, refetch, queryClient]);

  const handleReject = useCallback(async (sellerId: string, sellerName: string) => {
    setRejectingId(sellerId);
    try {
      const response = await fetch(`/api/admin/sellers?id=${sellerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      if (!response.ok) {
        const error = await response.json();
        showError(error.error || `Failed to reject ${sellerName}`);
        return;
      }

      showError(`⛔ Application from ${sellerName} has been rejected`);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['adminSellers'] });
    } catch (error) {
      showError(`Failed to reject ${sellerName}`);
      console.error(error);
    } finally {
      setRejectingId(null);
    }
  }, [showSuccess, showError, refetch, queryClient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-800';
      case 'PENDING':
        return 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-800';
      default:
        return 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <FileCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Seller Approvals</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Review and manage seller applications</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by seller name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 items-center flex-wrap">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              {['all', 'PENDING', 'APPROVED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterStatus === status
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {status === 'all' ? 'All Sellers' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sellers Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
            <p className="ml-4 text-gray-600 dark:text-gray-400">Loading sellers...</p>
          </div>
        ) : filteredSellers.length > 0 ? (
          <div className="space-y-6">
            {/* Detail view for expanded seller */}
            {expandedId && sellers.find(s => String(s.id) === expandedId) && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-blue-300 dark:border-blue-700 p-8 shadow-xl">
                {(() => {
                  const expandedSeller = sellers.find(s => String(s.id) === expandedId);
                  if (!expandedSeller) return null;
                  
                  return (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{expandedSeller.name}</h2>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Business Name</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{expandedSeller.name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Business Type</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{expandedSeller.businessType || 'Not specified'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Applied Date</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{expandedSeller.submittedAt}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Role</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{expandedSeller.role}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Seller Status</p>
                          <div className="flex items-center gap-2">
                            {expandedSeller.status === 'APPROVED' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Upload className="w-5 h-5 text-amber-600" />
                            )}
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{expandedSeller.status}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">KYC Status</p>
                          <div className="flex items-center gap-2">
                            {expandedSeller.kycStatus === 'VERIFIED' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : expandedSeller.kycStatus === 'REJECTED' ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <Upload className="w-5 h-5 text-amber-600" />
                            )}
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{expandedSeller.kycStatus}</span>
                          </div>
                        </div>
                      </div>

                      {expandedSeller.walletAddress && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Wallet Address</p>
                          <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{expandedSeller.walletAddress}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Grid of seller cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                className={`group relative bg-gradient-to-br ${getStatusColor(seller.status)} rounded-2xl border-2 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    seller.status === 'APPROVED'
                      ? 'bg-green-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}>
                    {seller.status === 'APPROVED' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    {seller.status}
                  </span>
                </div>

                {/* Seller Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{seller.name}</h3>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Applied: {seller.submittedAt}</span>
                  </div>
                  {seller.businessType && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Business:</span> {seller.businessType}
                    </div>
                  )}
                </div>

                {/* KYC Status */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">KYC Status</span>
                  <div className="flex items-center gap-1.5">
                    {seller.kycStatus === 'VERIFIED' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">Verified</span>
                      </>
                    ) : seller.kycStatus === 'REJECTED' ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">Rejected</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {seller.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(String(seller.id), seller.name)}
                      disabled={approvingId === String(seller.id)}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {approvingId === String(seller.id) ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(String(seller.id), seller.name)}
                      disabled={rejectingId === String(seller.id)}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {rejectingId === String(seller.id) ? (
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
                )}
                {seller.status === 'APPROVED' && (
                  <button 
                    onClick={() => setExpandedId(expandedId === seller.id ? null : String(seller.id))}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {expandedId === seller.id ? 'Hide Details' : 'View Details'}
                  </button>
                )}
              </div>
            ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4">
              <FileCheck className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No sellers found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
