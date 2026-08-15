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

export interface User {
  address?: string;
  role?: string;
}
