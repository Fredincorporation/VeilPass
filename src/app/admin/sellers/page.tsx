'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Upload, FileCheck, Mail, Calendar, Search, Filter, MoreVertical, Eye } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminSellersPage() {
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [sellers] = useState([
    {
      id: 'S001',
      name: 'John Events',
      email: 'john@example.com',
      status: 'PENDING',
      kycStatus: 'NOT_VERIFIED',
      submittedAt: '2025-01-15',
      businessType: 'Concert Promoter',
      location: 'New York, USA',
    },
    {
      id: 'S002',
      name: 'Sarah Concerts',
      email: 'sarah@example.com',
      status: 'APPROVED',
      kycStatus: 'VERIFIED',
      submittedAt: '2025-01-10',
      businessType: 'Event Organizer',
      location: 'Los Angeles, USA',
    },
    {
      id: 'S003',
      name: 'Tech Events Co.',
      email: 'tech@example.com',
      status: 'PENDING',
      kycStatus: 'VERIFIED',
      submittedAt: '2025-01-12',
      businessType: 'Conference Organizer',
      location: 'San Francisco, USA',
    },
  ]);

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          seller.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || seller.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (sellerId: string, sellerName: string) => {
    showSuccess(`${sellerName} has been approved as a seller`);
  };

  const handleReject = (sellerId: string, sellerName: string) => {
    showError(`Application from ${sellerName} has been rejected`);
  };

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
                placeholder="Search by seller name or email..."
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
        {filteredSellers.length > 0 ? (
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{seller.businessType}</p>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{seller.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Submitted: {seller.submittedAt}</span>
                  </div>
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
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {seller.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(seller.id, seller.name)}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(seller.id, seller.name)}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
                {seller.status === 'APPROVED' && (
                  <button className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                )}
              </div>
            ))}
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
