import { createConfig, http } from 'wagmi';

// Define an explicit Base Sepolia chain configuration (chainId 84532)
// Avoid relying on wagmi's built-in `sepolia` which is the Ethereum Sepolia testnet.
const RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org';

export const baseSepoliaChain = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};

// Create wagmi config using the explicit Base Sepolia chain and HTTP transport
export const wagmiConfig = createConfig({
  chains: [baseSepoliaChain],
  connectors: [],
  transports: {
    [baseSepoliaChain.id]: http(RPC_URL),
  },
});

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  currency: 'ETH',
  currencySymbol: 'ETH',
};

// Hardcoded test wallets
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

// WalletConnect Project ID validation
export const validateWalletConnectProjectId = () => {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (!projectId) {
    console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect features may not work properly.');
    return false;
  }
  return true;
};
