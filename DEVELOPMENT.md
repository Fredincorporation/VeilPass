# VeilPass Development Guide

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+
- Git
- A code editor (VS Code recommended)
- MetaMask or Coinbase Wallet for testing

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/veilpass.git
cd veilpass

# Run setup script
bash setup.sh

# Or manually:
npm install
cp .env.example .env.local
```

### Environment Configuration

Edit `.env.local`:
```env
# Required for local development
NEXT_PUBLIC_CHAIN_ID=84532
BASE_SEPOLIA_RPC=https://sepolia.base.org

# After deploying contracts, add:
NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS=0x...
NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=0x...
NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS=0x...
```

## 📱 Running the Application

### Development Server

```bash
npm run dev
```

- Opens at `http://localhost:3000`
- Hot reload on file changes
- TypeScript type checking enabled

### Production Build

```bash
npm run build
npm run start
```

## 🔧 Smart Contract Development

### Compile Contracts

```bash
npm run contracts:compile
```

Output files:
- `artifacts/contracts/` - Compiled contracts
- `artifacts/abi/` - Contract ABIs
- `typechain-types/` - Type-safe contract interfaces

### Deploy Contracts

#### Local Hardhat Network
```bash
# Terminal 1: Start local network
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy.ts
```

#### Base Sepolia Testnet

```bash
# Set PRIVATE_KEY in .env.local with testnet wallet
npm run contracts:deploy

# Output:
# ✅ VeilPassTicketing deployed: 0x...
# ✅ DisputeResolution deployed: 0x...
# ✅ GovernmentIDVerification deployed: 0x...
```

Update `.env.local` with deployed addresses.

### Testing

```bash
# Run all tests
npm run contracts:test

# Run with verbose output
npm run contracts:test -- --verbose

# Run specific test file
npm run contracts:test -- test/VeilPass.test.ts

# Generate coverage report
npm run contracts:test:coverage
```

## 📝 Code Structure

### Creating a New Page

1. Create directory: `src/app/[feature]/`
2. Create file: `src/app/[feature]/page.tsx`

Example:
```tsx
'use client';

import React from 'react';

export default function FeaturePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold">Feature Name</h1>
        {/* Content here */}
      </div>
    </div>
  );
}
```

### Adding a Component

1. Create file: `src/components/MyComponent.tsx`

Example:
```tsx
import React from 'react';

interface Props {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: Props) {
  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-900">
      <h2>{title}</h2>
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
}
```

### Adding Custom Hooks

1. Create file: `src/hooks/useMy Hook.ts`

Example:
```tsx
import { useQuery } from '@tanstack/react-query';

export function useMyData() {
  return useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      // Fetch logic here
      return data;
    },
  });
}
```

### Using Zustand Store

```tsx
import { useStore } from '@/store';

export function MyComponent() {
  const userAddress = useStore((state) => state.userAddress);
  const setUserAddress = useStore((state) => state.setUserAddress);

  return (
    <div>
      {userAddress && <p>Connected: {userAddress}</p>}
    </div>
  );
}
```

## 🎨 Styling

### Tailwind Classes

```tsx
// Dark mode support
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hover states
<button className="hover:bg-blue-700 transition-colors">
```

### Global Styles

Edit `src/app/globals.css` for:
- CSS variables
- Animations
- Custom utility classes

## 🔐 Wallet Interactions

### Connect Wallet

```tsx
import { useWallet } from '@/lib/wallet-context';

export function App() {
  const { address, connect, disconnect } = useWallet();

  return (
    <>
      {address ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </>
  );
}
```

### Contract Interactions

```tsx
import { createEvent } from '@/lib/contract-interactions';
import { ethers } from 'ethers';

async function createNewEvent() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const ticketingAddress = process.env.NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS;
  const contract = new ethers.Contract(ticketingAddress, ABI, signer);
  
  const tx = await createEvent(
    contract,
    "Event Title",
    "Description",
    Math.floor(Date.now() / 1000) + 86400,
    ethers.parseEther("0.1"),
    100
  );
}
```

## 🧪 Testing

### Unit Tests (Components)

Create file: `src/components/__tests__/MyComponent.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Contract Tests

Tests are in `test/VeilPass.test.ts`

```bash
npm run contracts:test
```

## 🚀 Deployment Checklist

Before deploying:

- [ ] All pages working locally
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Linter passes: `npm run lint`
- [ ] Contracts compile: `npm run contracts:compile`
- [ ] All tests pass: `npm run contracts:test`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set
- [ ] Contract addresses updated in `.env.local`

## 🐛 Debugging

### Browser DevTools
- Inspector: Check HTML/CSS
- Console: View JS logs
- Network: Monitor requests
- Storage: Check localStorage

### React DevTools
- Install React DevTools extension
- Inspect component props and state

### Hardhat Console
```bash
npx hardhat console
# Then interact with contracts
```

## 📚 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [ethers.js](https://docs.ethers.org)
- [Hardhat](https://hardhat.org/docs)
- [Zama fhEVM](https://docs.zama.ai)

## 🔗 Common Tasks

### Add a new environment variable
1. Add to `.env.example`
2. Add to `.env.local`
3. Use `process.env.NEXT_PUBLIC_*` in code

### Update contract ABI
1. Modify `contracts/VeilPassCore.sol`
2. Run `npm run contracts:compile`
3. ABI auto-updated in `artifacts/`

### Deploy to Vercel
1. Push to GitHub
2. Vercel auto-deploys main branch
3. View deployment at `Settings > Deployments`

### Add npm package
```bash
npm install package-name
npm run build  # Test it works
```

## ❓ Troubleshooting

### "Cannot find module" error
```bash
rm -rf node_modules .next
npm install
npm run build
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Contract deployment fails
- Check you have testnet ETH
- Verify private key in `.env.local`
- Check RPC endpoint is accessible

### Dark mode not working
- Clear browser cache
- Check localStorage isn't forcing light mode
- Verify next-themes is initialized in `layout.tsx`

---

**Happy coding! 🚀**

For questions, check [README.md](./README.md) or [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
