import { expect } from "chai";
import { ethers } from "hardhat";

describe("VeilPass Smart Contracts", function () {
  let ticketing: any;
  let disputes: any;
  let idVerification: any;
  let owner: any;
  let seller: any;
  let customer: any;

  const TEST_WALLETS = {
    seller: "0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B",
    customer: "0xe0CB9745b22E2DA16155bAC21A60d3ffF7354774",
  };

  before(async function () {
    [owner, seller, customer] = await ethers.getSigners();

    // Deploy contracts
    const VeilPassTicketing = await ethers.getContractFactory("VeilPassTicketing");
    ticketing = await VeilPassTicketing.deploy(ethers.ZeroAddress, ethers.ZeroAddress);
    await ticketing.waitForDeployment();

    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    disputes = await DisputeResolution.deploy();
    await disputes.waitForDeployment();

    const IDVerification = await ethers.getContractFactory("GovernmentIDVerification");
    idVerification = await IDVerification.deploy();
    await idVerification.waitForDeployment();
  });

  describe("VeilPassTicketing", function () {
    it("Should allow seller registration", async function () {
      await ticketing.registerSeller(seller.address);
      expect(await ticketing.isSeller(seller.address)).to.be.true;
    });

    it("Should allow approved sellers to create events", async function () {
      const tx = await ticketing
        .connect(seller)
        .createEvent("Test Event", "A test event", Math.floor(Date.now() / 1000) + 86400, ethers.parseEther("0.1"), 100);
      
      await tx.wait();
      const eventId = 1;
      const event = await ticketing.events(eventId);
      expect(event.title).to.equal("Test Event");
    });

    it("Should allow ticket purchase", async function () {
      const eventId = 1;
      const price = ethers.parseEther("0.1");

      const tx = await ticketing.connect(customer).purchaseTicket(eventId, ethers.ZeroHash, false, {
        value: price,
      });

      await tx.wait();
      const ticketIds = await ticketing.getUserTickets(customer.address);
      expect(ticketIds.length).to.be.greaterThan(0);
    });

    it("Should track loyalty points", async function () {
      const points = await ticketing.getLoyaltyPoints(customer.address);
      expect(points).to.be.greaterThan(0);
    });
  });

  describe("DisputeResolution", function () {
    it("Should create disputes", async function () {
      const tx = await disputes
        .connect(customer)
        .createDispute(1, seller.address, "Invalid ticket");
      
      await tx.wait();
      const disputeId = 1;
      const dispute = await disputes.getDispute(disputeId);
      expect(dispute.reason).to.equal("Invalid ticket");
    });

    it("Should allow admin to resolve disputes", async function () {
      const RESOLVED = 2;
      const tx = await disputes.resolveDispute(1, RESOLVED);
      await tx.wait();

      const dispute = await disputes.getDispute(1);
      expect(dispute.status).to.equal(RESOLVED);
    });
  });

  describe("GovernmentIDVerification", function () {
    it("Should accept ID submissions", async function () {
      const tx = await idVerification
        .connect(customer)
        .submitID("0x1234567890", 0x12345678);
      
      await tx.wait();
      const proof = await idVerification.getUserProof(customer.address);
      expect(proof.user).to.equal(customer.address);
    });

    it("Should verify ID proofs", async function () {
      const proofId = 1;
      const tx = await idVerification.verifyIDProof(proofId, true, true, true, true);
      await tx.wait();

      const proof = await idVerification.getProof(proofId);
      expect(proof.verified).to.be.true;
    });
  });
});
