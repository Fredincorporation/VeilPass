import type { Signer } from 'ethers';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { randomBytes } from 'crypto';

/*
  Helper utilities for commit->reveal auction flow.

  Usage summary:
  - createCommitment(bidAmount, secret, nonce) => bytes32 hex
  - signCommitment(signer, domain, commitmentPayload) => signature (EIP-712)
  - submitCommitment(endpoint, payload) => POST commit
  - signReveal(signer, domain, revealPayload) => signature for reveal
  - submitReveal(endpoint, payload) => POST reveal

  NOTE: The EIP-712 `domain` must match server-side `EIP712_DOMAIN`.
*/

export function createSecret(): string {
  // random 32-byte secret
  return '0x' + randomBytes(32).toString('hex');
}

export function createCommitment(bidAmount: string | number, secret: string, nonce = 0) {
  // Use solidityKeccak256 with the same types as server-side: uint256, bytes32, uint256
  return solidityKeccak256(
    ['uint256', 'bytes32', 'uint256'],
    [String(bidAmount), secret, Number(nonce)],
  );
}

export const EIP712_DOMAIN = {
  name: 'VeilPass Auction',
  version: '1',
  chainId: 1,
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

export const COMMITMENT_TYPES = {
  Commitment: [
    { name: 'commitment', type: 'bytes32' },
    { name: 'auctionId', type: 'string' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiresAt', type: 'uint256' },
  ],
};

export const REVEAL_TYPES = {
  Reveal: [
    { name: 'auctionId', type: 'string' },
    { name: 'bidAmount', type: 'uint256' },
    { name: 'secret', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
  ],
};

export async function signCommitment(
  signer: Signer,
  payload: { commitment: string; auctionId: string; nonce?: number; expiresAt?: number },
) {
  const value = {
    commitment: payload.commitment,
    auctionId: payload.auctionId,
    nonce: Number(payload.nonce || 0),
    expiresAt: Number(payload.expiresAt || 0),
  };
  // _signTypedData(domain, types, value)
  return await (signer as any)._signTypedData(EIP712_DOMAIN, COMMITMENT_TYPES, value);
}

export async function submitCommitment(endpoint: string, body: any) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function signReveal(
  signer: Signer,
  payload: { auctionId: string; bidAmount: string | number; secret: string; nonce?: number },
) {
  const value = {
    auctionId: payload.auctionId,
    bidAmount: String(payload.bidAmount),
    secret: payload.secret,
    nonce: Number(payload.nonce || 0),
  };
  return await (signer as any)._signTypedData(EIP712_DOMAIN, REVEAL_TYPES, value);
}

export async function submitReveal(endpoint: string, body: any) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Example usage (for docs/testing):
// const secret = createSecret();
// const commitment = createCommitment('1000000000000000000', secret, 0);
// const sig = await signCommitment(signer, { commitment, auctionId: 'auction-1' });
// await submitCommitment('/api/auction/commit', { auctionId: 'auction-1', commitment, signature: sig });
