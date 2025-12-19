'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSelector } from './LanguageSelector';
import { ConnectWallet } from './ConnectWallet';
import { Bell } from 'lucide-react';

export function Header() {
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setHasNotifications(Array.isArray(data) && data.length > 0);
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkNotifications();
    // Check for new notifications every 30 seconds
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 focus:outline-none">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            VP
          </div>
          <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VeilPass
          </span>
        </Link>

        {/* Navigation Links (optional, can expand) */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link href="/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
            Dashboard
          </Link>
          <Link href="/events" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
            Events
          </Link>
          <Link href="/auctions" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
            Auctions
          </Link>
        </nav>

        {/* Right side: Notifications + Language + Theme + Connect Wallet */}
        <div className="flex items-center gap-4">
          <Link
            href="/notifications"
            className="relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Link>
          <LanguageSelector />
          <ThemeSwitcher />
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
