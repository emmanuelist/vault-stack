import { Cl, ClarityValue, cvToValue, cvToJSON } from '@stacks/transactions';

/**
 * Calculate interest based on amount and duration
 * @param amount Amount in micro-STX
 * @param durationSeconds Duration in seconds
 * @returns Interest earned in micro-STX
 */
export function calculateInterest(amount: bigint, durationSeconds: bigint): bigint {
  const secondsPerYear = 31536000n; // 365 days
  const interestRate = 500n; // 5% in basis points
  
  // Calculate: (amount * rate * duration) / (10000 * seconds_per_year)
  const interest = (amount * interestRate * durationSeconds) / (10000n * secondsPerYear);
  return interest;
}

/**
 * Convert STX to micro-STX
 * @param stx Amount in STX
 * @returns Amount in micro-STX
 */
export function stxToMicroStx(stx: number): bigint {
  return BigInt(Math.floor(stx * 1000000));
}

/**
 * Convert micro-STX to STX
 * @param microStx Amount in micro-STX
 * @returns Amount in STX
 */
export function microStxToStx(microStx: bigint | number): number {
  return Number(microStx) / 1000000;
}

/**
 * Format STX amount for display
 * @param microStx Amount in micro-STX
 * @param decimals Number of decimal places
 * @returns Formatted STX string
 */
export function formatStx(microStx: bigint | number, decimals: number = 6): string {
  const stx = microStxToStx(typeof microStx === 'bigint' ? microStx : BigInt(microStx));
  return stx.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

/**
 * Convert days to blocks
 * @param days Number of days
 * @returns Number of blocks
 */
export function daysToBlocks(days: number): number {
  return Math.round(days * 144); // ~144 blocks per day
}

/**
 * Convert blocks to days
 * @param blocks Number of blocks
 * @returns Number of days
 */
export function blocksToDays(blocks: number): number {
  return blocks / 144;
}

/**
 * Convert seconds to blocks
 * @param seconds Number of seconds
 * @returns Number of blocks
 */
export function secondsToBlocks(seconds: number): number {
  return Math.ceil(seconds / 600); // ~600 seconds per block
}

/**
 * Convert blocks to seconds
 * @param blocks Number of blocks
 * @returns Number of seconds
 */
export function blocksToSeconds(blocks: number): number {
  return blocks * 600;
}

/**
 * Format block height to estimated date
 * @param blockHeight Future block height
 * @param currentBlockHeight Current block height
 * @returns Estimated date
 */
export function blockHeightToDate(blockHeight: number, currentBlockHeight: number): Date {
  const blocksRemaining = blockHeight - currentBlockHeight;
  const secondsRemaining = blocksToSeconds(blocksRemaining);
  return new Date(Date.now() + secondsRemaining * 1000);
}

/**
 * Get time remaining until a block height
 * @param unlockBlock Unlock block height
 * @param currentBlock Current block height
 * @returns Object with days, hours, minutes
 */
export function getTimeRemaining(unlockBlock: number, currentBlock: number): {
  days: number;
  hours: number;
  minutes: number;
  totalSeconds: number;
} {
  const blocksRemaining = Math.max(0, unlockBlock - currentBlock);
  const totalSeconds = blocksToSeconds(blocksRemaining);
  
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return { days, hours, minutes, totalSeconds };
}

/**
 * Parse Clarity value to JavaScript value
 * @param clarityValue Clarity value from contract
 * @returns Parsed JavaScript value
 */
export function parseClarityValue(clarityValue: ClarityValue): unknown {
  try {
    return cvToValue(clarityValue);
  } catch (error) {
    console.error('Error parsing Clarity value:', error);
    return cvToJSON(clarityValue);
  }
}

/**
 * Format transaction ID for display
 * @param txId Transaction ID
 * @returns Shortened transaction ID
 */
export function formatTxId(txId: string): string {
  if (txId.length <= 16) return txId;
  return `${txId.substring(0, 8)}...${txId.substring(txId.length - 8)}`;
}

/**
 * Format address for display
 * @param address Stacks address
 * @returns Shortened address
 */
export function formatAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Validate Stacks address
 * @param address Address to validate
 * @returns True if valid
 */
export function isValidStacksAddress(address: string): boolean {
  // Stacks addresses start with SP (mainnet) or ST (testnet)
  return /^S[PT][0-9A-Z]+$/.test(address);
}

/**
 * Create Clarity value for amount
 * @param amount Amount in micro-STX
 * @returns Clarity uint value
 */
export function createAmountCV(amount: bigint): ClarityValue {
  return Cl.uint(amount);
}

/**
 * Create Clarity value for duration
 * @param durationBlocks Duration in blocks
 * @returns Clarity uint value
 */
export function createDurationCV(durationBlocks: number): ClarityValue {
  return Cl.uint(durationBlocks);
}

/**
 * Create Clarity value for vault ID
 * @param vaultId Vault ID
 * @returns Clarity uint value
 */
export function createVaultIdCV(vaultId: number): ClarityValue {
  return Cl.uint(vaultId);
}
