import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// Get RPC URLs from environment
const BASE_SEPOLIA_RPC = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
const BASE_MAINNET_RPC = process.env.NEXT_PUBLIC_BASE_MAINNET_RPC || 'https://mainnet.base.org';
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Suppress WalletConnect init warnings during module loading
let initWarningsSuppressed = false;
if (typeof window === 'undefined' && !initWarningsSuppressed) {
  initWarningsSuppressed = true;
}

if (!WALLETCONNECT_PROJECT_ID) {
  console.warn(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Please add it to your environment variables. ' +
    'Get one free at https://cloud.walletconnect.com'
  );
}

/**
 * RainbowKit + Wagmi configuration with universal wallet support
 * Supports Base Sepolia (testnet) and Base Mainnet
 * Includes MetaMask, WalletConnect and many other popular wallets
 * 
 * Note: WalletConnect may log "already initialized" warnings during module loading -
 * this is normal and happens during Fast Refresh in development. The config is only
 * created once per application instance.
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'VeilPass',
  projectId: WALLETCONNECT_PROJECT_ID || 'placeholder-project-id',
  chains: [baseSepolia, base],
  transports: {
    [baseSepolia.id]: http(BASE_SEPOLIA_RPC),
    [base.id]: http(BASE_MAINNET_RPC),
  },
  // RainbowKit automatically handles MetaMask, WalletConnect and many other wallets.
});

// Network configuration
export const NETWORK_CONFIG = {
  chainId: baseSepolia.id,
  name: 'Base Sepolia',
  rpcUrl: BASE_SEPOLIA_RPC,
  currency: 'ETH',
  currencySymbol: 'ETH',
  testnet: true,
};

// Hardcoded test wallets (for demo/testing purposes only)
export const TEST_WALLETS = {
  seller: '0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B' as const,
  customer: '0xe0CB9745b22E2DA16155bAC21A60d3ffF7354774' as const,
  admin: '0x1234567890123456789012345678901234567890' as const,
};

export const ADMIN_ADDRESS = '0x1234567890123456789012345678901234567890';

// Mobile detection utility
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Check if WalletConnect is properly configured
export const validateWalletConnectConfig = () => {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (!projectId || projectId === 'placeholder-project-id') {
    console.warn(
      'WalletConnect Project ID is not configured. Get one free at https://cloud.walletconnect.com'
    );
    return false;
  }
  return true;
};
