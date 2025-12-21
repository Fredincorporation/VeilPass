'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Zap, Shield, Users } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { formatDate } from '@/lib/date-formatter';
import { formatAddress } from '@/lib/utils';
import { isValidOrganizerAddress } from '@/lib/organizer-utils';

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const { data: allEvents = [] } = useEvents();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Event Organizer',
      content: 'VeilPass changed how we manage ticket sales. Privacy and security are no longer afterthoughts.',
      avatar: '👩‍💼',
    },
    {
      name: 'Marcus Johnson',
      role: 'Music Festival Director',
      content: 'The encrypted auction system is genius. Our resale market has never been more secure.',
      avatar: '👨‍💼',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Ticket Collector',
      content: 'Finally, a platform that respects my privacy while letting me enjoy live events.',
      avatar: '👩‍🦰',
    },
  ];

  // Use events from database, filter out rejected events, show only first few
  const featuredEvents = allEvents.filter((event: any) => event.status !== 'Rejected').slice(0, 9);

  return (
    <>
      {/* Hero Section - Premium & Unique */}
      <section className="relative min-h-screen pt-24 pb-20 px-4 overflow-hidden flex items-center">
        {/* Animated gradient orbs background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-600/40 via-purple-600/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tl from-pink-600/40 via-purple-600/30 to-transparent rounded-full blur-3xl"
            style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) 1s infinite' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl"
            style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) 2s infinite' }}
          />

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.01)_1px,transparent_1px)]" />
        </div>

        <div className="max-w-6xl mx-auto w-full text-center">
          {/* Badge with glow */}
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-sm font-semibold border border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/20">
            🔒 Encrypted Privacy • Blockchain Verified • Zama fhEVM Powered
          </div>

          {/* Main heading with animated gradient */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              The Private Way
            </span>
            <br />
            <span className="inline-block text-gray-900 dark:text-white">
              to
            </span>
            {' '}
            <span
              className="inline-block bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
              style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) 0.5s infinite' }}
            >
              Public Events
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Experience encrypted ticketing with <span className="font-bold text-blue-600 dark:text-blue-400">blind auctions</span>, <span className="font-bold text-purple-600 dark:text-purple-400">homomorphic pricing</span>, and <span className="font-bold text-pink-600 dark:text-pink-400">MEV-resistant resales</span>. Your privacy is our foundation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/events"
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg overflow-hidden shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/75 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Explore Events <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/auctions"
              className="group px-8 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold text-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              🎯 Browse Auctions
            </Link>
          </div>

          {/* Stats with animated counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              { label: 'Encrypted Tickets', value: '50K+' },
              { label: 'On Sale Events', value: '1.2K+' },
              { label: 'Protected Users', value: '25K+' },
              { label: 'Privacy Score', value: '99.8%' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all group"
              >
                <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Featured Events Carousel - 3 Cards Continuous */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Featured Events</h2>
            <div className="relative px-16">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div 
                  className="flex gap-6 transition-transform duration-700 ease-out"
                  style={{
                    transform: `translateX(calc(-${(currentEventIndex % featuredEvents.length) * 33.33}% - ${(currentEventIndex % featuredEvents.length) * 1.5}rem))`
                  }}
                >
                  {/* Infinite loop - duplicate all events 3 times */}
                  {[...featuredEvents, ...featuredEvents, ...featuredEvents].map((event, i) => {
                    // Calculate occupancy from capacity and tickets_sold
                    const capacity = event.capacity || 0;
                    const ticketsSold = event.tickets_sold || 0;
                    const capacityPercent = capacity > 0 ? Math.min((ticketsSold / capacity) * 100, 100) : 0;
                    return (
                      <div 
                        key={i} 
                        className="flex-shrink-0 w-full md:w-1/3 px-3 flex"
                      >
                        <div className="relative group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 flex flex-col w-full">
                          {/* Image container */}
                          <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                            <img 
                              src={event.image} 
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          </div>

                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 z-10 pointer-events-none" />

                          {/* Content - grows to fill available space */}
                          <div className="relative p-5 z-20 flex flex-col flex-grow">
                            <div className="flex items-start justify-between mb-4 gap-3 flex-shrink-0">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm md:text-base mb-1 text-gray-900 dark:text-white line-clamp-2">{event.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">📍 {event.location}</p>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                                event.status === 'On Sale' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                                event.status === 'Pre-Sale' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
                                'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                              }`}>
                                {event.status}
                              </span>
                            </div>

                            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800 flex-grow">
                              <p className="text-xs text-gray-600 dark:text-gray-400">📅 {formatDate(event.date)}</p>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">🎫 {event.capacity}</p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300" style={{width: `${capacityPercent}%`}} />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 mt-auto flex-shrink-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Base Price:</span>
                                <span className="font-bold text-xs text-blue-600 dark:text-blue-400">${event.base_price || 'TBD'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Organizer:</span>
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold truncate">{isValidOrganizerAddress(event.organizer) ? formatAddress(event.organizer) : (event.organizer || 'TBD')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => setCurrentEventIndex((prev) => prev - 1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-110 shadow-lg z-20"
                aria-label="Previous events"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentEventIndex((prev) => prev + 1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-110 shadow-lg z-20"
                aria-label="Next events"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Carousel Indicators */}
              <div className="flex gap-2 justify-center mt-8">
                {Array.from({ length: featuredEvents.length }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentEventIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentEventIndex % featuredEvents.length
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 dark:bg-gray-700 w-2'
                    }`}
                    aria-label={`Go to event ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Why Choose VeilPass?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                icon: Shield,
                title: 'Encrypted Everything',
                desc: 'Your ticket data is encrypted on-chain using Zama fhEVM. Complete privacy guaranteed.',
              },
              {
                icon: Zap,
                title: 'Blind Auctions',
                desc: 'Bid securely with encrypted amounts. No one knows your bid until auction closes.',
              },
              {
                icon: Zap,
                title: 'Fair Pricing',
                desc: 'Dynamic pricing based on encrypted demand. Transparent, tamper-proof economics.',
              },
              {
                icon: Users,
                title: 'Community Trust',
                desc: 'Government ID verification and dispute resolution. Safe for buyers and sellers.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Private Events?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users enjoying encrypted ticketing with VeilPass.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 rounded-lg bg-white text-purple-600 font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-950 to-black text-gray-300 py-16 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">VeilPass</h3>
              <p className="text-sm text-gray-400 mb-4">The private way to public events.</p>
              <p className="text-xs text-gray-500">Built on Base Sepolia using Zama fhEVM for encrypted ticketing.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/events" className="text-gray-400 hover:text-white transition">Browse Events</Link></li>
                <li><Link href="/auctions" className="text-gray-400 hover:text-white transition">Blind Auctions</Link></li>
                <li><Link href="/loyalty" className="text-gray-400 hover:text-white transition">Loyalty Rewards</Link></li>
                <li><Link href="/tickets" className="text-gray-400 hover:text-white transition">My Tickets</Link></li>
              </ul>
            </div>

            {/* For Creators */}
            <div>
              <h4 className="font-semibold text-white mb-4">For Creators</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/sellers/register" className="text-gray-400 hover:text-white transition">Become a Seller</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>

            {/* Smart Contract & Verification */}
            <div>
              <h4 className="font-semibold text-white mb-4">Smart Contract</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://repo.sourcify.dev/contracts/full_match/84532/0xFa7014906a7f7788F2bF75A7eD50911d62211407/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                  >
                    Sourcify Verification ↗
                  </a>
                </li>
                <li>
                  <a 
                    href="https://base-sepolia.basescan.org/address/0xFa7014906a7f7788F2bF75A7eD50911d62211407" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                  >
                    Basescan Explorer ↗
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/Fredincorporation/VeilPass" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                  >
                    GitHub Repo ↗
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources & Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://docs.zama.ai/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                  >
                    Zama Docs ↗
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/zama-ai/fhevm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                  >
                    fhEVM GitHub ↗
                  </a>
                </li>
                <li>
                  <a 
                    href="https://docs.base.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                  >
                    Base Docs ↗
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 py-8 mb-8">
            {/* Network & Contract Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Network</p>
                <p className="text-sm font-mono text-blue-400">Base Sepolia (84532)</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Contract Address</p>
                <p className="text-sm font-mono text-purple-400">0xFa7014...d62211407</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Built With</p>
                <p className="text-sm font-mono text-pink-400">Zama fhEVM • Next.js • Hardhat</p>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-xs text-gray-500">&copy; 2025 VeilPass. Built with 🔒 and ❤️ for privacy-preserving events.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition" title="Twitter">
                  𝕏
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 transition" title="Discord">
                  💬
                </a>
                <a href="https://github.com/Fredincorporation/VeilPass" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition" title="GitHub">
                  🐙
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </>
  );
}
