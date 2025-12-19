import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const auditLogs: any[] = [];

    // Fetch events (EVENT_CREATED actions)
    const { data: events } = await supabase
      .from('events')
      .select('id, title, created_by, created_at, capacity')
      .order('created_at', { ascending: false })
      .limit(50);

    if (events) {
      events.forEach((event) => {
        auditLogs.push({
          id: `event-${event.id}`,
          action: 'EVENT_CREATED',
          actor: event.created_by?.slice(0, 8) || 'Unknown',
          target: event.title,
          timestamp: new Date(event.created_at).toLocaleString(),
          details: `Event created with capacity ${event.capacity} tickets`,
          icon: 'Activity',
          color: 'from-blue-500 to-cyan-600',
          textColor: 'text-blue-600 dark:text-blue-400',
        });
      });
    }

    // Fetch tickets (TICKET_PURCHASED actions)
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id, buyer_address, price, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (tickets) {
      tickets.forEach((ticket) => {
        auditLogs.push({
          id: `ticket-${ticket.id}`,
          action: 'TICKET_PURCHASED',
          actor: ticket.buyer_address?.slice(0, 8) || 'Unknown',
          target: ticket.id?.slice(0, 6) || 'TK',
          timestamp: new Date(ticket.created_at).toLocaleString(),
          details: `Purchased for ${ticket.price} ETH`,
          icon: 'ShoppingCart',
          color: 'from-green-500 to-emerald-600',
          textColor: 'text-green-600 dark:text-green-400',
        });
      });
    }

    // Fetch disputes (DISPUTE_CREATED actions)
    const { data: disputes } = await supabase
      .from('disputes')
      .select('id, reason, created_at, status')
      .order('created_at', { ascending: false })
      .limit(50);

    if (disputes) {
      disputes.forEach((dispute) => {
        auditLogs.push({
          id: `dispute-${dispute.id}`,
          action: 'DISPUTE_CREATED',
          actor: 'System',
          target: `Dispute #${dispute.id}`,
          timestamp: new Date(dispute.created_at).toLocaleString(),
          details: `${dispute.reason} - Status: ${dispute.status}`,
          icon: 'AlertTriangle',
          color: 'from-red-500 to-pink-600',
          textColor: 'text-red-600 dark:text-red-400',
        });
      });
    }

    // Fetch users (USER_REGISTERED actions)
    const { data: users } = await supabase
      .from('users')
      .select('id, wallet_address, created_at, role')
      .order('created_at', { ascending: false })
      .limit(50);

    if (users) {
      users.forEach((user) => {
        auditLogs.push({
          id: `user-${user.id}`,
          action: 'USER_REGISTERED',
          actor: 'System',
          target: user.wallet_address?.slice(0, 8) || 'Unknown',
          timestamp: new Date(user.created_at).toLocaleString(),
          details: `User registered with role: ${user.role}`,
          icon: 'UserPlus',
          color: 'from-purple-500 to-indigo-600',
          textColor: 'text-purple-600 dark:text-purple-400',
        });
      });
    }

    // Sort by timestamp descending
    auditLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(auditLogs.slice(0, 100));
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error fetching audit logs:', errorMessage);

    // Return empty array on error
    return NextResponse.json([]);
  }
}
