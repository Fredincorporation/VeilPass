import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatPrice(price: number, decimals = 2): string {
  return price.toFixed(decimals);
}

export function formatDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date * 1000) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getExplorerUrl(chainId: number, address: string): string {
  const baseUrls: Record<number, string> = {
    84532: "https://sepolia.basescan.org",
    1: "https://etherscan.io",
  };
  const baseUrl = baseUrls[chainId] || "https://sepolia.basescan.org";
  return `${baseUrl}/address/${address}`;
}

export function encryptClientSide(data: string): string {
  // Placeholder for client-side encryption
  // In production, use Zama's fhEVM SDK
  return Buffer.from(data).toString("base64");
}

export function decryptClientSide(encrypted: string): string {
  // Placeholder for client-side decryption
  // In production, use Zama's fhEVM SDK with proof
  return Buffer.from(encrypted, "base64").toString();
}
