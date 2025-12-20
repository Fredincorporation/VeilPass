/**
 * Blacklist Management
 * 
 * Stores deterministic hashes of fraudulent IDs
 * Allows checking against blacklist WITHOUT storing raw ID data
 * Uses SHA-256 hashes with salt to prevent reverse engineering
 */

import { supabase } from './supabase';

export interface BlacklistEntry {
  id: string;
  id_hash: string; // SHA-256 hash (deterministic)
  reason: 'fraud' | 'duplicate' | 'invalid' | 'reported' | 'other';
  added_at: string;
  added_by_admin: string;
  notes?: string;
}

/**
 * Add an ID hash to the blacklist (admin only)
 * @param idHash Deterministic hash of ID (use generateIDHash)
 * @param reason Why this ID is blacklisted
 * @param adminAddress Admin wallet address
 * @param notes Optional notes
 */
export async function addToBlacklist(
  idHash: string,
  reason: BlacklistEntry['reason'],
  adminAddress: string,
  notes?: string
): Promise<BlacklistEntry | null> {
  try {
    const { data, error } = await supabase
      .from('id_blacklist')
      .insert({
        id_hash: idHash,
        reason,
        added_by_admin: adminAddress,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to blacklist:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in addToBlacklist:', err);
    return null;
  }
}

/**
 * Check if an ID hash is blacklisted (fast lookup)
 * @param idHash Deterministic hash to check
 */
export async function isBlacklisted(idHash: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('id_blacklist')
      .select('id')
      .eq('id_hash', idHash)
      .limit(1)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows found (expected when not blacklisted)
      return false;
    }

    if (error) {
      console.warn('Error checking blacklist:', error);
      return false; // Fail open: don't block on DB error
    }

    return !!data;
  } catch (err) {
    console.warn('Exception in isBlacklisted:', err);
    return false;
  }
}

/**
 * Get blacklist entries (admin only, filtered)
 */
export async function getBlacklistEntries(
  reason?: BlacklistEntry['reason'],
  limit: number = 100
): Promise<BlacklistEntry[]> {
  try {
    let query = supabase.from('id_blacklist').select('*').order('added_at', { ascending: false }).limit(limit);

    if (reason) {
      query = query.eq('reason', reason);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching blacklist:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception in getBlacklistEntries:', err);
    return [];
  }
}

/**
 * Remove from blacklist (admin only, for corrections)
 */
export async function removeFromBlacklist(idHash: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('id_blacklist')
      .delete()
      .eq('id_hash', idHash);

    if (error) {
      console.error('Error removing from blacklist:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in removeFromBlacklist:', err);
    return false;
  }
}

export default {
  addToBlacklist,
  isBlacklisted,
  getBlacklistEntries,
  removeFromBlacklist,
};
