import { ContractEvent, ethers } from 'ethers';

const VEILPASS_ABI = [
  'function createEvent(string title, string description, uint256 date, uint256 basePrice, uint256 totalTickets) returns (uint256)',
  'function purchaseTicket(uint256 eventId, bytes encryptedPrice, bool useUSDC) returns (uint256)',
  'function getUserTickets(address user) returns (uint256[])',
  'function getLoyaltyPoints(address user) returns (uint256)',
  'function placeBlindBid(uint256 ticketId, bytes encryptedBid, address bidder) returns (uint256)',
  'event EventCreated(uint256 indexed eventId, address indexed seller, string title)',
  'event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, address indexed buyer, uint256 price)',
];

export async function createEvent(
  contract: ethers.Contract,
  title: string,
  description: string,
  date: number,
  basePrice: string,
  totalTickets: number
) {
  const tx = await contract.createEvent(title, description, date, basePrice, totalTickets);
  return tx.wait();
}

export async function purchaseTicket(
  contract: ethers.Contract,
  eventId: number,
  encryptedPrice: string,
  useUSDC: boolean,
  value?: string
) {
  const options = value ? { value: ethers.parseEther(value) } : {};
  const tx = await contract.purchaseTicket(eventId, encryptedPrice, useUSDC, options);
  return tx.wait();
}

export async function placeBlindBid(
  contract: ethers.Contract,
  ticketId: number,
  encryptedBid: string,
  bidderAddress: string
) {
  const tx = await contract.placeBlindBid(ticketId, encryptedBid, bidderAddress);
  return tx.wait();
}
