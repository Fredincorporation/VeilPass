const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  console.log("🚀 Deploying VeilPass contracts to Base Sepolia...\n");

  try {
    // Get signer
    const signers = await ethers.getSigners();
    if (signers.length === 0) {
      throw new Error("No signers available. Check PRIVATE_KEY in .env.local");
    }
    const signer = signers[0];
    console.log("📍 Deploying with account:", signer.address);

    // Deploy VeilPassTicketing
    console.log("Deploying VeilPassTicketing...");
    const VeilPassTicketing = await ethers.getContractFactory("VeilPassTicketing");
    
    // Mock USDC address (use real address in production)
    const mockUSDAbbr = "0x0000000000000000000000000000000000000000";
    const fhevmCore = "0x0000000000000000000000000000000000000000";

    const ticketing = await VeilPassTicketing.deploy(mockUSDAbbr, fhevmCore);
    await ticketing.waitForDeployment();
    const ticketingAddr = await ticketing.getAddress();
    console.log("✅ VeilPassTicketing deployed:", ticketingAddr);

    // Deploy DisputeResolution
    console.log("\nDeploying DisputeResolution...");
    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    const disputes = await DisputeResolution.deploy();
    await disputes.waitForDeployment();
    const disputesAddr = await disputes.getAddress();
    console.log("✅ DisputeResolution deployed:", disputesAddr);

    // Deploy GovernmentIDVerification
    console.log("\nDeploying GovernmentIDVerification...");
    const IDVerification = await ethers.getContractFactory("GovernmentIDVerification");
    const idVerif = await IDVerification.deploy();
    await idVerif.waitForDeployment();
    const idVerifAddr = await idVerif.getAddress();
    console.log("✅ GovernmentIDVerification deployed:", idVerifAddr);

    console.log("\n🎉 All contracts deployed successfully!\n");

    // Save addresses
    const addresses = {
      veilPassTicketing: ticketingAddr,
      disputeResolution: disputesAddr,
      governmentIDVerification: idVerifAddr,
      network: "Base Sepolia",
      timestamp: new Date().toISOString(),
    };

    console.log("📍 Deployment Summary:");
    console.log("========================");
    console.log("VEILPASS_TICKETING_ADDRESS=" + ticketingAddr);
    console.log("DISPUTE_RESOLUTION_ADDRESS=" + disputesAddr);
    console.log("GOVERNMENT_ID_VERIFICATION_ADDRESS=" + idVerifAddr);
    console.log("========================\n");
    console.log("Add these to your .env.local:\n");
    console.log(`NEXT_PUBLIC_VEILPASS_TICKETING_ADDRESS=${ticketingAddr}`);
    console.log(`NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=${disputesAddr}`);
    console.log(`NEXT_PUBLIC_GOVERNMENT_ID_VERIFICATION_ADDRESS=${idVerifAddr}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

main();
