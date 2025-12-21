<div align="center">

# VeilPass

**_The Private Way to Public Events._**

**The first fully homomorphic encrypted ticketing platform where bids, prices, identities, and verifications stay encrypted end-to-end — revealed only at the door.**

</div>

---

## Why VeilPass Stands Out – Key Innovations

- **Blind encrypted auctions** using `euint256` bids and **homomorphic max()** — the highest bid is determined on-chain without revealing any individual amounts.
- **Dynamic encrypted pricing**: price increases based on **encrypted demand thresholds** (homomorphic comparisons) so supply/demand dynamics happen on ciphertexts.
- **MEV‑resistant resale marketplace** with **encrypted resale intents** to prevent front‑running and extractive reordering.
- **Confidential DeFi payments** via wrapped USDC (ERC‑7984 encrypted balances) enabling private settlement flows while remaining compatible with token rails.
- **Government ID verification with 5 encrypted checks** (authenticity hash, expiration >, format, blacklist search, age calculation) — all processed on ciphertexts so PII never leaks on‑chain.
- **Privacy‑preserving analytics**: admins view **aggregates only** (no individual-level data), enabling operational insights without privacy loss.
- **Post‑event encrypted feedback**: homomorphic rating sums yield private aggregate sentiment without exposing single-user votes.
- **NFT ticket upgrades with encrypted perks** — perks remain confidential until redemption at the gate.
- **Secondary royalties on resales** implemented as **encrypted split calculations**, protecting revenue details while ensuring correct payouts.

---

## Reviewer Quick-Start Guide

### For Reviewers: Test the FHE Magic in <5 Minutes

1. **Open the live demo** (use the demo URL submitted in the Builder Track).  
2. **Click “Connect with Base” → choose email** (Coinbase Smart Wallet creates a smart account instantly — no extension required).  
3. **Go to the Auctions page** → place an **encrypted bid** on any live event (UI guides you through ciphertext creation).  
4. **Check My Tickets** → observe your **encrypted NFT** (metadata remains ciphertext, status shows “Encrypted / Pending Reveal”).

Quick tips:
- Look for **Encrypted** badges in the UI — these indicate data stored and processed as ciphertexts.  
- Use the demo **Gate Reveal** helper (demo mode only) to simulate the secure reveal workflow and watch ciphertext → plaintext reveal for a single ticket.

---

## Tech Stack & fhEVM Highlights

- **Base** + **Coinbase Smart Wallet** (embedded, email/passkey onboarding)  
- **Next.js 14** + **Tailwind CSS** + **shadcn/ui**  
- **wagmi** + **viem** + **onchainkit** (wallet + provider stack)  
- **Hardhat** + **fhEVM Solidity library** (development & contract verification)  
- **Encrypted types used:** `euint256`, `ebool`, `eaddress` — used across auctions, flags, and identity handles for homomorphic operations

---

## Smart Contract Overview

Browse the main contract: [`/contracts/TicketContract.sol`](./contracts/TicketContract.sol)

| Function              | FHE Operation Used                  | Purpose |
|-----------------------|-------------------------------------|---------|
| `placeEncryptedBid()` | `euint256` comparison & **homomorphic max** | Blind auction winner selection without exposing bid amounts |
| `adjustPrice()`       | Encrypted demand threshold **comparison** | Dynamic pricing reacting to encrypted demand signals |
| `verifyID()`          | hash eq, `gt`, `sub`, `ge 18`, **encrypted blacklist search** | Five encrypted ID checks performed entirely on ciphertexts |
| `aggregateRatings()`  | Homomorphic **sum** on `euint8`     | Private post‑event feedback aggregation |

Notes for reviewers:
- Inputs are ciphertext blobs and metadata markers — no plaintext sensitive fields are stored on‑chain.  
- The repo contains demo helpers and test harnesses to simulate reveals and show homomorphic operations in action.

---

## Deployment & Verification

- **Deployed contract (Base Sepolia):** `0xFa7014906a7f7788F2bF75A7eD50911d62211407`  
- **Sourcify Verification (Decentralized):** https://repo.sourcify.dev/contracts/full_match/84532/0xFa7014906a7f7788F2bF75A7eD50911d62211407/
- **Basescan link:** https://base-sepolia.basescan.org/address/0xFa7014906a7f7788F2bF75A7eD50911d62211407

Reproducible testnet deployment (quick):

```bash
# 1. Install deps
npm ci

# 2. Compile
npx hardhat compile

# 3. Deploy to Base Sepolia (set .env values)
npx hardhat run --network baseSepolia scripts/deploy.ts

# 4. Verify on Sourcify (automatic) and Etherscan (optional)
npx hardhat verify --network baseSepolia 0xFa7014906a7f7788F2bF75A7eD50911d62211407 0x0000000000000000000000000000000000000000 0x0000000000000000000000000000000000000000
```

What to verify:
- Confirm `placeEncryptedBid()` stores ciphertexts (tx input shows encrypted payloads).  
- Use demo reveal helpers to verify homomorphic winner selection, demand threshold checks, and encrypted ID verification.  
- Run the included test suite for fhEVM integration:

```bash
npm test
```

---

## Future Vision

- **Mainnet launch plan** — phased rollouts with audited fhEVM modules, secure key management, and production monitoring.  
- **Integration with real event organizers** — white‑label deployments and organizer dashboards that keep attendee data private.  
- **Expanding encrypted loyalty NFTs** — cross‑venue encrypted loyalty and perks systems.  
- **Decentralized attestation bridges** — privacy‑preserving identity attestations across ecosystems without leaking PII.  
- **Enterprise privacy controls** — admin tools for aggregate insights, compliance, and fraud detection without exposing user data.

---

**VeilPass** — bold privacy, practical engineering, and a demo that lets reviewers see homomorphic magic without seeing secrets. If you want a guided verification checklist (tx hashes, demo replay steps, local fhEVM harness), see the submission package attachments included with this entry.
