# Coinbase Wallet SDK Integration - VeilPass

Complete, bulletproof wallet integration for VeilPass dApp on Base Sepolia testnet using official Coinbase Wallet SDK.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @coinbase/onchainkit @coinbase/wallet-sdk wagmi ethers
```

### 2. Set Environment Variables

Copy `.env.local.example` to `.env.local` and add your CDP API Key:

```bash
cp .env.local.example .env.local
```

**Required:**
- `NEXT_PUBLIC_COINBASE_CDP_API_KEY` - Get from [Coinbase Cloud](https://www.coinbase.com/cloud/wallet-sdk)

### 3. Wrap Your App

In your root layout (`src/app/layout.tsx`):

```tsx
import { CoinbaseOnchainKitProvider } from '@/lib/coinbase-onchainkit';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from '@/lib/wallet-config';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={wagmiConfig}>
          <CoinbaseOnchainKitProvider>
            {children}
          </CoinbaseOnchainKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
```

### 4. Use the ConnectButton

```tsx
import ConnectButton from '@/components/ConnectButton';

function Header() {
  return (
    <header>
      <ConnectButton variant="primary" size="md" />
    </header>
  );
}
```

### 5. Use Wallet Hooks

```tsx
import { useAccount, useWalletClient, useSendTransaction } from 'wagmi';

function MyComponent() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const { sendTransaction, isPending } = useSendTransaction();

  const handlePayment = async () => {
    const tx = await sendTransaction({
      to: '0x...',
      value: parseEther('0.01'),
    });
    console.log('Transaction hash:', tx);
  };

  return (
    <div>
      {isConnected ? `Connected: ${address}` : 'Not connected'}
      <button onClick={handlePayment} disabled={isPending}>
        Pay with Wallet
      </button>
    </div>
  );
}
```

## 📁 Files Structure

```
src/
├── lib/
│   ├── wallet-config.ts              # Wagmi configuration
│   ├── coinbase-onchainkit.tsx       # OnchainKit provider
│   └── wallet-utils.ts               # Wallet utilities
├── components/
│   └── ConnectButton.tsx             # Beautiful connect button
├── hooks/
│   └── useWalletPayment.ts           # Payment hook (optional)
└── app/
    └── layout.tsx                    # Root layout (wrap with providers)
```

## 🔧 Configuration

### Mobile vs Desktop Behavior

- **Mobile (detected via userAgent)**: 
  - Forces embedded Smart Wallet only
  - Shows "Continue with Email" button
  - No installed app/extension needed
  - Uses email/passkey/Google login

- **Desktop**:
  - Shows "Connect with Base" button
  - Supports Coinbase Wallet extension
  - Fallback to manual connection

### Network Configuration

- **Chain**: Base Sepolia (ID: 84532)
- **RPC URL**: https://sepolia.base.org
- **Currency**: ETH

## 🎨 ConnectButton Features

### Props

```tsx
interface ConnectButtonProps {
  className?: string;      // Custom CSS classes
  variant?: 'primary' | 'secondary';  // Button style
  size?: 'sm' | 'md' | 'lg';          // Button size
}
```

### Features

✅ **Beautiful Design**: Gradient buttons with hover effects  
✅ **Loading States**: Shows "Connecting..." during connection  
✅ **Error Handling**: Automatic retry and fallback options  
✅ **Network Validation**: Warns if not on Base Sepolia  
✅ **Mobile Detection**: Different behavior for mobile vs desktop  
✅ **Toast Notifications**: Success/error messages via useToast  

## 🛠️ Troubleshooting

### Common Issues

1. **"CDP API Key is not set"**
   - Solution: Add `NEXT_PUBLIC_COINBASE_CDP_API_KEY` to `.env.local`

2. **Wallet connection fails on mobile**
   - Solution: Ensure `smartWalletOnly: true` for mobile devices

3. **"Unable to connect"**
   - Solution: Check network connection and CDP API Key validity

4. **Double-click needed**
   - Solution: The integration includes automatic retry logic

### Debug Mode

Enable debug logging:

```env
NEXT_PUBLIC_ENABLE_DEBUG=true
```

Check browser console for:
- ✅ Coinbase Wallet SDK initialized successfully
- 📱 Mobile device: true/false
- 🔐 Smart wallet only: true/false

## 📦 Dependencies

### Required

```json
{
  "@coinbase/onchainkit": "^latest",
  "@coinbase/wallet-sdk": "^latest",
  "wagmi": "^latest",
  "ethers": "^latest"
}
```

### Peer Dependencies

- React 18+
- Next.js 14+ (App Router)
- TypeScript (recommended)

## 🔐 Security Notes

1. **CDP API Key**: Only use in `.env.local`, never commit to version control
2. **Environment Variables**: Must start with `NEXT_PUBLIC_` for client-side access
3. **Smart Wallets**: Automatically enabled on mobile for better UX

## 🧪 Testing

### Test Wallets

```typescript
// From src/lib/wallet-config.ts
TEST_WALLETS = {
  seller: '0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B',
  customer: '0xe0CB9745b22E2DA16155bAC21A60d3ffF7354774',
  admin: '0x1234567890123456789012345678901234567890'
}
```

### Test Flow

1. Click "Connect with Base" (desktop) or "Continue with Email" (mobile)
2. Complete Coinbase Wallet connection flow
3. Verify wallet address appears in button
4. Try sending a test transaction
5. Disconnect and reconnect to test persistence

## 🚀 Production Deployment

### Environment Variables

Set in your deployment platform:

```bash
NEXT_PUBLIC_COINBASE_CDP_API_KEY=your_production_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Performance

- Dynamic imports prevent bundle bloat
- Provider only initializes when needed
- Error boundaries prevent app crashes

## 📚 API Reference

### wallet-config.ts

```typescript
// Exports
export const wagmiConfig           // Wagmi configuration
export const NETWORK_CONFIG        // Network constants
export const TEST_WALLETS          // Test wallet addresses
export const isMobileDevice()      // Mobile detection
export const validateCDPApiKey()   // API key validation
```

### coinbase-onchainkit.tsx

```typescript
// Exports
export function CoinbaseOnchainKitProvider  // Provider component
```

### ConnectButton.tsx

```typescript
// Exports
export function ConnectButton  // Connect button component
```

### wallet-utils.ts

```typescript
// Exports
export function getCurrentWalletAddress()  // Get connected address
export function isWalletConnected()        // Check connection
export function formatWalletAddress()      // Format address
export function isValidWalletAddress()     // Validate address
export const NETWORK_CONFIG                // Network constants
export const TRANSACTION_MESSAGES          // Transaction messages
export function formatEthAmount()          // Format ETH
```

## 🤝 Support

For issues specific to this integration:

1. Check the troubleshooting section above
2. Enable debug mode and check console logs
3. Verify your CDP API Key is valid
4. Ensure you're on Base Sepolia network

For Coinbase Wallet SDK issues:
- [Coinbase Wallet SDK Documentation](https://docs.cloud.coinbase.com/wallet-sdk/docs)
- [OnchainKit Documentation](https://onchainkit.xyz)

## 📄 License

This integration is part of VeilPass and follows the project's license terms.
