// Network Configuration
export const CHAIN_CONFIG = {
  id: 84532,
  name: "Base Sepolia",
  rpc: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
};

// Contract Addresses (update after deployment)
export const CONTRACT_ADDRESSES = {
  veilPassTicketing: process.env.NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS || "0x0000000000000000000000000000000000000000",
  disputeResolution: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS || "0x0000000000000000000000000000000000000000",
  governmentIDVerification: process.env.NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS || "0x0000000000000000000000000000000000000000",
};

// Admin Configuration
export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0x1234567890123456789012345678901234567890";

// Test Wallets
export const TEST_WALLETS = {
  seller: "0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B",
  customer: "0xe0CB9745b22E2DA16155bAC21A60d3ffF7354774",
  admin: ADMIN_ADDRESS,
};

// Payment Configuration
export const PAYMENT_CONFIG = {
  minTicketPrice: 0.01, // ETH
  maxTicketPrice: 100, // ETH
  loyaltyPointsPerWei: 0.01,
  referralBonus: 200,
};

// Dispute Configuration
export const DISPUTE_CONFIG = {
  maxDaysToDispute: 30,
  resolutionTimeframe: 7, // days
  adminResolvableThreshold: 5000, // wei
};

// Loyalty Configuration
export const LOYALTY_CONFIG = {
  goldTierMultiplier: 1.5,
  silverTierMultiplier: 1.25,
  pointsPerWei: 1 / 100,
  redeemableRewards: [
    {
      id: 1,
      title: "10% Discount",
      points: 500,
      description: "10% off next ticket purchase",
    },
    {
      id: 2,
      title: "VIP Upgrade",
      points: 1000,
      description: "Upgrade to VIP seating",
    },
    {
      id: 3,
      title: "$25 Credit",
      points: 2500,
      description: "Account credit",
    },
  ],
};

// UI Configuration
export const UI_CONFIG = {
  sidebarWidth: 280,
  headerHeight: 64,
  animationDuration: 300,
  toastDuration: 3000,
};

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 30000,
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableFHEEncryption: true,
  enableBlindAuctions: true,
  enableMEVResistance: true,
  enableLoyaltyProgram: true,
  enableGovernmentIDVerification: true,
};
