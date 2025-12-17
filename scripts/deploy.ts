import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying VeilPass contracts to Base Sepolia...\n");

  // Deploy VeilPassTicketing
  const VeilPassTicketing = await ethers.getContractFactory("VeilPassTicketing");
  
  // Mock USDC address (use real address in production)
  const mockUSDAbbr = "0x0000000000000000000000000000000000000000";
  const fhevmCore = "0x0000000000000000000000000000000000000000";

  const ticketing = await VeilPassTicketing.deploy(mockUSDAbbr, fhevmCore);
  await ticketing.waitForDeployment();
  console.log("✅ VeilPassTicketing deployed:", await ticketing.getAddress());

  // Deploy DisputeResolution
  const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
  const disputes = await DisputeResolution.deploy();
  await disputes.waitForDeployment();
  console.log("✅ DisputeResolution deployed:", await disputes.getAddress());

  // Deploy GovernmentIDVerification
  const IDVerification = await ethers.getContractFactory("GovernmentIDVerification");
  const idVerif = await IDVerification.deploy();
  await idVerif.waitForDeployment();
  console.log("✅ GovernmentIDVerification deployed:", await idVerif.getAddress());

  console.log("\n🎉 All contracts deployed successfully!\n");

  // Save addresses to file
  const addresses = {
    veilPassTicketing: await ticketing.getAddress(),
    disputeResolution: await disputes.getAddress(),
    governmentIDVerification: await idVerif.getAddress(),
    network: "Base Sepolia",
    timestamp: new Date().toISOString(),
  };

  console.log("Deployment addresses:", addresses);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
