/**
 * Date Formatter Utility
 * Converts all dates/times to plain English format sitewide
 */

/**
 * Format date to: "January 15, 2025"
 */
export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format time to: "2:30 PM"
 */
export function formatTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Time';
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return d.toLocaleTimeString('en-US', options);
  } catch {
    return 'Invalid Time';
  }
}

/**
 * Format datetime to: "January 15, 2025 at 2:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return `${formatDate(d)} at ${formatTime(d)}`;
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format relative time: "2 hours ago", "3 days ago", "just now"
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    
    // Fall back to regular date format for older dates
    return formatDate(d);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format date with day of week: "Monday, January 15, 2025"
 */
export function formatDateWithDay(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format date and time together: "Monday, January 15, 2025 at 2:30 PM"
 */
export function formatDateTimeWithDay(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return `${formatDateWithDay(d)} at ${formatTime(d)}`;
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format time with seconds: "2:30:45 PM"
 */
export function formatTimeWithSeconds(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Time';
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return d.toLocaleTimeString('en-US', options);
  } catch {
    return 'Invalid Time';
  }
}
