import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

const baseSepioliaChain = {
  ...baseSepolia,
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
};

export const wagmiConfig = createConfig({
  chains: [baseSepioliaChain],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'VeilPass',
      appLogoUrl: '/logo.svg',
      darkMode: true,
    }),
  ],
  transports: {
    [baseSepioliaChain.id]: http('https://sepolia.base.org'),
  },
});

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// Hardcoded test wallets
export const TEST_WALLETS = {
  seller: '0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B' as const,
  customer: '0xe0CB9745b22E2DA16155bAC21A60d3ffF7354774' as const,
  admin: '0x1234567890123456789012345678901234567890' as const,
};

export const ADMIN_ADDRESS = '0x1234567890123456789012345678901234567890';
