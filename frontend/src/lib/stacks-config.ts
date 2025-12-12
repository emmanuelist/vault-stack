// Contract details
export const CONTRACT_ADDRESS = 'SPHB047A30W99178TR7KE0784C2GV22070JTKX8';
export const CONTRACT_NAME = 'vault-stack';
export const FULL_CONTRACT_ID = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

// Network configuration
export const NETWORK_TYPE: 'mainnet' | 'testnet' = 'mainnet'; // Change to 'testnet' for testing

// Network config object for read-only calls
export const NETWORK = {
  version: 0x00000001,
  chainId: NETWORK_TYPE === 'mainnet' ? 0x00000001 : 0x80000000,
  coreApiUrl: NETWORK_TYPE === 'mainnet' 
    ? 'https://api.mainnet.hiro.so'
    : 'https://api.testnet.hiro.so',
  broadcastEndpoint: '/v2/transactions',
  transferFeeEstimateEndpoint: '/v2/fees/transfer',
  accountEndpoint: '/v2/accounts',
  contractAbiEndpoint: '/v2/contracts/interface',
  readOnlyFunctionCallEndpoint: '/v2/contracts/call-read',
  isMainnet: () => NETWORK_TYPE === 'mainnet',
  bnsLookupUrl: NETWORK_TYPE === 'mainnet'
    ? 'https://api.mainnet.hiro.so'
    : 'https://api.testnet.hiro.so',
  // Add fetch method required by @stacks/transactions
  fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init),
};

// Block time constants
export const SECONDS_PER_BLOCK = 600; // ~10 minutes on mainnet
export const BLOCKS_PER_DAY = 144;
export const MIN_LOCK_DURATION_SECONDS = 604800; // 7 days
export const MIN_LOCK_DURATION_BLOCKS = Math.ceil(MIN_LOCK_DURATION_SECONDS / SECONDS_PER_BLOCK); // ~1008 blocks

// Interest rate (in basis points: 500 = 5%)
export const ANNUAL_INTEREST_RATE = 500;
export const ANNUAL_INTEREST_RATE_PERCENT = ANNUAL_INTEREST_RATE / 100;

// API endpoints
export const API_URL = NETWORK_TYPE === 'mainnet' 
  ? 'https://api.mainnet.hiro.so'
  : 'https://api.testnet.hiro.so';

// Explorer URL
export const EXPLORER_URL = NETWORK_TYPE === 'mainnet'
  ? 'https://explorer.hiro.so'
  : 'https://explorer.hiro.so/?chain=testnet';

// Local storage keys
export const WALLET_ADDRESS_KEY = 'vault-stack-wallet-address';
export const WALLET_NETWORK_KEY = 'vault-stack-wallet-network';
