import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

// Contract details
export const CONTRACT_ADDRESS = 'SPHB047A30W99178TR7KE0784C2GV22070JTKX8';
export const CONTRACT_NAME = 'vault-stack';
export const FULL_CONTRACT_ID = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

// Network configuration
export const NETWORK_TYPE: 'mainnet' | 'testnet' = 'mainnet'; // Change to 'testnet' for testing

// Network config object for read-only calls - using proper StacksNetwork instance
export const NETWORK = NETWORK_TYPE === 'mainnet' 
  ? STACKS_MAINNET 
  : STACKS_TESTNET;

// Block time constants
export const SECONDS_PER_BLOCK = 600; // ~10 minutes on mainnet
export const BLOCKS_PER_DAY = 144;
export const MIN_LOCK_DURATION_SECONDS = 604800; // 7 days
export const MIN_LOCK_DURATION_BLOCKS = Math.ceil(MIN_LOCK_DURATION_SECONDS / SECONDS_PER_BLOCK); // ~1008 blocks

// Interest rate (in basis points: 500 = 5%)
export const ANNUAL_INTEREST_RATE = 500;
export const ANNUAL_INTEREST_RATE_PERCENT = ANNUAL_INTEREST_RATE / 100;

// API endpoints - derived from network configuration
export const API_URL = NETWORK.client.baseUrl;

// Explorer URL
export const EXPLORER_URL = NETWORK_TYPE === 'mainnet'
  ? 'https://explorer.hiro.so'
  : 'https://explorer.hiro.so/?chain=testnet';

// Local storage keys
export const WALLET_ADDRESS_KEY = 'vault-stack-wallet-address';
export const WALLET_NETWORK_KEY = 'vault-stack-wallet-network';
