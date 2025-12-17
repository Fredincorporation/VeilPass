'use client';

import React, { useState } from 'react';
import { Activity, Search, Filter, Download, Clock, User, Target, FileText } from 'lucide-react';

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const auditLogs = [
    {
      id: 1,
      action: 'EVENT_CREATED',
      actor: '0x3820...ba756b',
      target: 'Summer Music Fest',
      timestamp: '2025-01-15 14:30:00',
      details: 'Event created with 1000 tickets',
      icon: Activity,
      color: 'from-blue-500 to-cyan-600',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 2,
      action: 'TICKET_PURCHASED',
      actor: '0xe0cb...7354774',
      target: 'TK123',
      timestamp: '2025-01-15 15:45:00',
      details: 'Purchased for 285 ETH',
      icon: Activity,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 3,
      action: 'SELLER_APPROVED',
      actor: 'Admin-0x2f5...',
      target: 'John Events Co.',
      timestamp: '2025-01-14 09:20:00',
      details: 'KYC verified and seller approved',
      icon: Activity,
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const actionTypes = ['all', 'EVENT_CREATED', 'TICKET_PURCHASED', 'SELLER_APPROVED'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Track all system activities and transactions</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by action, actor, or target..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition"
              />
            </div>

            {/* Action Filter */}
            <div className="flex gap-2 items-center flex-wrap">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              {actionTypes.map(action => (
                <button
                  key={action}
                  onClick={() => setFilterAction(action)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterAction === action
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {action === 'all' ? 'All Actions' : action.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        {filteredLogs.length > 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Action</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Actor</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Target</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Timestamp</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-br ${log.color} rounded-lg`}>
                            <Activity className="w-4 h-4 text-white" />
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${log.textColor} bg-gradient-to-r ${log.color} bg-opacity-10`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{log.actor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{log.target}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{log.timestamp}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{log.details}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4">
              <Activity className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No logs found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your search filters</p>
          </div>
        )}

        {/* Export Button */}
        <div className="mt-8 flex justify-end">
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Logs
          </button>
        </div>
      </div>
    </div>
  );
}
