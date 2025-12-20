/**
 * Utility functions for handling organizer addresses
 * 
 * This module provides helper functions to handle cases where organizer fields
 * in the database may contain business names instead of wallet addresses.
 * This is a temporary workaround until the database is fully migrated.
 */

// Fallback wallet address for events with invalid organizer addresses
// This should match the address used in FIX_ORGANIZER_SQL.sql
export const FALLBACK_ORGANIZER_ADDRESS = '0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B';

/**
 * Check if an organizer address is a valid Ethereum wallet address
 */
export function isValidOrganizerAddress(organizer: string | null | undefined): boolean {
  if (!organizer) return false;
  return organizer.startsWith('0x') && organizer.length === 42;
}

/**
 * Get the appropriate organizer address for payment processing
 * 
 * If the organizer field contains a business name or invalid address,
 * this function returns a fallback wallet address for payment processing.
 * 
 * @param organizer The organizer field from the database
 * @returns A valid wallet address for payment processing
 */
export function getPaymentOrganizerAddress(organizer: string | null | undefined): string {
  if (isValidOrganizerAddress(organizer)) {
    return organizer!;
  }
  
  // Return fallback address for invalid organizer addresses
  return FALLBACK_ORGANIZER_ADDRESS;
}

/**
 * Check if an organizer field needs to be updated in the database
 * 
 * This function identifies events that have business names instead of
 * wallet addresses in the organizer field.
 * 
 * @param organizer The organizer field from the database
 * @returns true if the organizer field needs database migration
 */
export function needsOrganizerMigration(organizer: string | null | undefined): boolean {
  return !isValidOrganizerAddress(organizer) && organizer !== null && organizer !== undefined && organizer.trim() !== '';
}

/**
 * Format organizer display information
 * 
 * For display purposes, this function can show both the business name
 * (if available) and the wallet address being used for payments.
 * 
 * @param organizer The organizer field from the database
 * @returns Formatted display string
 */
export function formatOrganizerDisplay(organizer: string | null | undefined): string {
  if (isValidOrganizerAddress(organizer)) {
    return organizer!;
  }
  
  if (organizer && organizer.trim() !== '') {
    return `${organizer} (using fallback wallet for payments)`;
  }
  
  return 'Unknown organizer';
}
