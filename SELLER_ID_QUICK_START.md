# 🚀 Quick Start: Seller ID Verification Setup (10 Minutes)

## What's Ready ✅

I've created everything you need. You just need to execute 4 commands:

```
1. Add private key to .env.local
2. Get testnet ETH from faucet
3. Compile contracts
4. Deploy to Base Sepolia
```

---

## 📋 Step-by-Step (Do this now!)

### Step 1: Add Private Key (2 minutes)

**Generate a test wallet:**
```bash
cd /home/bigfred/Documents/GitHub/veilpass
node -e "const ethers = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey);"
```

**Copy the output and add to `.env.local`:**
```
PRIVATE_KEY=0x... (paste the private key here)
```

---

### Step 2: Get Free Testnet ETH (2 minutes)

1. Go to: https://www.sepoliafaucet.io/
2. Paste your wallet address
3. Request ETH
4. Wait 1-2 minutes

✅ You now have free testnet ETH!

---

### Step 3: Compile Contracts (1 minute)

```bash
npm run contracts:compile
```

**Expected:**
```
✔ 3 compiled successfully
```

---

### Step 4: Deploy to Base Sepolia (5 minutes)

```bash
npm run contracts:deploy
```

**Expected output:**
```
✅ VeilPassTicketing deployed: 0x...
✅ DisputeResolution deployed: 0x...
✅ GovernmentIDVerification deployed: 0x...
🎉 All contracts deployed successfully!
```

---

### Step 5: Add Contract Addresses to `.env.local`

Copy the addresses from deployment output and add to `.env.local`:

```
NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS=0x...
NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS=0x...
```

---

### Step 6: Restart Dev Server

```bash
npm run dev
```

---

## ✅ Done!

Your seller ID verification is now:
- ✅ Deployed to Base Sepolia testnet
- ✅ Connected to smart contract
- ✅ Using Zama fhEVM encryption
- ✅ Admin dashboard ready

---

## 📁 What Was Created

| File | Purpose |
|------|---------|
| `contracts/GovernmentIDVerification.sol` | Smart contract for on-chain ID verification |
| `src/lib/contractInteraction.ts` | Functions to interact with smart contract from frontend |
| `SELLER_ID_VERIFICATION_SETUP.md` | Detailed setup guide (if you need it) |

---

## 🧪 Test It

1. Go to Admin > Seller IDs
2. Click "Decrypt & Verify with fhEVM"
3. Should connect to Base Sepolia contract

---

## ❓ Problems?

**"PRIVATE_KEY not found"**
- Add it to `.env.local` and restart terminal

**"No testnet ETH"**
- Get more from https://www.sepoliafaucet.io/

**"Contract not found"**
- Make sure you added the contract addresses to `.env.local`

---

## 📞 Need Details?

Read: `SELLER_ID_VERIFICATION_SETUP.md`

That's it! 🎉
