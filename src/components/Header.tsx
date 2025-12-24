'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSelector } from './LanguageSelector';
import { ConnectWallet } from './ConnectWallet';
import { Bell, Menu, X } from 'lucide-react';
import AdminNotificationsBell from './AdminNotificationsBell';

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
}

export function Header() {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for wallet connect/disconnect events
  useEffect(() => {
    const handleWalletConnected = () => {
      const wallet = localStorage.getItem('veilpass_account');
      const role = readCookie('veilpass_role');
      setUserWallet(wallet);
      setUserRole(role);
      setMobileMenuOpen(false); // Close mobile menu on connect
    };

    const handleWalletDisconnected = () => {
      setUserWallet(null);
      setUserRole(null);
      setMobileMenuOpen(false); // Close mobile menu on disconnect
    };

    window.addEventListener('walletConnected', handleWalletConnected);
    window.addEventListener('walletDisconnected', handleWalletDisconnected);

    return () => {
      window.removeEventListener('walletConnected', handleWalletConnected);
      window.removeEventListener('walletDisconnected', handleWalletDisconnected);
    };
  }, []);

  useEffect(() => {
    const wallet = localStorage.getItem('veilpass_account');
    const role = readCookie('veilpass_role');
    setUserWallet(wallet);
    setUserRole(role);

    const checkNotifications = async () => {
      try {
        if (!wallet) {
          setHasNotifications(false);
          return;
        }

        const url = `/api/notifications?user=${encodeURIComponent(wallet)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Only show bell if there are unread notifications
          const unreadNotifications = Array.isArray(data) && data.filter((n: any) => !n.read).length > 0;
          setHasNotifications(unreadNotifications);
        } else {
          setHasNotifications(false);
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
        setHasNotifications(false);
      }
    };

    checkNotifications();
    // Check for new notifications every 30 seconds for faster updates
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        {/* Mobile and Desktop layout */}
        <div className="flex items-center justify-between">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 focus:outline-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                VP
              </div>
              <span className="font-bold text-base sm:text-xl hidden xs:inline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VeilPass
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
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

          {/* Right side: Notifications + Language + Theme + Connect Wallet (compact on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Show admin notifications if user is admin */}
            {userRole === 'admin' && userWallet ? (
              <AdminNotificationsBell adminWallet={userWallet} />
            ) : (
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
            )}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            <ThemeSwitcher />
            <ConnectWallet />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-2.5 pb-2.5 border-t border-gray-200 dark:border-gray-800 pt-2.5 space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/events"
              className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/auctions"
              className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Auctions
            </Link>
            <div className="px-3 py-2 block sm:hidden">
              <LanguageSelector />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

