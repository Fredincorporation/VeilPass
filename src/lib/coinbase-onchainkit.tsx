/**
 * @deprecated This file has been replaced by RainbowKit configuration.
 * 
 * The Coinbase OnchainKit SDK integration has been replaced with RainbowKit,
 * which provides universal wallet support (MetaMask, Coinbase, WalletConnect, etc.)
 * 
 * See: src/lib/rainbowkit-config.ts
 * Provider setup: src/lib/providers.tsx
 */

export function CoinbaseOnchainKitProvider({ children }: { children: React.ReactNode }) {
  // This provider is no longer needed - RainbowKit handles wallet integration
  return <>{children}</>;
}

export default CoinbaseOnchainKitProvider;
