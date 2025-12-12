import { request } from '@stacks/connect';
import { 
  fetchCallReadOnlyFunction,
  Cl,
  ClarityValue,
  cvToValue,
  PostCondition,
  Pc,
  FungibleConditionCode,
} from '@stacks/transactions';
import { 
  CONTRACT_ADDRESS, 
  CONTRACT_NAME, 
  NETWORK,
  NETWORK_TYPE,
} from './stacks-config';
import { 
  createAmountCV, 
  createDurationCV, 
  createVaultIdCV,
  parseClarityValue,
  extractClarityValue,
  microStxToStx,
  blocksToSeconds,
} from './stacks-utils';

export interface VaultData {
  owner: string;
  amount: bigint;
  depositTime: bigint;
  unlockTime: bigint;
  interestEarned: bigint;
  withdrawn: boolean;
}

export interface VaultStatus {
  vaultId: number;
  owner: string;
  amount: bigint;
  depositTime: bigint;
  unlockTime: bigint;
  currentTime: bigint;
  isUnlocked: boolean;
  timeRemaining: bigint;
  interestEarned: bigint;
  withdrawn: boolean;
}

/**
 * Create a new vault
 * @param amount Amount in micro-STX
 * @param lockDuration Duration in seconds
 * @param senderAddress Sender's address
 * @returns Transaction ID
 */
export async function createVault(
  amount: bigint,
  lockDuration: number,
  senderAddress: string
): Promise<string> {
  try {
    // Create post-condition to ensure the user sends the correct amount
    const postCondition = Pc.principal(senderAddress)
      .willSendEq(Number(amount))
      .ustx();

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'create-vault',
      functionArgs: [
        createAmountCV(amount),
        Cl.uint(lockDuration),
      ],
      network: NETWORK_TYPE,
      postConditions: [postCondition],
      postConditionMode: 'deny', // Deny transaction if post-conditions aren't met
    });

    return response.txid;
  } catch (error) {
    console.error('Error creating vault:', error);
    throw new Error('Failed to create vault. Transaction rejected or failed.');
  }
}

/**
 * Withdraw from a vault
 * @param vaultId Vault ID
 * @param senderAddress Sender's address
 * @returns Transaction ID
 */
export async function withdrawFromVault(
  vaultId: number,
  senderAddress: string
): Promise<string> {
  try {
    // Get vault info to create proper post-condition
    const vaultStatus = await getVaultStatus(vaultId);
    
    if (!vaultStatus.isUnlocked) {
      throw new Error('Vault is still locked');
    }

    if (vaultStatus.withdrawn) {
      throw new Error('Vault has already been withdrawn');
    }

    const totalAmount = vaultStatus.amount + vaultStatus.interestEarned;

    // Post-condition: contract must send at least the total amount to the user
    const postCondition = Pc.principal(CONTRACT_ADDRESS)
      .willSendEq(Number(totalAmount))
      .ustx();

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'withdraw-from-vault',
      functionArgs: [createVaultIdCV(vaultId)],
      network: NETWORK_TYPE,
      postConditions: [postCondition],
      postConditionMode: 'deny',
    });

    return response.txid;
  } catch (error) {
    console.error('Error withdrawing from vault:', error);
    throw new Error('Failed to withdraw from vault. Transaction rejected or failed.');
  }
}

/**
 * Emergency withdraw from a vault (forfeit interest)
 * @param vaultId Vault ID
 * @param senderAddress Sender's address
 * @returns Transaction ID
 */
export async function emergencyWithdraw(
  vaultId: number,
  senderAddress: string
): Promise<string> {
  try {
    // Get vault info
    const vaultStatus = await getVaultStatus(vaultId);
    
    if (vaultStatus.withdrawn) {
      throw new Error('Vault has already been withdrawn');
    }

    // Post-condition: contract must send the principal amount (no interest)
    const postCondition = Pc.principal(CONTRACT_ADDRESS)
      .willSendEq(Number(vaultStatus.amount))
      .ustx();

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'emergency-withdraw',
      functionArgs: [createVaultIdCV(vaultId)],
      network: NETWORK_TYPE,
      postConditions: [postCondition],
      postConditionMode: 'deny',
    });

    return response.txid;
  } catch (error) {
    console.error('Error performing emergency withdrawal:', error);
    throw new Error('Failed to perform emergency withdrawal. Transaction rejected or failed.');
  }
}

/**
 * Fund the contract (admin only)
 * @param amount Amount in micro-STX
 * @param senderAddress Sender's address
 * @returns Transaction ID
 */
export async function fundContract(
  amount: bigint,
  senderAddress: string
): Promise<string> {
  try {
    const postCondition = Pc.principal(senderAddress)
      .willSendEq(Number(amount))
      .ustx();

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'fund-contract',
      functionArgs: [createAmountCV(amount)],
      network: NETWORK_TYPE,
      postConditions: [postCondition],
      postConditionMode: 'deny',
    });

    return response.txid;
  } catch (error) {
    console.error('Error funding contract:', error);
    throw new Error('Failed to fund contract. Transaction rejected or failed.');
  }
}

// ========== Read-only functions ==========

/**
 * Get vault data
 * @param vaultId Vault ID
 * @returns Vault data or null
 */
export async function getVault(vaultId: number): Promise<VaultData | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-vault',
      functionArgs: [createVaultIdCV(vaultId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = parseClarityValue(result) as any;
    
    if (!value || value.type === 'none') {
      return null;
    }

    // Extract the vault data and convert nested Clarity values
    const vaultData = extractClarityValue(value.value);
    
    return {
      owner: vaultData.owner,
      amount: BigInt(vaultData.amount),
      depositTime: BigInt(vaultData['deposit-time']),
      unlockTime: BigInt(vaultData['unlock-time']),
      interestEarned: BigInt(vaultData['interest-earned']),
      withdrawn: vaultData.withdrawn,
    };
  } catch (error) {
    console.error('Error fetching vault:', error);
    return null;
  }
}

/**
 * Get vault status with current time information
 * @param vaultId Vault ID
 * @returns Vault status or null
 */
export async function getVaultStatus(vaultId: number): Promise<VaultStatus> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-vault-status',
      functionArgs: [createVaultIdCV(vaultId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = parseClarityValue(result) as any;
    
    if (!value || value.type === 'error') {
      throw new Error('Vault not found');
    }

    // Extract the status data and convert nested Clarity values
    const statusData = extractClarityValue(value.value);
    
    return {
      vaultId: Number(statusData['vault-id']),
      owner: statusData.owner,
      amount: BigInt(statusData.amount),
      depositTime: BigInt(statusData['deposit-time']),
      unlockTime: BigInt(statusData['unlock-time']),
      currentTime: BigInt(statusData['current-time']),
      isUnlocked: statusData['is-unlocked'],
      timeRemaining: BigInt(statusData['time-remaining']),
      interestEarned: BigInt(statusData['interest-earned']),
      withdrawn: statusData.withdrawn,
    };
  } catch (error) {
    console.error('Error fetching vault status:', error);
    throw error;
  }
}

/**
 * Get user's vault IDs
 * @param userAddress User's address
 * @returns Array of vault IDs
 */
export async function getUserVaults(userAddress: string): Promise<number[]> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-vaults',
      functionArgs: [Cl.principal(userAddress)],
      network: NETWORK,
      senderAddress: userAddress,
    });

    // Parse the Clarity tuple { vault-ids: (list uint) }
    // cvToValue converts the tuple but leaves nested Clarity values
    const value = cvToValue(result);
    
    // The contract returns a tuple { vault-ids: (list uint) }
    if (!value || typeof value !== 'object') {
      return [];
    }
    
    // Access vault-ids property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vaultIdsCV = (value as any)['vault-ids'];
    
    if (!vaultIdsCV) {
      return [];
    }
    
    // The list is still a Clarity value object with {type, value}
    // Extract the actual array from the .value property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let vaultIds: any[];
    
    if (Array.isArray(vaultIdsCV)) {
      // Already an array
      vaultIds = vaultIdsCV;
    } else if (vaultIdsCV.value && Array.isArray(vaultIdsCV.value)) {
      // ClarityValue object with .value array
      vaultIds = vaultIdsCV.value;
    } else {
      console.warn('Unexpected vault-ids structure:', vaultIdsCV);
      return [];
    }
    
    // Convert each ID to number (they might be bigint or Clarity values)
    return vaultIds.map((id: unknown) => {
      if (typeof id === 'bigint') {
        return Number(id);
      }
      if (typeof id === 'number') {
        return id;
      }
      // If it's still a Clarity value, convert it
      return Number(cvToValue(id as ClarityValue));
    });
  } catch (error) {
    console.error('Error fetching user vaults:', error);
    return [];
  }
}

/**
 * Get total deposits
 * @returns Total deposits in micro-STX
 */
export async function getTotalDeposits(): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-deposits',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = parseClarityValue(result) as any;
    const extracted = extractClarityValue(value.value);
    return BigInt(extracted);
  } catch (error) {
    console.error('Error fetching total deposits:', error);
    return 0n;
  }
}

/**
 * Get vault counter (total number of vaults created)
 * @returns Vault counter
 */
export async function getVaultCounter(): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-vault-counter',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = parseClarityValue(result) as any;
    const extracted = extractClarityValue(value.value);
    return Number(extracted);
  } catch (error) {
    console.error('Error fetching vault counter:', error);
    return 0;
  }
}

/**
 * Get contract balance
 * @returns Contract balance in micro-STX
 */
export async function getContractBalance(): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-contract-balance',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = parseClarityValue(result) as any;
    const extracted = extractClarityValue(value.value);
    return BigInt(extracted);
  } catch (error) {
    console.error('Error fetching contract balance:', error);
    return 0n;
  }
}

/**
 * Get current block height (time)
 * @returns Current block height
 */
export async function getCurrentTime(): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-current-time',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = parseClarityValue(result) as any;
    const extracted = extractClarityValue(value.value);
    return Number(extracted);
  } catch (error) {
    console.error('Error fetching current time:', error);
    return 0;
  }
}

/**
 * Calculate interest for given amount and duration
 * @param amount Amount in micro-STX
 * @param duration Duration in seconds
 * @returns Interest earned in micro-STX
 */
export async function calculateInterest(amount: bigint, duration: number): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'calculate-interest',
      functionArgs: [
        createAmountCV(amount),
        Cl.uint(duration),
      ],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = parseClarityValue(result) as any;
    return BigInt(value.value);
  } catch (error) {
    console.error('Error calculating interest:', error);
    return 0n;
  }
}
