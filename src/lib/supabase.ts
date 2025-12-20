import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface User {
  id: string;
  wallet_address: string;
  role: 'customer' | 'seller' | 'admin';
  loyalty_points: number;
  business_name?: string;
  theme_preference?: 'light' | 'dark' | 'auto';
  language_preference?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketTier {
  id: number;
  event_id: number;
  name: string;
  description: string;
  price: number;
  available: number;
  sold: number;
  features: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  base_price: number;
  capacity: number;
  tickets_sold: number;
  status: 'Pre-Sale' | 'On Sale' | 'Almost Sold Out' | 'Finished';
  organizer: string;
  ticket_tiers?: TicketTier[];
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  event_id: number;
  owner_address: string;
  section: string;
  price: number;
  status: 'active' | 'upcoming' | 'sold' | 'transferred';
  created_at: string;
  event_title?: string;
}

export interface Auction {
  id: number;
  ticket_id: string;
  seller_address: string;
  start_bid: number;
  listing_price: number;
  reserve_price: number | null;
  duration_hours: number;
  end_time: string;
  status: 'active' | 'ended' | 'sold';
  created_at: string;
  event_title?: string;
  ticket_section?: string;
}

export interface Bid {
  id: number;
  auction_id: number;
  bidder_address: string;
  amount: number;
  encrypted: boolean;
  created_at: string;
}

export interface Dispute {
  id: number;
  ticket_id: string; // UUID
  user_address: string;
  reason: string;
  description: string | null;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface DisputeMessage {
  id: number;
  dispute_id: number;
  sender_address: string;
  sender_role: 'admin' | 'user';
  message: string;
  status: string | null;
  is_status_change: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: number;
  wallet_address: string;
  event_reminders: boolean;
  promotions: boolean;
  reviews: boolean;
  auctions: boolean;
  disputes: boolean;
  newsletter: boolean;
  news_and_updates: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlatformSettings {
  id: number;
  platform_name: string;
  platform_version: string;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  platform_fee_percentage: number;
  minimum_ticket_price: number;
  maximum_ticket_price: number;
  payout_threshold: number;
  enable_two_factor: boolean;
  max_login_attempts: number;
  session_timeout: number;
  require_kyc: boolean;
  enable_auctions: boolean;
  enable_disputes: boolean;
  enable_loyalty: boolean;
  updated_at: string;
}
