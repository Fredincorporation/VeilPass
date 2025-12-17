# VeilPass - The Private Way to Public Events

![VeilPass](https://img.shields.io/badge/VeilPass-Encrypted%20Ticketing-blue)
![Built with Next.js](https://img.shields.io/badge/Next.js-14-black)
![Zama fhEVM](https://img.shields.io/badge/Zama-fhEVM-purple)
![Base Sepolia](https://img.shields.io/badge/Network-Base%20Sepolia-blue)
![License MIT](https://img.shields.io/badge/License-MIT-green)

VeilPass is a production-ready encrypted ticketing dApp built for the **Zama Builder Track** at the December 2025 contest. It demonstrates real-world privacy-preserving applications using **Zama's fhEVM** (fully homomorphic encryption) for secure, confidential event management.

**Tagline:** _"The Private Way to Public Events."_

## 🎯 Key Features

### 🔐 Privacy-First Architecture
- **Encrypted Blind Auctions**: Bid amounts are encrypted on-chain; only winners' bids are revealed
- **Homomorphic Pricing**: Ticket prices adjust based on encrypted demand WITHOUT revealing actual sales numbers
- **Confidential Government ID Verification**: 5-check encrypted ID validation (authenticity, expiration, format, blacklist, age ≥18)
- **MEV-Resistant Resales**: Encrypted intents prevent front-running on secondary markets

### 🪙 Multi-Payment Support
- **ETH Payments**: Direct Ethereum transactions
- **USDC (Testnet)**: Test USDC for DeFi integration
- **$ZAMA Tokens**: Used for fhEVM encryption/decryption operations

### 👥 Role-Based Access Control
- **Customers**: Buy tickets, redeem loyalty points, participate in resales, initiate disputes
- **Sellers**: Create events, manage listings, view encrypted analytics, handle disputes
- **Admins**: Approve sellers, verify IDs, scan tickets, audit logs, manage disputes

### 💎 Loyalty & Rewards
- **Points System**: 1 point per 100 wei spent
- **Tier-Based Multipliers**: Gold tier = 1.5x point multiplier
- **Referral Program**: 200 points per referred friend
- **Redeemable Catalog**: VIP upgrades, discounts, account credits

### 📱 Mobile & Desktop UX
- **Smart Wallet Detection**: Mobile users auto-forced to Smart Wallet (email/passkey/Google login)
- **Desktop Web3**: Full Coinbase Wallet SDK support
- **Responsive Design**: Mobile-first, works perfectly on all devices
- **Dark/Light Mode**: Full theme toggle with auto-detect

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- Base Sepolia testnet funds

### Installation

```bash
git clone https://github.com/yourusername/veilpass.git
cd veilpass
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero section |
| `/dashboard` | Role-based dashboard |
| `/events/[id]` | Event details with purchase |
| `/tickets` | My tickets |
| `/loyalty` | Loyalty rewards |
| `/auctions` | Blind auctions |
| `/disputes` | Dispute tracking |
| `/sellers/register` | Seller registration |
| `/admin/sellers` | Seller approvals |
| `/admin/sellers/scan` | QR code scanner |
| `/admin/audit` | Audit logs |

## 🧪 Testing

```bash
npm run contracts:test
npm run contracts:deploy
```

## 🔐 Zama fhEVM

- Encrypted blind auctions with homomorphic computations
- Privacy-preserving ID verification (5-point check)
- MEV-resistant encrypted pricing

## 📜 License

MIT

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
