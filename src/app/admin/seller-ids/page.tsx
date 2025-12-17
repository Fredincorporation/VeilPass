'use client';

import React, { useState } from 'react';
import { Shield, Search, Filter, CheckCircle, Clock, AlertCircle, Download, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminSellerIDsPage() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [verificationMode, setVerificationMode] = useState<'encrypted' | 'details'>('encrypted');
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [sellers] = useState([
    {
      id: 'S001',
      name: 'John Events',
      email: 'john@example.com',
      businessType: 'Concert Promoter',
      idType: 'Passport',
      submittedAt: '2025-01-15',
      status: 'PENDING',
      encryptedID: 'fhEVM_0x7f8c9a...',
      verificationScore: null,
      location: 'New York, USA',
      age: null,
    },
    {
      id: 'S002',
      name: 'Sarah Concerts',
      email: 'sarah@example.com',
      businessType: 'Event Organizer',
      idType: 'Driver License',
      submittedAt: '2025-01-10',
      status: 'VERIFIED',
      encryptedID: 'fhEVM_0x3d2b1e...',
      verificationScore: 98,
      location: 'Los Angeles, USA',
      age: 28,
    },
    {
      id: 'S003',
      name: 'Tech Events Co.',
      email: 'tech@example.com',
      businessType: 'Conference Organizer',
      idType: 'National ID',
      submittedAt: '2025-01-12',
      status: 'PROCESSING',
      encryptedID: 'fhEVM_0x9e4a5c...',
      verificationScore: null,
      location: 'San Francisco, USA',
      age: null,
    },
    {
      id: 'S004',
      name: 'Festival Masters',
      email: 'festivals@example.com',
      businessType: 'Event Promoter',
      idType: 'Passport',
      submittedAt: '2025-01-08',
      status: 'REJECTED',
      encryptedID: 'fhEVM_0x2c7f4d...',
      verificationScore: 34,
      location: 'Chicago, USA',
      age: null,
    },
  ]);

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = 
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || seller.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedSeller = sellers.find(s => s.id === selectedSellerId);

  const handleDecryptVerification = async () => {
    if (!encryptionPassword.trim()) {
      showWarning('Please enter decryption password');
      return;
    }

    showInfo('Decrypting ID verification data using fhEVM...');
    
    // Simulate decryption process
    setTimeout(() => {
      showSuccess('ID successfully decrypted and verified using Zama fhEVM');
      setVerificationMode('details');
      setEncryptionPassword('');
    }, 2000);
  };

  const handleApproveID = () => {
    if (!selectedSeller) return;
    showSuccess(`Seller ID for ${selectedSeller.name} approved successfully`);
    setSelectedSellerId(null);
  };

  const handleRejectID = () => {
    if (!selectedSeller) return;
    showError(`Seller ID for ${selectedSeller.name} rejected. Reason recorded.`);
    setSelectedSellerId(null);
  };

  const handleDownloadReport = () => {
    showInfo('Generating verification report...');
    setTimeout(() => {
      showSuccess('Verification report downloaded as PDF');
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700';
      case 'PENDING':
        return 'from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-300 dark:border-amber-700';
      case 'PROCESSING':
        return 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-300 dark:border-blue-700';
      case 'REJECTED':
        return 'from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 border-red-300 dark:border-red-700';
      default:
        return 'from-gray-100 to-gray-100 dark:from-gray-800 dark:to-gray-800 border-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'PROCESSING':
        return <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'REJECTED':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-600/20 text-green-700 dark:text-green-300 border border-green-500/30';
      case 'PENDING':
        return 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-500/30';
      case 'PROCESSING':
        return 'bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-500/30';
      case 'REJECTED':
        return 'bg-red-600/20 text-red-700 dark:text-red-300 border border-red-500/30';
      default:
        return 'bg-gray-600/20 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Review Seller IDs</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-14">Verify seller identity using Zama fhEVM encryption technology</p>
          </div>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Seller List */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search seller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <div className="flex gap-2 flex-wrap">
                {['all', 'PENDING', 'PROCESSING', 'VERIFIED', 'REJECTED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      filterStatus === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredSellers.length > 0 ? (
                filteredSellers.map(seller => (
                  <button
                    key={seller.id}
                    onClick={() => {
                      setSelectedSellerId(seller.id);
                      setVerificationMode('encrypted');
                      setEncryptionPassword('');
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedSellerId === seller.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{seller.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{seller.id}</p>
                      </div>
                      {getStatusIcon(seller.status)}
                    </div>
                    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${getStatusBadgeColor(seller.status)}`}>
                      {seller.status}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No sellers found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Detail Panel */}
          <div className="lg:col-span-2">
            {selectedSeller ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
                {/* Seller Basic Info */}
                <div className={`bg-gradient-to-br ${getStatusColor(selectedSeller.status)} border-2 rounded-xl p-6 mb-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedSeller.name}</h2>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Email:</strong> {selectedSeller.email}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Business Type:</strong> {selectedSeller.businessType}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Location:</strong> {selectedSeller.location}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300"><strong>ID Type:</strong> {selectedSeller.idType}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Submitted:</strong> {selectedSeller.submittedAt}</p>
                      </div>
                    </div>
                    <span className={`inline-block text-sm font-bold px-4 py-2 rounded-lg ${getStatusBadgeColor(selectedSeller.status)}`}>
                      {selectedSeller.status}
                    </span>
                  </div>
                </div>

                {/* fhEVM Encrypted Data Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Zama fhEVM Encrypted Verification</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This ID data is encrypted using Zama's fully homomorphic encryption (fhEVM). Decrypt to verify authenticity, expiration, age, and blacklist status without storing sensitive information.
                  </p>

                  {verificationMode === 'encrypted' ? (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-lg p-6">
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Encrypted Hash:</p>
                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded break-all">
                          {selectedSeller.encryptedID}
                        </p>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Decryption Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={encryptionPassword}
                            onChange={(e) => setEncryptionPassword(e.target.value)}
                            placeholder="Enter decryption key..."
                            className="w-full pr-12 pl-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleDecryptVerification}
                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Zap className="w-5 h-5" />
                        Decrypt & Verify with fhEVM
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Verification Score</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {selectedSeller.verificationScore !== null ? `${selectedSeller.verificationScore}%` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Verified Age</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {selectedSeller.age !== null ? `${selectedSeller.age} yrs` : 'Pending'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Valid</span>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Not Expired</span>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Not Blacklisted</span>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setVerificationMode('encrypted');
                          setEncryptionPassword('');
                        }}
                        className="w-full px-4 py-2 rounded-lg border-2 border-green-400 text-green-700 dark:text-green-300 font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                      >
                        Close Verification
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleApproveID}
                    disabled={selectedSeller.status === 'VERIFIED'}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all duration-300 hover:shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Approve ID
                  </button>
                  <button
                    onClick={handleRejectID}
                    disabled={selectedSeller.status === 'REJECTED'}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all duration-300 hover:shadow-lg"
                  >
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Reject ID
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                <Shield className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">Select a seller to review their ID verification</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Use the fhEVM decryption to verify authenticity without storing sensitive data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
