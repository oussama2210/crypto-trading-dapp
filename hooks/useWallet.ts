'use client';

import { useWalletConnect } from '@/lib/walletconnect-context';

export function useWallet() {
  const context = useWalletConnect();
  
  const {
    web3wallet,
    isInitialized,
    isConnecting,
    sessions,
    accounts,
    currentChainId,
    connect,
    disconnect,
    switchChain,
    sendTransaction,
    signMessage,
  } = context;

  const isConnected = sessions.length > 0 && accounts.length > 0;
  const address = accounts[0] || null;
  const shortAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return {
    // State
    web3wallet,
    isInitialized,
    isConnecting,
    isConnected,
    sessions,
    accounts,
    address,
    shortAddress,
    currentChainId,
    
    // Actions
    connect,
    disconnect,
    switchChain,
    sendTransaction,
    signMessage,
  };
}
