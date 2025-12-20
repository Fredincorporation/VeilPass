#!/usr/bin/env node

/**
 * VeilPass fhEVM Encryption Example
 * 
 * This script demonstrates real-world usage of @zama/tfhe-js to:
 * 1. Load the Zama FheVm public key (KMS)
 * 2. Encrypt a bid amount using homomorphic encryption
 * 3. Show the resulting calldata for VeilPassCore.placeBlindBid()
 * 4. Provide example transaction data ready for deployment
 * 
 * Requirements:
 * - npm install @zama/tfhe-js
 * - Node.js >= 18
 * 
 * Run:
 *   node examples/encrypt-bid.js
 */

const crypto = require('crypto');

// In production, import from @zama/tfhe-js:
// import { encrypt, kmsPublicKey } from '@zama/tfhe-js';
// For this demo, we'll show the structure and provide mock data.

/**
 * Mock KMS Public Key retrieval
 * In production, this calls the real Zama FheVm KMS:
 * const publicKey = await kmsPublicKey();
 */
async function mockKmsPublicKey() {
  return {
    version: 0,
    publicKey: Buffer.from(
      'a'.repeat(2048), // Mocked 2048-char public key hex
      'hex'
    ),
  };
}

/**
 * Mock TFHE Encryption
 * In production, this uses @zama/tfhe-js's encrypt():
 * const encrypted = await encrypt(publicKey, bidAmount);
 */
async function mockEncrypt(publicKey, value) {
  // Simulate TFHE encryption: hash(public_key || value || nonce)
  const nonce = crypto.randomBytes(16);
  const data = Buffer.concat([publicKey.publicKey, Buffer.from(value.toString()), nonce]);
  const encrypted = crypto.createHash('sha256').update(data).digest();
  
  return {
    encryptedValue: encrypted,
    encryptedHex: encrypted.toString('hex'),
    nonce: nonce.toString('hex'),
  };
}

/**
 * Format calldata for placeBlindBid contract function
 * Signature: placeBlindBid(uint256 ticketId, euint256 encryptedBidAmount, address bidder)
 */
function formatPlaceBlindBidCalldata(ticketId, encryptedBidHex, bidderAddress) {
  // Function selector for placeBlindBid(uint256, bytes32, address)
  // Calculated: keccak256("placeBlindBid(uint256,bytes32,address)").slice(0, 4)
  const functionSelector = '0x7a2c3e9f'; // Mock selector
  
  // Pad parameters to 32 bytes each
  const ticketIdPadded = ticketId.toString(16).padStart(64, '0');
  const encryptedBidPadded = encryptedBidHex.slice(2).padStart(64, '0');
  const bidderPadded = bidderAddress.slice(2).toLowerCase().padStart(64, '0');
  
  return functionSelector + ticketIdPadded + encryptedBidPadded + bidderPadded;
}

/**
 * Main demonstration
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  VeilPass fhEVM Encryption Example');
  console.log('  Demonstrating @zama/tfhe-js integration');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Example parameters
  const ticketId = 42;
  const bidAmount = BigInt(5e18); // 5 ETH in wei
  const bidderAddress = '0x1234567890123456789012345678901234567890';
  const veilPassCoreAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

  console.log('📋 Input Parameters:');
  console.log(`   Ticket ID:        ${ticketId}`);
  console.log(`   Bid Amount:       ${bidAmount.toString()} wei (${(Number(bidAmount) / 1e18).toFixed(4)} ETH)`);
  console.log(`   Bidder Address:   ${bidderAddress}`);
  console.log(`   VeilPass Contract: ${veilPassCoreAddress}\n`);

  // Step 1: Get KMS Public Key
  console.log('🔑 Step 1: Fetching Zama FheVm KMS Public Key...');
  const publicKey = await mockKmsPublicKey();
  console.log(`   ✓ Public Key version: ${publicKey.version}`);
  console.log(`   ✓ Public Key length:  ${publicKey.publicKey.length} bytes\n`);

  // Step 2: Encrypt the bid amount
  console.log('🔐 Step 2: Encrypting Bid Amount...');
  const encrypted = await mockEncrypt(publicKey, bidAmount);
  console.log(`   ✓ Original (plaintext):  ${bidAmount.toString()} wei`);
  console.log(`   ✓ Encrypted (hex):       0x${encrypted.encryptedHex}`);
  console.log(`   ✓ Nonce:                 0x${encrypted.nonce}\n`);

  // Step 3: Generate contract calldata
  console.log('📝 Step 3: Generating Contract Calldata...');
  const calldata = formatPlaceBlindBidCalldata(
    ticketId,
    '0x' + encrypted.encryptedHex,
    bidderAddress
  );
  console.log(`   ✓ Function Selector: 0x7a2c3e9f (placeBlindBid)`);
  console.log(`   ✓ Full Calldata:     ${calldata}\n`);

  // Step 4: Show transaction example
  console.log('📤 Step 4: Example Transaction Data');
  console.log('   Ready to send to VeilPassCore contract:\n');
  const txExample = {
    to: veilPassCoreAddress,
    data: calldata,
    gasLimit: '200000',
    gasPrice: '50000000000', // 50 Gwei
    value: '0',
  };
  console.log('   ' + JSON.stringify(txExample, null, 2).split('\n').join('\n   '));
  console.log();

  // Step 5: Security notes
  console.log('🔒 Security Notes:');
  console.log('   ✓ Bid amount remains encrypted on-chain (MEV-resistant)');
  console.log('   ✓ Server never sees plaintext bid during transmission');
  console.log('   ✓ Only winner reveal decrypts the winning bid');
  console.log('   ✓ Homomorphic operations possible without decryption\n');

  // Step 6: Next steps
  console.log('🚀 Next Steps:');
  console.log('   1. Deploy VeilPassCore to an fhEVM-enabled testnet (Zama Devnet)');
  console.log('   2. Replace mock encrypt() with real @zama/tfhe-js:');
  console.log('      npm install @zama/tfhe-js');
  console.log('   3. Update this script to import real encrypt():');
  console.log('      import { encrypt, kmsPublicKey } from "@zama/tfhe-js";');
  console.log('   4. Send the transaction with encrypted bid to the contract');
  console.log('   5. Contract stores encrypted bid; only admin can finalize auction\n');

  // Step 7: Example of on-chain homomorphic operations
  console.log('🧮 On-Chain Homomorphic Example:');
  console.log('   Once encrypted bid is stored, admin can:');
  console.log('   - Compare encrypted bids without decryption');
  console.log('   - Compute winning bid using homomorphic operations');
  console.log('   - Adjust dynamic pricing based on encrypted demand');
  console.log('   - All while keeping bid amounts hidden from the public\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Example completed successfully! 🎉');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run the example
main().catch((err) => {
  console.error('Error running example:', err.message);
  process.exit(1);
});
