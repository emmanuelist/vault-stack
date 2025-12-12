import { API_URL } from './stacks-config';

export interface AccountBalance {
  stx: {
    balance: string;
    total_sent: string;
    total_received: string;
    locked: string;
  };
}

export interface Transaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  block_height: number;
  burn_block_time: number;
  burn_block_time_iso: string;
  sender_address: string;
  fee_rate: string;
}

/**
 * Fetch account balance
 * @param address Stacks address
 * @returns Account balance information
 */
export async function fetchAccountBalance(address: string): Promise<bigint> {
  try {
    const response = await fetch(`${API_URL}/extended/v1/address/${address}/balances`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.statusText}`);
    }

    const data: AccountBalance = await response.json();
    return BigInt(data.stx.balance);
  } catch (error) {
    console.error('Error fetching account balance:', error);
    return 0n;
  }
}

/**
 * Fetch current block height
 * @returns Current block height
 */
export async function fetchCurrentBlockHeight(): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/v2/info`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch block height: ${response.statusText}`);
    }

    const data = await response.json();
    return data.stacks_tip_height;
  } catch (error) {
    console.error('Error fetching block height:', error);
    return 0;
  }
}

/**
 * Fetch account transactions
 * @param address Stacks address
 * @param limit Number of transactions to fetch
 * @returns Array of transactions
 */
export async function fetchAccountTransactions(
  address: string,
  limit: number = 50
): Promise<Transaction[]> {
  try {
    const response = await fetch(
      `${API_URL}/extended/v1/address/${address}/transactions?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Fetch transaction by ID
 * @param txId Transaction ID
 * @returns Transaction data
 */
export async function fetchTransaction(txId: string): Promise<Transaction | null> {
  try {
    const response = await fetch(`${API_URL}/extended/v1/tx/${txId}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

/**
 * Wait for transaction confirmation
 * @param txId Transaction ID
 * @param maxAttempts Maximum number of polling attempts
 * @param interval Polling interval in milliseconds
 * @returns True if confirmed, false if failed or timed out
 */
export async function waitForTransactionConfirmation(
  txId: string,
  maxAttempts: number = 30,
  interval: number = 2000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const tx = await fetchTransaction(txId);
      
      if (tx?.tx_status === 'success') {
        return true;
      }
      
      if (tx?.tx_status === 'abort_by_response' || tx?.tx_status === 'abort_by_post_condition') {
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error('Error polling transaction:', error);
    }
  }
  
  return false;
}
