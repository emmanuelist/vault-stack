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
import { ANNUAL_INTEREST_RATE_PERCENT } from '@/lib/stacks-config';

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
  createVault: (amount: number, durationSeconds: number) => Promise<Vault>;
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

// Mock data generation (fallback for offline testing)
const generateMockVaults = (): Vault[] => {
  const currentBlock = 854732;
  const addresses = [
    'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    'SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE',
    'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C',
  ];

  return [
    {
      id: 'vault-001',
      owner: addresses[0],
      principal: 5000,
      interestRate: 5.2,
      interestEarned: 142.5,
      depositBlock: currentBlock - 2160,
      unlockBlock: currentBlock + 4320,
      status: 'locked',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'vault-002',
      owner: addresses[0],
      principal: 2500,
      interestRate: 4.8,
      interestEarned: 89.25,
      depositBlock: currentBlock - 4320,
      unlockBlock: currentBlock - 100,
      status: 'unlocked',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'vault-003',
      owner: addresses[0],
      principal: 10000,
      interestRate: 6.1,
      interestEarned: 0,
      depositBlock: currentBlock - 8640,
      unlockBlock: currentBlock - 2160,
      status: 'withdrawn',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      withdrawnAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'vault-004',
      owner: addresses[1],
      principal: 7500,
      interestRate: 5.5,
      interestEarned: 285.0,
      depositBlock: currentBlock - 6480,
      unlockBlock: currentBlock + 1080,
      status: 'locked',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'vault-005',
      owner: addresses[2],
      principal: 15000,
      interestRate: 7.2,
      interestEarned: 540.0,
      depositBlock: currentBlock - 4320,
      unlockBlock: currentBlock + 8640,
      status: 'locked',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'vault-006',
      owner: addresses[3],
      principal: 3200,
      interestRate: 4.5,
      interestEarned: 72.0,
      depositBlock: currentBlock - 2160,
      unlockBlock: currentBlock - 50,
      status: 'unlocked',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'vault-007',
      owner: addresses[0],
      principal: 8200,
      interestRate: 5.8,
      interestEarned: 318.5,
      depositBlock: currentBlock - 5400,
      unlockBlock: currentBlock + 2700,
      status: 'locked',
      createdAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000),
    },
  ];
};

const generateMockActivities = (): Activity[] => {
  const currentBlock = 854732;
  return [
    {
      id: 'act-001',
      type: 'deposit',
      vaultId: 'vault-001',
      amount: 5000,
      address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      blockHeight: currentBlock - 2160,
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      txHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    },
    {
      id: 'act-002',
      type: 'deposit',
      vaultId: 'vault-002',
      amount: 2500,
      address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      blockHeight: currentBlock - 4320,
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      txHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
    },
    {
      id: 'act-003',
      type: 'withdrawal',
      vaultId: 'vault-003',
      amount: 10610,
      address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      blockHeight: currentBlock - 2160,
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      txHash: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
    },
    {
      id: 'act-004',
      type: 'funding',
      amount: 25000,
      address: 'SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE',
      blockHeight: currentBlock - 1440,
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      txHash: '0x4d5e6f7890abcdef1234567890abcdef12345678',
    },
    {
      id: 'act-005',
      type: 'deposit',
      vaultId: 'vault-005',
      amount: 15000,
      address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      blockHeight: currentBlock - 4320,
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      txHash: '0x5e6f7890abcdef1234567890abcdef1234567890',
    },
    {
      id: 'act-006',
      type: 'unlock',
      vaultId: 'vault-002',
      amount: 2500,
      address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      blockHeight: currentBlock - 100,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      txHash: '0x6f7890abcdef1234567890abcdef123456789012',
    },
    {
      id: 'act-007',
      type: 'deposit',
      vaultId: 'vault-007',
      amount: 8200,
      address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      blockHeight: currentBlock - 5400,
      timestamp: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000),
      txHash: '0x7890abcdef1234567890abcdef12345678901234',
    },
  ];
};

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
    async (amount: number, durationSeconds: number): Promise<Vault> => {
      if (!wallet.address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      try {
        const amountMicroStx = stxToMicroStx(amount);
        
        // Create vault transaction
        const txId = await contractService.createVault(
          amountMicroStx,
          durationSeconds,
          wallet.address
        );

        // Wait for confirmation
        const confirmed = await apiService.waitForTransactionConfirmation(txId);
        
        if (!confirmed) {
          throw new Error('Transaction failed or timed out');
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
          throw new Error('Transaction failed or timed out');
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
          throw new Error('Transaction failed or timed out');
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
        totalInterestPaid: 0, // This would need to be calculated from activity history
      });

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

        // Fetch recent transactions for activity feed
        const transactions = await apiService.fetchAccountTransactions(wallet.address, 20);
        // TODO: Parse transactions to create activity entries
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
