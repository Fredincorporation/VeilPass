export interface Ticket {
  id: string;
  event_id: string;
  event_title?: string;
  event_title_short?: string;
  date?: string;
  location?: string;
  section?: string;
  price?: number;
  owner_address?: string;
  created_at?: string;
  status?: string;
  events?: { date?: string } | null;
}

export interface Dispute {
  id: string | number;
  ticket_id: string;
  reason: string;
  description?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface DisputeMessage {
  id: string | number;
  dispute_id: string | number;
  sender_address: string;
  sender_role: 'admin' | 'user' | string;
  message: string;
  status?: string | null;
  is_status_change?: boolean;
  created_at?: string;
}

export interface Event {
  id: number | string;
  status?: string;
  title?: string;
  image?: string;
  description?: string;
  organizer?: string;
  date?: string;
  location?: string;
  base_price?: number;
}

export interface User {
  address?: string;
  role?: string;
}

export interface Auction {
  id: string | number;
  ticket_id: string | number;
  status?: string;
  highest_bid?: number;
  highest_bidder?: string;
  created_at?: string;
  updated_at?: string;
  tickets?: Ticket;
}

export interface Bid {
  id: string | number;
  auction_id: string | number;
  bidder_address: string;
  amount: number;
  timestamp?: string;
  created_at?: string;
}

export interface Wishlist {
  id: string | number;
  user_address: string;
  event_id: number | string;
  created_at?: string;
  events?: Event;
}

export interface AuditLog {
  id: string | number;
  action: string;
  target_type?: string;
  target_id?: string;
  user_address?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
  created_at?: string;
}

export interface SellerVerification {
  id: string | number;
  name: string;
  email?: string;
  businessType?: string;
  walletAddress?: string;
  submittedAt?: string;
  status?: string;
}

export interface AuditLogEntry {
  id: string | number;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  details?: string;
  color?: string;
  textColor?: string;
}

export interface RevenueData {
  event_id?: number | string;
  revenue: number;
  ticketsSold?: number;
  tickets_sold?: number;
  [key: string]: unknown;
}

export interface Seller {
  id: string | number;
  wallet_address: string;
  name?: string;
  status?: string;
  verified?: boolean;
  created_at?: string;
}

export interface LoyaltyActivity {
  id: string | number;
  user_address: string;
  activity_type: string;
  points: number;
  transaction_hash?: string;
  created_at?: string;
}
