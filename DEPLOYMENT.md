# VeilPass Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Git
- MetaMask or Coinbase Wallet (for testnet)

## Environment Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/veilpass.git
cd veilpass
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

```env
# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=84532
BASE_SEPOLIA_RPC=https://sepolia.base.org

# Contract Addresses (after deployment)
NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS=0x...
NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=0x...
NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS=0x...

# Wallet Private Key (for contract deployment only)
PRIVATE_KEY=your_private_key_here

# Admin Address
NEXT_PUBLIC_ADMIN_ADDRESS=0x1234567890123456789012345678901234567890
```

## Local Development

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
```

## Contract Deployment

### Compile Contracts

```bash
npm run contracts:compile
```

### Deploy to Base Sepolia

```bash
npm run contracts:deploy
```

Expected output:
```
✅ VeilPassTicketing deployed: 0x...
✅ DisputeResolution deployed: 0x...
✅ GovernmentIDVerification deployed: 0x...
```

Copy the deployed addresses to `.env.local`:

```env
NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS=0x... (from output)
NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=0x... (from output)
NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS=0x... (from output)
```

### Run Tests

```bash
npm run contracts:test
npm run contracts:test:coverage
```

## Frontend Deployment

### Build Locally

```bash
npm run build
npm run start
```

### Deploy to Vercel

#### Option 1: GitHub Integration
1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Select your VeilPass repository
5. Set environment variables:
   - `NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS`
   - `NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS`
   - `NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS`
6. Click "Deploy"

#### Option 2: CLI Deployment
```bash
npm install -g vercel
vercel
```

Follow the prompts to link your project and set environment variables.

## Production Checklist

- [ ] Verify contract addresses in `.env.local`
- [ ] Run full test suite: `npm run contracts:test`
- [ ] Test all wallet connections (Coinbase, MetaMask)
- [ ] Verify dark/light mode functionality
- [ ] Test responsive design on mobile devices
- [ ] Check all page routes load correctly
- [ ] Verify contract interactions (create event, purchase ticket, etc.)
- [ ] Set up monitoring/alerts for contract events
- [ ] Document admin procedures

## Troubleshooting

### Wallet Connection Issues
- Ensure you're on Base Sepolia network
- Verify `NEXT_PUBLIC_CHAIN_ID=84532`
- Clear browser cache and restart

### Contract Deployment Fails
- Check you have Base Sepolia testnet ETH
- Verify `PRIVATE_KEY` is correct
- Check `BASE_SEPOLIA_RPC` is accessible

### Build Fails
- Delete `node_modules` and `.next`: `rm -rf node_modules .next`
- Reinstall: `npm install`
- Try build again: `npm run build`

## Monitoring

### Contract Events
Listen for these events in your monitoring system:
- `EventCreated`
- `TicketPurchased`
- `BlindAuctionPlaced`
- `AuctionFinalized`
- `DisputeCreated`
- `DisputeResolved`

### Application Metrics
- Page load times
- Wallet connection rate
- Transaction success rate
- Error logs

## Support

For issues or questions:
1. Check [GitHub Issues](https://github.com/yourusername/veilpass/issues)
2. Review [README.md](../README.md)
3. Check contract deployment logs

---

**Last Updated**: December 2025
