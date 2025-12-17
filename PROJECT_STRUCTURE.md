# VeilPass - Project Structure & File Index

## 📁 Directory Structure

```
veilpass/
├── contracts/                    # Smart Contracts
│   └── VeilPassCore.sol         # Main ticketing, disputes, ID verification
├── scripts/                      # Deployment & Setup Scripts
│   └── deploy.ts                # Deploy all contracts to Base Sepolia
├── test/                         # Contract Tests
│   └── VeilPass.test.ts         # Comprehensive test suite
├── src/
│   ├── app/                      # Next.js App Router Pages
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── globals.css           # Global styles + Tailwind
│   │   ├── admin/
│   │   │   ├── sellers/
│   │   │   │   ├── page.tsx      # Seller approvals (/admin/sellers)
│   │   │   │   └── scan/
│   │   │   │       └── page.tsx  # QR scanner (/admin/sellers/scan)
│   │   │   └── audit/
│   │   │       └── page.tsx      # Audit logs (/admin/audit)
│   │   ├── auctions/
│   │   │   └── page.tsx          # Blind auctions (/auctions)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Role-based dashboard (/dashboard)
│   │   ├── disputes/
│   │   │   └── page.tsx          # Dispute tracking (/disputes)
│   │   ├── events/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Event detail & purchase (/events/[id])
│   │   ├── loyalty/
│   │   │   └── page.tsx          # Loyalty rewards (/loyalty)
│   │   ├── sellers/
│   │   │   └── register/
│   │   │       └── page.tsx      # Seller registration (/sellers/register)
│   │   └── tickets/
│   │       └── page.tsx          # My tickets (/tickets)
│   ├── components/               # Reusable Components
│   │   ├── ThemeSwitcher.tsx    # Dark/light mode toggle
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/                    # Custom React Hooks
│   │   └── useData.ts            # React Query data hooks
│   ├── lib/                      # Utility Libraries
│   │   ├── constants.ts          # App constants & config
│   │   ├── contract-interactions.ts  # Web3 contract calls
│   │   ├── providers.tsx         # App providers (Theme, Wallet)
│   │   ├── utils.ts              # Helper functions
│   │   ├── wallet-config.ts      # Wagmi + Coinbase SDK config
│   │   └── wallet-context.tsx    # Wallet context provider
│   ├── store/                    # State Management
│   │   └── index.ts              # Zustand store
│   └── utils/                    # Utility Functions
├── public/                       # Static Assets
├── .github/
│   └── workflows/
│       ├── ci.yml                # GitHub Actions CI
│       └── deploy.yml            # Vercel deployment
├── .env.example                  # Environment template
├── .env.local                    # Local environment (gitignored)
├── .gitignore                    # Git ignore rules
├── DEPLOYMENT.md                 # Deployment guide
├── hardhat.config.ts             # Hardhat configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Project dependencies
├── postcss.config.mjs            # PostCSS config for Tailwind
├── README.md                     # Project documentation
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vercel.json                   # Vercel configuration
└── eslint.config.mjs             # ESLint configuration
```

## 🎯 Key Files by Feature

### Authentication & Wallet
- `src/lib/wallet-config.ts` - Wagmi + Coinbase SDK setup
- `src/lib/wallet-context.tsx` - Wallet state management
- `src/lib/providers.tsx` - App providers wrapper

### Smart Contracts
- `contracts/VeilPassCore.sol` - Main contract logic
- `scripts/deploy.ts` - Deployment script
- `test/VeilPass.test.ts` - Test suite

### Pages
- `src/app/page.tsx` - Landing page (hero, features, testimonials)
- `src/app/dashboard/page.tsx` - Role-based dashboard
- `src/app/events/[id]/page.tsx` - Event detail with purchase modal
- `src/app/auctions/page.tsx` - Blind auction marketplace
- `src/app/tickets/page.tsx` - User's ticket collection
- `src/app/loyalty/page.tsx` - Loyalty rewards program
- `src/app/disputes/page.tsx` - Dispute submission & tracking
- `src/app/sellers/register/page.tsx` - KYC seller registration
- `src/app/admin/sellers/page.tsx` - Seller approval management
- `src/app/admin/sellers/scan/page.tsx` - Mobile QR scanner
- `src/app/admin/audit/page.tsx` - Full transaction audit log

### Configuration
- `tailwind.config.ts` - Tailwind theming & colors
- `next.config.ts` - Next.js optimizations
- `tsconfig.json` - TypeScript settings
- `hardhat.config.ts` - Hardhat contract settings
- `vercel.json` - Vercel deployment config

### Styling
- `src/app/globals.css` - Global styles, animations, utilities
- Theme support via `next-themes`

### State Management
- `src/store/index.ts` - Zustand store (events, user, role)
- `src/hooks/useData.ts` - React Query hooks for data fetching

### Utilities
- `src/lib/utils.ts` - Helper functions (format, encrypt, etc.)
- `src/lib/constants.ts` - App-wide constants & config
- `src/lib/contract-interactions.ts` - Web3 contract helpers

## 📝 Configuration Files Explained

### .env.local (Development)
```env
NEXT_PUBLIC_APP_NAME=VeilPass
NEXT_PUBLIC_CHAIN_ID=84532
BASE_SEPOLIA_RPC=https://sepolia.base.org
NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS=0x...
PRIVATE_KEY=your_key_for_deployment
```

### package.json Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run contracts:compile` - Compile Solidity
- `npm run contracts:deploy` - Deploy to Base Sepolia
- `npm run contracts:test` - Run contract tests

### tailwind.config.ts
- Customized with primary colors (blue gradient)
- Dark mode support via `class` strategy
- Smooth transitions and animations

## 🚀 Development Workflow

1. **Local Development**
   - Run `npm run dev`
   - Edit pages in `src/app/`
   - Hot reload updates instantly

2. **Smart Contract Changes**
   - Modify `contracts/VeilPassCore.sol`
   - Run `npm run contracts:compile`
   - Update tests in `test/`
   - Deploy with `npm run contracts:deploy`

3. **New Features**
   - Create new page in `src/app/[feature]/page.tsx`
   - Add hooks in `src/hooks/`
   - Use Zustand store in `src/store/`
   - Style with Tailwind in component

4. **Deployment**
   - Commit to GitHub
   - GitHub Actions CI runs automatically
   - Vercel auto-deploys on `main` branch
   - Contracts deployed via `hardhat run scripts/deploy.ts --network baseSepolia`

## 🔑 Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_CHAIN_ID` | Blockchain network | `84532` |
| `NEXT_PUBLIC_APP_NAME` | App title | `VeilPass` |
| `BASE_SEPOLIA_RPC` | RPC endpoint | `https://sepolia.base.org` |
| `PRIVATE_KEY` | Deployment wallet | `0x...` |
| `NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS` | Contract address | `0x...` |

## 📊 Component Hierarchy

```
RootLayout
├── Providers (ThemeProvider, WalletProvider)
│   └── Page Content
│       ├── Navigation
│       ├── Main Content
│       └── Footer
```

## 🔐 Security Considerations

- Environment variables never exposed to client (except `NEXT_PUBLIC_*`)
- Private keys stored in `.env.local` (gitignored)
- Contract calls use ethers.js for type safety
- Input validation on all forms
- CSRF protection via Next.js headers

---

For more details, see [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
