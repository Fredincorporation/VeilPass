# 🔧 Copy-Paste Instructions

## Step 1: Generate Wallet

Run this EXACTLY:

```bash
cd /home/bigfred/Documents/GitHub/veilpass && node -e "const ethers = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey);"
```

You'll get output like:
```
Address: 0x...
Private Key: 0x...
```

---

## Step 2: Update `.env.local`

Open `.env.local` and add this line:

```
PRIVATE_KEY=0x(paste_your_private_key_here)
```

Example:
```
PRIVATE_KEY=0xabcd1234ef5678...
```

---

## Step 3: Run These Commands in Order

### Command 1: Compile
```bash
npm run contracts:compile
```

### Command 2: Deploy
```bash
npm run contracts:deploy
```

When deployment finishes, you'll see:
```
✅ GovernmentIDVerification deployed: 0x1234567890ABCDEF...
```

**Copy that address!**

---

## Step 4: Update `.env.local` Again

Add this to `.env.local`:

```
NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS=0x(paste_address_here)
```

Example:
```
NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS=0x1234567890ABCDEF1234567890ABCDEF12345678
```

---

## Step 5: Restart Dev Server

```bash
npm run dev
```

---

## ✅ You're Done!

The contracts are now deployed and connected!

---

## 📝 For Reference

**Files I created for you:**

1. `contracts/GovernmentIDVerification.sol` - Smart contract
   - Stores encrypted seller IDs
   - Admin verification logic
   - On-chain scoring system

2. `src/lib/contractInteraction.ts` - Frontend utilities
   - Encrypt ID data
   - Submit to contract
   - Fetch verification records

3. `SELLER_ID_VERIFICATION_SETUP.md` - Full guide
   - Detailed explanations
   - What each part does
   - Troubleshooting

---

## 🚀 Next: Test the Feature

1. Go to: http://localhost:3000/admin/seller-ids
2. Click on a seller
3. Click "Decrypt & Verify with fhEVM"
4. It will now fetch from the smart contract!

---

**Total time: ~10 minutes**

No real funds needed - using free testnet ETH! 💰
