/**
 * Ticket Status Determination Logic
 * Determines ticket status based on event date and other factors
 */

export type TicketStatus = 'upcoming' | 'active' | 'sold' | 'transferred';

/**
 * Determine ticket status based on event date
 * 
 * @param eventDate - Event date string (ISO or parseable format)
 * @param currentTicketStatus - Current ticket status (if already set)
 * @returns Appropriate ticket status
 * 
 * Rules:
 * - If event is in the FUTURE → 'upcoming'
 * - If event is TODAY or in the PAST → 'active'
 * - If ticket already 'sold' or 'transferred' → keep it
 */
export function determineTicketStatus(
  eventDate: string,
  currentTicketStatus?: string
): TicketStatus {
  // If ticket is already sold or transferred, keep that status
  if (currentTicketStatus === 'sold' || currentTicketStatus === 'transferred') {
    return currentTicketStatus as TicketStatus;
  }

  try {
    // Parse event date
    const eventDateTime = new Date(eventDate).getTime();
    const now = new Date().getTime();

    // Get today's start time (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    // If event is in the future (after today starts), mark as upcoming
    if (eventDateTime > todayTime) {
      return 'upcoming';
    }

    // If event is today or in the past, mark as active
    return 'active';
  } catch (error) {
    console.error('Error parsing event date:', error);
    // Default to active if we can't parse
    return 'active';
  }
}

/**
 * Batch determine ticket statuses
 * 
 * @param tickets - Array of tickets with event dates
 * @returns Array of tickets with updated status
 */
export function batchDetermineTicketStatus(
  tickets: Array<{ event_date: string; status?: string }>
) {
  return tickets.map((ticket) => ({
    ...ticket,
    status: determineTicketStatus(ticket.event_date, ticket.status),
  }));
}

/**
 * Get ticket status color for UI
 */
export function getTicketStatusColor(status: TicketStatus) {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    case 'active':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    case 'sold':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
    case 'transferred':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
  }
}

/**
 * Get ticket status display text and icon
 */
export function getTicketStatusDisplay(status: TicketStatus) {
  switch (status) {
    case 'upcoming':
      return { text: 'Upcoming', icon: '⏰' };
    case 'active':
      return { text: 'Active', icon: '✓' };
    case 'sold':
      return { text: 'Sold', icon: '✓' };
    case 'transferred':
      return { text: 'Transferred', icon: '→' };
    default:
      return { text: 'Unknown', icon: '?' };
  }
}
