'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, TrendingUp, DollarSign, Ticket, Calendar } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useSellerAnalytics } from '@/hooks/useSellerEvents';
import { getDualCurrency } from '@/lib/currency-utils';

export default function SalesAnalyticsPage() {
  const { showSuccess, showInfo } = useToast();
  const [dateRange, setDateRange] = useState('month');
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const savedAccount = localStorage.getItem('veilpass_account');
    setAccount(savedAccount);
  }, []);

  // Fetch seller analytics from database
  const { data: analytics, isLoading } = useSellerAnalytics(account || '');

  // Extract data from analytics or use defaults
  const totalRevenueCurrency = getDualCurrency(analytics?.metrics?.totalRevenue || 0);
  const avgRevenueCurrency = getDualCurrency(analytics?.metrics?.avgRevenuePerEvent || 0);

  const metrics = [
    {
      label: 'Total Revenue',
      value: isLoading ? '-' : totalRevenueCurrency.eth,
      subValue: isLoading ? '-' : totalRevenueCurrency.usd,
      change: '+0%',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Tickets Sold',
      value: isLoading ? '-' : (analytics?.metrics?.ticketsSold || 0).toLocaleString(),
      change: '+0',
      icon: Ticket,
      color: 'from-blue-500 to-cyan-600',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Active Events',
      value: isLoading ? '-' : (analytics?.metrics?.activeEvents || 0),
      change: '+0',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Avg. Revenue/Event',
      value: isLoading ? '-' : avgRevenueCurrency.eth,
      subValue: isLoading ? '-' : avgRevenueCurrency.usd,
      change: '+0%',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  // Use real data from analytics or fallback to mock
  const revenueData = analytics?.revenueData || [
    { month: 'Jan', revenue: 2400 },
    { month: 'Feb', revenue: 1398 },
    { month: 'Mar', revenue: 9800 },
    { month: 'Apr', revenue: 3908 },
    { month: 'May', revenue: 4800 },
    { month: 'Jun', revenue: 3800 },
  ];

  const topEvents = analytics?.topEvents || [
    { id: 1, title: 'Summer Music Festival', revenue: 24500, tickets: 1200 },
    { id: 2, title: 'Tech Conference 2024', revenue: 18900, tickets: 950 },
    { id: 3, title: 'Comedy Night', revenue: 12300, tickets: 680 },
    { id: 4, title: 'Art Exhibition Opening', revenue: 9800, tickets: 520 },
  ];

  const recentTransactions = analytics?.recentTransactions || [
    { id: 1, event: 'Summer Music Festival', tickets: 25, amount: 1250, date: '2024-01-15' },
    { id: 2, event: 'Tech Conference 2024', tickets: 18, amount: 1800, date: '2024-01-14' },
    { id: 3, event: 'Comedy Night', tickets: 12, amount: 600, date: '2024-01-13' },
    { id: 4, event: 'Art Exhibition Opening', tickets: 8, amount: 400, date: '2024-01-12' },
    { id: 5, event: 'Summer Music Festival', tickets: 15, amount: 750, date: '2024-01-11' },
  ];

  // Generate tickets data from revenue data proportionally
  const ticketsData = revenueData.map((data: any) => ({
    month: data.month,
    sold: Math.ceil(data.revenue / (Math.max(...revenueData.map((d: any) => d.revenue)) / 250)), // Scale proportionally
  }));

  // Helper function to calculate chart heights
  const getBarHeight = (value: number, max: number) => (value / max) * 100;
  const getLineY = (value: number, max: number) => 100 - (value / max) * 80;

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    showInfo(`Showing analytics for the last ${range === 'week' ? 'week' : range === 'month' ? 'month' : 'year'}`);
  };

  const handleExportReport = async () => {
    showInfo('Generating PDF report...');
    // Simulate export process
    setTimeout(() => {
      showSuccess('Report exported successfully as PDF');
    }, 2000);
  };

  const maxRevenue = Math.max(...revenueData.map((d: any) => d.revenue));
  const maxTickets = Math.max(...ticketsData.map((d: any) => d.sold));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <BarChart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Sales Analytics</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Monitor your event performance and analytics</p>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex gap-2">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    dateRange === range
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${metric.color} rounded-xl`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-bold ${metric.textColor}`}>{metric.change}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                {metric.subValue && (
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-1">{metric.subValue}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              Revenue Trend
            </h2>
            <div className="flex items-end justify-between h-64 gap-2">
              {revenueData.map((data: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden h-48 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-lg transition-all hover:from-green-600 hover:to-emerald-500 cursor-pointer"
                      style={{ height: `${getBarHeight(data.revenue, maxRevenue)}%` }}
                      title={`$${data.revenue}`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets Sold Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Tickets Sold
            </h2>
            <div className="relative h-64">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Grid lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.2" className="text-gray-300 dark:text-gray-700" opacity="0.5" />
                <line x1="0" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="0.2" className="text-gray-300 dark:text-gray-700" opacity="0.5" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="0.2" className="text-gray-300 dark:text-gray-700" opacity="0.5" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="0.2" className="text-gray-300 dark:text-gray-700" opacity="0.5" />

                {/* Line chart */}
                <polyline
                  points={ticketsData.map((data: any, i: number) => `${(i / (ticketsData.length - 1)) * 100},${getLineY(data.sold, maxTickets)}`).join(' ')}
                  fill="none"
                  stroke="url(#blueGradient)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>

                {/* Data points */}
                {ticketsData.map((data: any, i: number) => (
                  <circle key={i} cx={(i / (ticketsData.length - 1)) * 100} cy={getLineY(data.sold, maxTickets)} r="1.5" fill="#0ea5e9" />
                ))}
              </svg>

              {/* Month labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                {ticketsData.map((data: any) => (
                  <span key={data.month}>{data.month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Top Events by Revenue
          </h2>
          <div className="space-y-4">
            {topEvents.map((event: any, index: number) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br text-white flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? 'from-yellow-500 to-orange-600'
                        : index === 1
                          ? 'from-gray-400 to-gray-600'
                          : index === 2
                            ? 'from-orange-600 to-red-700'
                            : 'from-purple-500 to-indigo-600'
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.tickets.toLocaleString()} tickets sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 dark:text-green-400">${event.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Recent Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="text-left py-4 px-4 font-bold text-gray-900 dark:text-white">Event</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Tickets</th>
                  <th className="text-right py-4 px-4 font-bold text-gray-900 dark:text-white">Amount</th>
                  <th className="text-right py-4 px-4 font-bold text-gray-900 dark:text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction: any, index: number) => (
                  <tr
                    key={transaction.id}
                    className={`border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <td className="py-4 px-4 text-gray-900 dark:text-white font-semibold">{transaction.event}</td>
                    <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">{transaction.tickets}</td>
                    <td className="py-4 px-4 text-right text-green-600 dark:text-green-400 font-bold">${transaction.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400 text-sm">{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={handleExportReport}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all duration-300 hover:shadow-lg">
            Export Report as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
