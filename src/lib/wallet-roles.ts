/**
 * Wallet role detection and authorization
 */

export type WalletRole = 'admin' | 'seller' | 'customer';

// Wallet addresses mapped to roles (case-insensitive)
const WALLET_ROLES: Record<string, WalletRole> = {
  '0x045b89da5d5dbea1f23574f5315c8aa78be643ea': 'admin',
  '0xe0cb9745b22e2da16155bac21a60d3fff7354774': 'seller',
  '0xed63c52c509df89afe52092ce79428a84730ceb1': 'customer',
};

/**
 * Get the role for a connected wallet address
 * Default role is 'customer' for any unrecognized wallet
 */
export function getWalletRole(address: string | null): WalletRole {
  if (!address) return 'customer';
  
  const normalizedAddress = address.toLowerCase();
  return WALLET_ROLES[normalizedAddress] || 'customer';
}

/**
 * Check if a wallet has a specific role
 */
export function hasRole(address: string | null, role: WalletRole): boolean {
  return getWalletRole(address) === role;
}

/**
 * Check if a wallet is admin
 */
export function isAdmin(address: string | null): boolean {
  if (!address) return false;
  
  // Check hardcoded admin wallet
  if (hasRole(address, 'admin')) return true;
  
  // Also check against environment variable for flexibility
  const envAdmin = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
  if (envAdmin && address.toLowerCase() === envAdmin.toLowerCase()) {
    return true;
  }
  
  return false;
}

/**
 * Check if a wallet is seller
 */
export function isSeller(address: string | null): boolean {
  return hasRole(address, 'seller');
}

/**
 * Check if a wallet is customer
 */
export function isCustomer(address: string | null): boolean {
  return hasRole(address, 'customer');
}
