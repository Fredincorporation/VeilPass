'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart3, Users, AlertCircle, FileText, Shield, CheckCircle } from 'lucide-react';

export default function AdminPage() {
  const adminSections = [
    {
      title: 'Event Approvals',
      description: 'Review and approve Pre-Sale events to go On Sale',
      href: '/admin/events',
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Disputes',
      description: 'Manage and resolve user disputes',
      href: '/admin/disputes',
      icon: AlertCircle,
      color: 'from-red-500 to-orange-600',
    },
    {
      title: 'Sellers',
      description: 'Manage seller accounts and verification',
      href: '/admin/sellers',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Seller IDs',
      description: 'Verify seller KYC/ID documents',
      href: '/admin/seller-ids',
      icon: Shield,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and changes',
      href: '/admin/audit',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage platform operations and user disputes</p>
            </div>
          </div>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href}>
                <div className="h-full bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all cursor-pointer group">
                  <div className={`p-4 bg-gradient-to-br ${section.color} rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {section.title}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {section.description}
                  </p>

                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold group-hover:gap-3 transition-all">
                    <span>Go to {section.title}</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Platform Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">—</div>
              <p className="text-gray-600 dark:text-gray-400">Total Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">—</div>
              <p className="text-gray-600 dark:text-gray-400">Active Sellers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">—</div>
              <p className="text-gray-600 dark:text-gray-400">Open Disputes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">—</div>
              <p className="text-gray-600 dark:text-gray-400">Total Events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
