# VeilPass - Quick Reference Card

## 🚀 Start Here

```bash
# Setup
npm install
cp .env.example .env.local

# Development
npm run dev                 # http://localhost:3000

# Contracts
npm run contracts:compile
npm run contracts:deploy
npm run contracts:test
```

## 📱 All Pages

| Page | Route | File |
|------|-------|------|
| Landing | `/` | `src/app/page.tsx` |
| Dashboard | `/dashboard` | `src/app/dashboard/page.tsx` |
| Event | `/events/[id]` | `src/app/events/[id]/page.tsx` |
| Tickets | `/tickets` | `src/app/tickets/page.tsx` |
| Loyalty | `/loyalty` | `src/app/loyalty/page.tsx` |
| Auctions | `/auctions` | `src/app/auctions/page.tsx` |
| Disputes | `/disputes` | `src/app/disputes/page.tsx` |
| Register | `/sellers/register` | `src/app/sellers/register/page.tsx` |
| Admin Sellers | `/admin/sellers` | `src/app/admin/sellers/page.tsx` |
| Scanner | `/admin/sellers/scan` | `src/app/admin/sellers/scan/page.tsx` |
| Audit | `/admin/audit` | `src/app/admin/audit/page.tsx` |

## 🔑 Key Files

**Frontend**
- `src/lib/wallet-config.ts` - Wallet setup
- `src/lib/constants.ts` - Configuration
- `src/store/index.ts` - State management
- `src/app/globals.css` - Global styles

**Contracts**
- `contracts/VeilPassCore.sol` - Main contracts
- `scripts/deploy.ts` - Deployment
- `test/VeilPass.test.ts` - Tests

**Config**
- `next.config.ts` - Next.js
- `tailwind.config.ts` - Tailwind
- `hardhat.config.ts` - Hardhat
- `.env.local` - Environment

**Docs**
- `README.md` - Overview
- `DEPLOYMENT.md` - Deploy guide
- `DEVELOPMENT.md` - Dev guide
- `PROJECT_STRUCTURE.md` - File index

## 🧪 Test Commands

```bash
npm run contracts:test              # Run tests
npm run contracts:test:coverage     # Coverage report
npm run contracts:compile           # Compile contracts
npm run type-check                  # TypeScript check
npm run lint                        # ESLint
npm run build                       # Production build
```

## 🌍 Network Info

| Property | Value |
|----------|-------|
| Network | Base Sepolia |
| Chain ID | 84532 |
| RPC | https://sepolia.base.org |
| Explorer | https://sepolia.basescan.org |
| Token | ETH |

## 💎 Test Wallets

```
Seller:   0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B
Customer: 0xe0CB9745b22E2DA16155bAC21A60d3ffF7354774
Admin:    0x1234567890123456789012345678901234567890
```

## 📦 Key Dependencies

- **Frontend**: next, react, typescript, tailwindcss
- **Blockchain**: ethers, wagmi, viem, @coinbase/onchainkit
- **State**: zustand, @tanstack/react-query
- **Styling**: tailwind, next-themes, framer-motion
- **Testing**: hardhat, chai

## 🔐 Security Checklist

- [x] No hardcoded secrets (except test wallets)
- [x] Environment variables isolated
- [x] CSRF headers configured
- [x] TypeScript strict mode
- [x] Contract access controls
- [x] Input validation
- [x] Encrypted data handling

## 🎯 Key Features

✅ Encrypted ticketing
✅ Blind auctions (encrypted bids)
✅ Homomorphic pricing
✅ Government ID verification
✅ Loyalty rewards
✅ MEV-resistant resales
✅ Role-based access
✅ Dark/light mode
✅ Mobile optimized
✅ Seller KYC

## 🚀 Deployment Steps

1. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit with your config
   ```

2. **Deploy Contracts**
   ```bash
   npm run contracts:deploy
   # Copy deployed addresses
   ```

3. **Update Environment**
   ```env
   NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS=0x...
   NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=0x...
   NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS=0x...
   ```

4. **Deploy Frontend**
   - Push to GitHub
   - Vercel auto-deploys

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [ethers.js](https://docs.ethers.org)
- [Hardhat](https://hardhat.org)
- [Zama fhEVM](https://docs.zama.ai)
- [Base Docs](https://docs.base.org)

## 🐛 Common Issues

**Port in use?**
```bash
npm run dev -- -p 3001
```

**TypeScript errors?**
```bash
npm run type-check
rm -rf .next
npm run build
```

**Contract deploy fails?**
- Check testnet ETH balance
- Verify PRIVATE_KEY in .env
- Check RPC endpoint

**Wallet not connecting?**
- Clear browser cache
- Check network = Base Sepolia
- Verify contract addresses set

## 📊 Project Stats

- 11 pages fully built
- 3 smart contracts
- 50+ source files
- 70+ npm packages
- 100% TypeScript
- Production ready
- Full test coverage

## 🎉 You're All Set!

VeilPass is production-ready. Just run:

```bash
npm install
npm run dev
```

Then visit **http://localhost:3000** 🚀

---

**Built with 🔒 privacy and ❤️ for Zama**
