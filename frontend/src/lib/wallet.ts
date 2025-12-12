import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';
import { NETWORK_TYPE, WALLET_ADDRESS_KEY, WALLET_NETWORK_KEY } from './stacks-config';

export interface WalletInfo {
  address: string;
  network: 'mainnet' | 'testnet';
}

/**
 * Connect to a Stacks wallet
 * @returns Wallet information
 */
export async function connectWallet(): Promise<WalletInfo> {
  try {
    const response = await connect({
      // Force wallet selection modal
      forceWalletSelect: true,
      // Store address in local storage
      enableLocalStorage: true,
    });

    console.log('Connect response:', response);

    // Get STX address from response - try different possible structures
    let stxAddress: string | undefined;
    
    // Try accessing as array of address entries
    if (Array.isArray(response.addresses)) {
      const stxEntry = response.addresses.find((entry: any) => 
        entry.address && entry.address.startsWith('SP') || entry.address.startsWith('ST')
      );
      stxAddress = stxEntry?.address;
    }
    
    // If not found, try the getLocalStorage method
    if (!stxAddress) {
      const localData = getLocalStorage();
      console.log('Local storage data:', localData);
      
      if (localData?.addresses) {
        const addresses = localData.addresses as any;
        if (addresses.stx?.[0]?.address) {
          stxAddress = addresses.stx[0].address;
        } else if (Array.isArray(addresses)) {
          const stxEntry = addresses.find((entry: any) => 
            entry.address && (entry.address.startsWith('SP') || entry.address.startsWith('ST'))
          );
          stxAddress = stxEntry?.address;
        }
      }
    }
    
    if (!stxAddress) {
      console.error('Could not find STX address in response:', response);
      throw new Error('No STX address found in wallet response');
    }

    // Store wallet info
    localStorage.setItem(WALLET_ADDRESS_KEY, stxAddress);
    localStorage.setItem(WALLET_NETWORK_KEY, NETWORK_TYPE);

    return {
      address: stxAddress,
      network: NETWORK_TYPE as 'mainnet' | 'testnet',
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw new Error('Failed to connect wallet. Please try again.');
  }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
  try {
    disconnect();
    localStorage.removeItem(WALLET_ADDRESS_KEY);
    localStorage.removeItem(WALLET_NETWORK_KEY);
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
}

/**
 * Check if wallet is connected
 * @returns True if connected
 */
export function checkWalletConnection(): boolean {
  return isConnected();
}

/**
 * Get connected wallet address from local storage
 * @returns Wallet information or null
 */
export function getConnectedWallet(): WalletInfo | null {
  try {
    // First check manual localStorage
    const address = localStorage.getItem(WALLET_ADDRESS_KEY);
    const network = localStorage.getItem(WALLET_NETWORK_KEY) as 'mainnet' | 'testnet';
    
    if (address && network) {
      return { address, network };
    }

    // Fallback to getLocalStorage
    const data = getLocalStorage();
    if (!data?.addresses) {
      return null;
    }

    // Try different address structure patterns
    const addresses = data.addresses;
    let stxAddress: string | undefined;

    // Check if addresses is an array
    if (Array.isArray(addresses)) {
      stxAddress = addresses.find(addr => 
        typeof addr === 'string' && (addr.startsWith('SP') || addr.startsWith('ST'))
      );
    } else if (typeof addresses === 'object') {
      // Check if addresses.stx exists and is an array
      const stxAddrs = (addresses as any).stx;
      if (Array.isArray(stxAddrs) && stxAddrs.length > 0) {
        stxAddress = stxAddrs[0]?.address || stxAddrs[0];
      }
    }

    if (!stxAddress) {
      return null;
    }

    const networkFromStorage = localStorage.getItem(WALLET_NETWORK_KEY) as 'mainnet' | 'testnet' || NETWORK_TYPE as 'mainnet' | 'testnet';

    return {
      address: stxAddress,
      network: networkFromStorage,
    };
  } catch (error) {
    console.error('Error getting connected wallet:', error);
    return null;
  }
}

/**
 * Request wallet to reconnect (useful after page reload)
 * @returns Wallet information or null
 */
export async function restoreWalletConnection(): Promise<WalletInfo | null> {
  try {
    if (!checkWalletConnection()) {
      return null;
    }

    return getConnectedWallet();
  } catch (error) {
    console.error('Error restoring wallet connection:', error);
    return null;
  }
}
