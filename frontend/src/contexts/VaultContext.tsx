import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  refreshData: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// Mock data generation
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
  const [vaults, setVaults] = useState<Vault[]>(generateMockVaults());
  const [activities, setActivities] = useState<Activity[]>(generateMockActivities());
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    network: 'mainnet',
  });

  const stats: ContractStats = {
    totalDeposits: vaults.reduce((sum, v) => sum + v.principal, 0),
    totalVaults: vaults.length,
    contractBalance: 125000,
    currentBlockHeight: 854732,
    interestRate: 5.5,
    totalInterestPaid: 15420,
  };

  const userVaults = vaults.filter((v) => v.owner === wallet.address);

  // Simulate block height updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would fetch real block height
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    // Simulate wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setWallet({
      isConnected: true,
      address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      balance: 12450.75,
      network: 'mainnet',
    });
    setIsLoading(false);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      balance: 0,
      network: 'mainnet',
    });
  }, []);

  const createVault = useCallback(
    async (amount: number, durationBlocks: number): Promise<Vault> => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newVault: Vault = {
        id: `vault-${Date.now()}`,
        owner: wallet.address!,
        principal: amount,
        interestRate: 5.5,
        interestEarned: 0,
        depositBlock: stats.currentBlockHeight,
        unlockBlock: stats.currentBlockHeight + durationBlocks,
        status: 'locked',
        createdAt: new Date(),
      };

      setVaults((prev) => [newVault, ...prev]);

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: 'deposit',
        vaultId: newVault.id,
        amount,
        address: wallet.address!,
        blockHeight: stats.currentBlockHeight,
        timestamp: new Date(),
        txHash: `0x${Math.random().toString(16).slice(2)}`,
      };

      setActivities((prev) => [newActivity, ...prev]);
      setWallet((prev) => ({ ...prev, balance: prev.balance - amount }));
      setIsLoading(false);

      return newVault;
    },
    [wallet.address, stats.currentBlockHeight]
  );

  const withdrawVault = useCallback(async (vaultId: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setVaults((prev) =>
      prev.map((v) =>
        v.id === vaultId ? { ...v, status: 'withdrawn' as VaultStatus, withdrawnAt: new Date() } : v
      )
    );

    const vault = vaults.find((v) => v.id === vaultId);
    if (vault) {
      const totalAmount = vault.principal + vault.interestEarned;
      setWallet((prev) => ({ ...prev, balance: prev.balance + totalAmount }));

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: 'withdrawal',
        vaultId,
        amount: totalAmount,
        address: wallet.address!,
        blockHeight: stats.currentBlockHeight,
        timestamp: new Date(),
        txHash: `0x${Math.random().toString(16).slice(2)}`,
      };

      setActivities((prev) => [newActivity, ...prev]);
    }

    setIsLoading(false);
  }, [vaults, wallet.address, stats.currentBlockHeight]);

  const emergencyWithdraw = useCallback(async (vaultId: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setVaults((prev) =>
      prev.map((v) =>
        v.id === vaultId ? { ...v, status: 'withdrawn' as VaultStatus, withdrawnAt: new Date() } : v
      )
    );

    const vault = vaults.find((v) => v.id === vaultId);
    if (vault) {
      // Emergency withdrawal has penalty - only return 95% of principal
      const totalAmount = vault.principal * 0.95;
      setWallet((prev) => ({ ...prev, balance: prev.balance + totalAmount }));
    }

    setIsLoading(false);
  }, [vaults]);

  const getVaultById = useCallback(
    (id: string) => vaults.find((v) => v.id === id),
    [vaults]
  );

  const refreshData = useCallback(() => {
    // In production, this would fetch fresh data from the blockchain
  }, []);

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
