/**
 * Utility function to check if auction creation is allowed for an event
 * 
 * Returns true if current time is MORE than 5 hours before event start
 * Returns false if current time is WITHIN 5 hours of event start (auction creation disabled)
 */
export function isAuctionCreationAllowed(eventStartDate: Date | string): boolean {
  const eventStart = new Date(eventStartDate);
  const now = new Date();
  
  // Calculate cutoff time (5 hours before event start)
  const cutoffTime = new Date(eventStart.getTime() - 5 * 60 * 60 * 1000);
  
  // Allow creation if current time is before cutoff (more than 5 hours until event)
  return now < cutoffTime;
}

/**
 * Get time remaining until auction cutoff in milliseconds
 * Returns negative if cutoff has passed
 */
export function getTimeUntilCutoff(eventStartDate: Date | string): number {
  const eventStart = new Date(eventStartDate);
  const now = new Date();
  const cutoffTime = new Date(eventStart.getTime() - 5 * 60 * 60 * 1000);
  
  return cutoffTime.getTime() - now.getTime();
}

/**
 * Format time remaining until cutoff as human-readable string
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds < 0) {
    return 'Cutoff passed';
  }
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}
