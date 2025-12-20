# Auction Commit→Reveal (VeilPass)

This document describes the recommended commit→reveal flow for private/encrypted auctions. The repository includes server endpoints and helpers to get started.

Quick summary
- A bidder creates a secret and a commitment: `commitment = keccak256(abi.encodePacked(bidAmount, secret, nonce))`.
- The bidder signs an EIP-712 typed message that contains the commitment and posts it to `/api/auction/commit`.
- Later, the bidder reveals by sending `bidAmount`, `secret`, `nonce` and a reveal signature to `/api/auction/reveal`.
- The server verifies the reveal matches the stored commitment and marks the bid as revealed.

Files added
- `DATABASE_MIGRATIONS_ADD_AUCTION_COMMITMENTS.sql` — create `auction_commitments` table (run in Supabase SQL editor).
- `src/app/api/auction/commit/route.ts` — POST endpoint to accept signed commitments.
- `src/app/api/auction/reveal/route.ts` — POST endpoint to accept reveals, verify and mark revealed.
- `src/lib/auction.ts` — client helper to create commitments, sign EIP-712 typed data with `ethers`, and submit commit/reveal requests.
- `contracts/AuctionCommitReveal.sol` — Solidity on-chain stub implementing commit/reveal storage.

Run the migration
1. Open the Supabase SQL editor for your project.
2. Run the SQL in `DATABASE_MIGRATIONS_ADD_AUCTION_COMMITMENTS.sql`.

Notes on EIP-712 domain
- Both the client and server must use the same EIP-712 `domain` and `types`. By default the code uses:

```
{ name: 'VeilPass Auction', version: '1', chainId: 1, verifyingContract: '0x0000000000000000000000000000000000000000' }
```

Update `chainId` and `verifyingContract` to match your environment.

Client example (TypeScript + ethers)

See `src/lib/auction.ts` for helpers. Minimal sequence:

1. Create secret and commitment:

```
const secret = createSecret();
const commitment = createCommitment('1000000000000000000', secret, 0); // bid = 1 ETH in wei
```

2. Sign the commitment (EIP-712):

```
const signature = await signCommitment(signer, { commitment, auctionId: 'auction-1', nonce: 0 });
```

3. Submit to server:

```
await submitCommitment('/api/auction/commit', { auctionId: 'auction-1', commitment, signature });
```

Reveal sequence

1. Sign the reveal payload:

```
const revealSig = await signReveal(signer, { auctionId: 'auction-1', bidAmount: '1000000000000000000', secret, nonce: 0 });
```

2. Submit reveal:

```
await submitReveal('/api/auction/reveal', { auctionId: 'auction-1', bidAmount: '1000000000000000000', secret, nonce: 0, signature: revealSig });
```

Security notes
- The server verifies signatures using `ethers.utils.verifyTypedData` and records the recovered address as `bidder_address`.
- The reveal endpoint requires a signature over the reveal payload and checks the recovered signer matches the stored `bidder_address` and that the computed commitment matches.
- If you prefer purely on-chain verification, use the provided Solidity contract; clients commit on-chain via `commit(bytes32 auctionId, bytes32 commitment)` and reveal via `reveal(...)`.

Installing dependencies
- The server code uses `ethers`. If not present, install with:

```bash
npm install ethers
```

Next steps / suggestions
- Add rate-limiting and anti-replay protections (nonce + expiresAt already supported in the typed data).
- Consider storing a hashed/short token in QR payloads instead of secret data.
- If you want the contract to accept EIP-712 signed commitments rather than on-chain commits, you'll need to implement EIP-712 signature verification in Solidity (not included here) or have a relayer that posts the commitment on-chain after verifying the signature server-side.

Settling auctions (server-side)

We provide a server endpoint that selects winners from revealed bids and records results:

- `POST /api/auction/settle` — finds auctions with `revealed = true` commitments and, for each auction without an existing `auction_results` row, selects the bid with the highest `revealed_amount` and inserts a row into `auction_results`.

You should run the SQL migration `DATABASE_MIGRATIONS_ADD_AUCTION_RESULTS.sql` to create the `auction_results` table before using the settle endpoint.

Cron example

If you run your Next.js app locally on port 3000, a simple cron job can call the provided script once per minute (or at your desired cadence):

```bash
# make the script executable once
chmod +x ./scripts/settle_auctions.js

# cron entry (example): run every 5 minutes
*/5 * * * * /usr/bin/node /path/to/repo/scripts/settle_auctions.js >> /var/log/veilpass/settle.log 2>&1
```

When running in production consider using a serverless scheduled job (Vercel/Netlify cron), a server cron, or a managed scheduler and ensure the service can call the internal endpoint (or run the DB-settle logic using Supabase server access).

