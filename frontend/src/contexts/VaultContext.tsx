import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as walletService from '@/lib/wallet';
import * as contractService from '@/lib/contract';
import * as apiService from '@/lib/api';
import { 
  microStxToStx, 
  stxToMicroStx, 
  blockHeightToDate, 
  blocksToSeconds 
} from '@/lib/stacks-utils';
import { ANNUAL_INTEREST_RATE_PERCENT, CONTRACT_ADDRESS, CONTRACT_NAME, MIN_LOCK_DURATION_BLOCKS } from '@/lib/stacks-config';

export type VaultStatus = 'locked' | 'unlocked' | 'withdrawn';

export interface Vault {
  id: string;
  owner: string;
  principal: number;
  interestRate: number;
  interestEarned: number;
  depositBlock: number;
  unlockBlock: number;
  status: VaultStatus;
  createdAt: Date;
  withdrawnAt?: Date;
}

export interface Activity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'funding' | 'unlock';
  vaultId?: string;
  amount: number;
  address: string;
  blockHeight: number;
  timestamp: Date;
  txHash: string;
}

export interface ContractStats {
  totalDeposits: number;
  totalVaults: number;
  contractBalance: number;
  currentBlockHeight: number;
  interestRate: number;
  totalInterestPaid: number;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: 'mainnet' | 'testnet';
}

interface VaultContextType {
  vaults: Vault[];
  userVaults: Vault[];
  activities: Activity[];
  stats: ContractStats;
  wallet: WalletState;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  createVault: (amount: number, durationBlocks: number) => Promise<Vault>;
  withdrawVault: (vaultId: string) => Promise<void>;
  emergencyWithdraw: (vaultId: string) => Promise<void>;
  getVaultById: (id: string) => Vault | undefined;
  refreshData: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

/**
 * Convert contract vault data to app Vault interface
 */
function convertVaultData(
  vaultId: number,
  vaultStatus: contractService.VaultStatus,
  currentBlockHeight: number
): Vault {
  const principal = microStxToStx(vaultStatus.amount);
  const interestEarned = microStxToStx(vaultStatus.interestEarned);
  const depositBlock = Number(vaultStatus.depositTime);
  const unlockBlock = Number(vaultStatus.unlockTime);
  
  let status: VaultStatus;
  if (vaultStatus.withdrawn) {
    status = 'withdrawn';
  } else if (vaultStatus.isUnlocked) {
    status = 'unlocked';
  } else {
    status = 'locked';
  }

  const createdAt = blockHeightToDate(depositBlock, currentBlockHeight);
  
  return {
    id: vaultId.toString(),
    owner: vaultStatus.owner,
    principal,
    interestRate: ANNUAL_INTEREST_RATE_PERCENT,
    interestEarned,
    depositBlock,
    unlockBlock,
    status,
    createdAt,
    withdrawnAt: vaultStatus.withdrawn ? new Date() : undefined,
  };
}

/**
 * Parse blockchain transactions to Activity objects
 */
function parseTransactionsToActivities(
  transactions: apiService.Transaction[],
  userAddress: string
): Activity[] {
  const activities: Activity[] = [];
  
  for (const tx of transactions) {
    // Only process successful contract calls to our vault contract
    if (tx.tx_status !== 'success' || tx.tx_type !== 'contract_call') {
      continue;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contractCall = tx as any;
    
    // Check if it's a call to our contract
    const contractId = contractCall.contract_call?.contract_id || '';
    if (!contractId.includes(CONTRACT_ADDRESS) || !contractId.includes(CONTRACT_NAME)) {
      continue;
    }
    
    const functionName = contractCall.contract_call?.function_name || '';
    const timestamp = new Date(tx.burn_block_time_iso || tx.burn_block_time * 1000);
    
    // Parse create-vault transactions (deposits)
    if (functionName === 'create-vault') {
      const events = contractCall.events || [];
      let amount = 0;
      
      // Look for STX transfer event to get the amount
      for (const event of events) {
        if (event.type === 'stx_transfer_event' && event.stx_transfer_event) {
          const transfer = event.stx_transfer_event;
          if (transfer.sender === userAddress) {
            amount = microStxToStx(BigInt(transfer.amount));
            break;
          }
        }
      }
      
      if (amount > 0) {
        activities.push({
          id: `act-${tx.tx_id}`,
          type: 'deposit',
          vaultId: undefined, // Could extract from tx result if needed
          amount,
          address: tx.sender_address,
          blockHeight: tx.block_height,
          timestamp,
          txHash: tx.tx_id,
        });
      }
    }
    
    // Parse withdraw-from-vault transactions (withdrawals)
    if (functionName === 'withdraw-from-vault' || functionName === 'emergency-withdraw') {
      const events = contractCall.events || [];
      let amount = 0;
      
      // Look for STX transfer event to get the amount
      for (const event of events) {
        if (event.type === 'stx_transfer_event' && event.stx_transfer_event) {
          const transfer = event.stx_transfer_event;
          if (transfer.recipient === userAddress) {
            amount = microStxToStx(BigInt(transfer.amount));
            break;
          }
        }
      }
      
      if (amount > 0) {
        activities.push({
          id: `act-${tx.tx_id}`,
          type: 'withdrawal',
          vaultId: undefined, // Could extract from tx args if needed
          amount,
          address: tx.sender_address,
          blockHeight: tx.block_height,
          timestamp,
          txHash: tx.tx_id,
        });
      }
    }
    
    // Parse fund-contract transactions (admin funding)
    if (functionName === 'fund-contract') {
      const events = contractCall.events || [];
      let amount = 0;
      
      // Look for STX transfer event
      for (const event of events) {
        if (event.type === 'stx_transfer_event' && event.stx_transfer_event) {
          const transfer = event.stx_transfer_event;
          amount = microStxToStx(BigInt(transfer.amount));
          break;
        }
      }
      
      if (amount > 0) {
        activities.push({
          id: `act-${tx.tx_id}`,
          type: 'funding',
          amount,
          address: tx.sender_address,
          blockHeight: tx.block_height,
          timestamp,
          txHash: tx.tx_id,
        });
      }
    }
  }
  
  // Sort by block height descending (most recent first)
  return activities.sort((a, b) => b.blockHeight - a.blockHeight);
}

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ContractStats>({
    totalDeposits: 0,
    totalVaults: 0,
    contractBalance: 0,
    currentBlockHeight: 0,
    interestRate: ANNUAL_INTEREST_RATE_PERCENT,
    totalInterestPaid: 0,
  });
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    network: 'mainnet',
  });

  const userVaults = vaults.filter((v) => v.owner === wallet.address);

  // Restore wallet connection on mount
  useEffect(() => {
    const restoreWallet = async () => {
      const connected = walletService.checkWalletConnection();
      if (connected) {
        const walletInfo = walletService.getConnectedWallet();
        if (walletInfo) {
          const balance = await apiService.fetchAccountBalance(walletInfo.address);
          setWallet({
            isConnected: true,
            address: walletInfo.address,
            balance: microStxToStx(balance),
            network: walletInfo.network,
          });
        }
      }
    };
    restoreWallet();
  }, []);

  // Refresh data when wallet connects
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      refreshData();
    }
  }, [wallet.isConnected, wallet.address]);

  // Periodically update block height and vault statuses
  useEffect(() => {
    const interval = setInterval(() => {
      if (wallet.isConnected) {
        refreshData();
      }
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [wallet.isConnected]);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const walletInfo = await walletService.connectWallet();
      const balance = await apiService.fetchAccountBalance(walletInfo.address);
      
      setWallet({
        isConnected: true,
        address: walletInfo.address,
        balance: microStxToStx(balance),
        network: walletInfo.network,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    walletService.disconnectWallet();
    setWallet({
      isConnected: false,
      address: null,
      balance: 0,
      network: 'mainnet',
    });
    setVaults([]);
    setActivities([]);
  }, []);

  const createVault = useCallback(
    async (amount: number, durationBlocks: number): Promise<Vault> => {
      if (!wallet.address) {
        throw new Error('Wallet not connected');
      }

      // Validate minimum lock duration (7 days = ~1008 blocks)
      if (durationBlocks < MIN_LOCK_DURATION_BLOCKS) {
        const minDays = Math.round(MIN_LOCK_DURATION_BLOCKS / 144);
        const selectedDays = (durationBlocks / 144).toFixed(1);
        throw new Error(`Minimum lock duration is ${minDays} days. You selected ${selectedDays} day(s).`);
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0 STX');
      }

      setIsLoading(true);
      try {
        const amountMicroStx = stxToMicroStx(amount);
        
        // Create vault transaction (pass blocks, not seconds)
        const txId = await contractService.createVault(
          amountMicroStx,
          durationBlocks,
          wallet.address
        );

        // Wait for confirmation
        const confirmed = await apiService.waitForTransactionConfirmation(txId);
        
        if (!confirmed) {
          // Get the transaction to see why it failed
          const tx = await apiService.fetchTransaction(txId);
          if (tx?.tx_status === 'abort_by_response') {
            throw new Error('Transaction rejected by contract. Please verify all requirements are met.');
          } else if (tx?.tx_status === 'abort_by_post_condition') {
            throw new Error('Transaction failed: Insufficient balance or post-condition not met.');
          }
          throw new Error('Transaction failed or timed out. Please check the blockchain explorer for details.');
        }

        // Refresh data to get the new vault
        await refreshData();
        
        // Get the latest vault (should be the one we just created)
        const vaultCounter = await contractService.getVaultCounter();
        const vaultStatus = await contractService.getVaultStatus(vaultCounter);
        const currentBlock = await contractService.getCurrentTime();
        
        return convertVaultData(vaultCounter, vaultStatus, currentBlock);
      } catch (error) {
        console.error('Failed to create vault:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.address]
  );

  const withdrawVault = useCallback(
    async (vaultId: string) => {
      if (!wallet.address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      try {
        const vaultIdNum = parseInt(vaultId);
        
        // Withdraw from vault
        const txId = await contractService.withdrawFromVault(vaultIdNum, wallet.address);

        // Wait for confirmation
        const confirmed = await apiService.waitForTransactionConfirmation(txId);
        
        if (!confirmed) {
          // Get the transaction to see why it failed
          const tx = await apiService.fetchTransaction(txId);
          if (tx?.tx_status === 'abort_by_response') {
            throw new Error('Withdrawal rejected by contract. The vault may not be mature yet.');
          } else if (tx?.tx_status === 'abort_by_post_condition') {
            throw new Error('Transaction failed: Post-condition not met.');
          }
          throw new Error('Transaction failed or timed out. Please check the blockchain explorer for details.');
        }

        // Refresh data
        await refreshData();
      } catch (error) {
        console.error('Failed to withdraw from vault:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.address]
  );

  const emergencyWithdraw = useCallback(
    async (vaultId: string) => {
      if (!wallet.address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      try {
        const vaultIdNum = parseInt(vaultId);
        
        // Emergency withdraw
        const txId = await contractService.emergencyWithdraw(vaultIdNum, wallet.address);

        // Wait for confirmation
        const confirmed = await apiService.waitForTransactionConfirmation(txId);
        
        if (!confirmed) {
          // Get the transaction to see why it failed
          const tx = await apiService.fetchTransaction(txId);
          if (tx?.tx_status === 'abort_by_response') {
            throw new Error('Emergency withdrawal rejected by contract. The vault may be in an invalid state.');
          } else if (tx?.tx_status === 'abort_by_post_condition') {
            throw new Error('Transaction failed: Post-condition not met.');
          }
          throw new Error('Transaction failed or timed out. Please check the blockchain explorer for details.');
        }

        // Refresh data
        await refreshData();
      } catch (error) {
        console.error('Failed to emergency withdraw:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.address]
  );

  const getVaultById = useCallback(
    (id: string) => vaults.find((v) => v.id === id),
    [vaults]
  );

  const refreshData = useCallback(async () => {
    try {
      // Fetch current block height
      const currentBlock = await contractService.getCurrentTime();
      
      // Fetch contract stats
      const [totalDeposits, vaultCounter, contractBalance] = await Promise.all([
        contractService.getTotalDeposits(),
        contractService.getVaultCounter(),
        contractService.getContractBalance(),
      ]);

      setStats({
        totalDeposits: microStxToStx(totalDeposits),
        totalVaults: vaultCounter,
        contractBalance: microStxToStx(contractBalance),
        currentBlockHeight: currentBlock,
        interestRate: ANNUAL_INTEREST_RATE_PERCENT,
        totalInterestPaid: 0, // Will be calculated below
      });

      // Try to fetch all contract transactions for global activity feed
      // Falls back to user transactions if contract not deployed yet
      let allActivities: Activity[] = [];
      
      const contractTransactions = await apiService.fetchContractTransactions(
        CONTRACT_ADDRESS,
        CONTRACT_NAME,
        100
      );
      
      if (contractTransactions.length > 0) {
        // Parse all contract activities
        allActivities = parseTransactionsToActivities(
          contractTransactions,
          wallet.address || ''
        );
      } else if (wallet.address) {
        // Fallback to user transactions if contract transactions not available
        const userTransactions = await apiService.fetchAccountTransactions(wallet.address, 50);
        allActivities = parseTransactionsToActivities(userTransactions, wallet.address);
      }
      
      setActivities(allActivities);

      // Fetch user vaults if wallet is connected
      if (wallet.address) {
        const userVaultIds = await contractService.getUserVaults(wallet.address);
        
        // Fetch each vault's status
        const vaultDataPromises = userVaultIds.map(async (vaultId) => {
          try {
            const vaultStatus = await contractService.getVaultStatus(vaultId);
            return convertVaultData(vaultId, vaultStatus, currentBlock);
          } catch (error) {
            console.error(`Error fetching vault ${vaultId}:`, error);
            return null;
          }
        });

        const vaultDataArray = await Promise.all(vaultDataPromises);
        const validVaults = vaultDataArray.filter((v): v is Vault => v !== null);
        setVaults(validVaults);

        // Update wallet balance
        const balance = await apiService.fetchAccountBalance(wallet.address);
        setWallet((prev) => ({ ...prev, balance: microStxToStx(balance) }));
        
        // Calculate total interest paid from withdrawn vaults
        const totalInterest = validVaults
          .filter((v) => v.status === 'withdrawn')
          .reduce((sum, v) => sum + v.interestEarned, 0);
        
        setStats((prev) => ({ ...prev, totalInterestPaid: totalInterest }));
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [wallet.address]);

  return (
    <VaultContext.Provider
      value={{
        vaults,
        userVaults,
        activities,
        stats,
        wallet,
        isLoading,
        connectWallet,
        disconnectWallet,
        createVault,
        withdrawVault,
        emergencyWithdraw,
        getVaultById,
        refreshData,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
