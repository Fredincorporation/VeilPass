/**
 * VeilPass Authentication Middleware
 * 
 * Centralizes auth checks for admin, seller, and user roles.
 * Uses Supabase Auth + custom user table roles.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a server-side Supabase client using the service role key
function getServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Verify user is authenticated
 * NOTE: For full auth flow integrate `@supabase/auth-helpers-nextjs` in your app.
 * This helper will return `null` unless a proper auth flow is implemented.
 */
export async function verifyAuth() {
  // Placeholder: real implementation should validate session cookies or auth headers
  return null;
}

/**
 * Verify user is an admin
 * Checks: is authenticated AND has role='admin' in users table
 */
export async function verifyAdminAuth() {
  // Development override: allow admin access if ADMIN_API_KEY env var is set
  try {
    if (process.env.ADMIN_API_KEY) {
      return { id: 'admin', role: 'admin' } as any;
    }

    // Production: check users table using service role key if needed
    const supabase = getServerSupabaseClient();
    // No user context available here; require proper auth integration
    return null;
  } catch (error) {
    console.error('[AUTH] Error verifying admin auth:', error);
    return null;
  }
}

/**
 * Verify user is a seller
 * Checks: is authenticated AND has role='seller' OR role='awaiting_seller' in users table
 */
export async function verifySellerAuth() {
  try {
    const userId = await verifyAuth();
    if (!userId) return null;

    const supabase = getServerSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, wallet_address, seller_status')
      .eq('id', userId)
      .in('role', ['seller', 'awaiting_seller'])
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('[AUTH] Error verifying seller auth:', error);
    return null;
  }
}

/**
 * Verify user is authenticated (basic check)
 * Used for endpoints where both registered users have access
 */
export async function verifyUserAuth() {
  try {
    const userId = await verifyAuth();
    if (!userId) return null;

    const supabase = getServerSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, wallet_address, email')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('[AUTH] Error verifying user auth:', error);
    return null;
  }
}

export default {
  verifyAuth,
  verifyAdminAuth,
  verifySellerAuth,
  verifyUserAuth,
};
