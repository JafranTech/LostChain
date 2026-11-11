import { keccak256, toHex } from "viem";
import LostChainContract from "./contracts/LostChain.json";

export const LOSTCHAIN_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || LostChainContract.address
) as `0x${string}`;

export const LOSTCHAIN_ABI = LostChainContract.abi;

/**
 * Normalizes and hashes text using Keccak256 matching the smart contract's formatTextForHashing
 */
export function hashField(text: string): `0x${string}` {
  if (!text) {
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
  const cleaned = text.replace(/\s+/g, "").toLowerCase();
  return keccak256(toHex(cleaned));
}

/**
 * Generates a random bytes32 salt
 */
export function generateSalt(): `0x${string}` {
  const randomStr = "salt_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
  return keccak256(toHex(randomStr));
}

