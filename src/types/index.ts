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
