'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Core } from '@walletconnect/core';
import { WalletKit, IWalletKit } from '@reown/walletkit';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import {
  WALLET_CONNECT_PROJECT_ID,
  SUPPORTED_CHAINS,
  SUPPORTED_METHODS,
  SUPPORTED_EVENTS,
  APP_METADATA
} from './walletconnect-config';

interface WalletConnectContextType {
  web3wallet: IWalletKit | null;
  isInitialized: boolean;
  isConnecting: boolean;
  sessions: SessionTypes.Struct[];
  accounts: string[];
  currentChainId: number;
  connect: (uri: string) => Promise<void>;
  disconnect: (topic?: string) => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
  sendTransaction: (params: any) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
}

const WalletConnectContext = createContext<WalletConnectContextType | null>(null);

export function WalletConnectProvider({ children }: { children: ReactNode }) {
  const [web3wallet, setWeb3Wallet] = useState<IWalletKit | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [currentChainId, setCurrentChainId] = useState(1);

  // Initialize WalletKit
  useEffect(() => {
    const initWallet = async () => {
      try {
        const core = new Core({
          projectId: WALLET_CONNECT_PROJECT_ID,
          logger: 'error',
        });

        const wallet = await WalletKit.init({
          core,
          metadata: APP_METADATA,
        });

        setWeb3Wallet(wallet);
        setIsInitialized(true);

        // Get active sessions
        const activeSessions = Object.values(wallet.getActiveSessions());
        setSessions(activeSessions);

        // Set up event listeners
        setupEventListeners(wallet);
      } catch (error) {
        console.error('Failed to initialize WalletKit:', error);
      }
    };

    initWallet();
  }, []);

  const setupEventListeners = (wallet: IWalletKit) => {
    // Session proposal
    wallet.on('session_proposal', async (proposal) => {
      console.log('Session proposal received:', proposal);
      // You can auto-approve or show a UI to approve
      await handleSessionProposal(proposal);
    });

    // Session request
    wallet.on('session_request', async (event) => {
      console.log('Session request received:', event);
      await handleSessionRequest(event);
    });

    // Session delete
    wallet.on('session_delete', (event) => {
      console.log('Session deleted:', event);
      const activeSessions = Object.values(wallet.getActiveSessions());
      setSessions(activeSessions);
      if (activeSessions.length === 0) {
        setAccounts([]);
      }
    });
  };

  const handleSessionProposal = async (
    proposal: SignClientTypes.EventArguments['session_proposal']
  ) => {
    if (!web3wallet) return;

    try {
      // Build namespaces
      const namespaces: SessionTypes.Namespaces = {};

      Object.keys(proposal.params.requiredNamespaces).forEach((key) => {
        const chains = proposal.params.requiredNamespaces[key].chains || [];

        namespaces[key] = {
          chains,
          methods: SUPPORTED_METHODS,
          events: SUPPORTED_EVENTS,
          accounts: chains.map(
            (chain) => `${chain}:${accounts[0] || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'}`
          ),
        };
      });

      // Approve session
      const session = await web3wallet.approveSession({
        id: proposal.id,
        namespaces,
      });

      console.log('Session approved:', session);

      const activeSessions = Object.values(web3wallet.getActiveSessions());
      setSessions(activeSessions);
    } catch (error) {
      console.error('Failed to approve session:', error);
      await web3wallet.rejectSession({
        id: proposal.id,
        reason: {
          code: 5000,
          message: 'User rejected the session',
        },
      });
    }
  };

  const handleSessionRequest = async (
    event: SignClientTypes.EventArguments['session_request']
  ) => {
    if (!web3wallet) return;

    const { topic, params, id } = event;
    const { request } = params;

    try {
      let result;

      switch (request.method) {
        case 'personal_sign':
          result = await signMessage(request.params[0]);
          break;
        case 'eth_sendTransaction':
          result = await sendTransaction(request.params[0]);
          break;
        case 'eth_signTypedData':
        case 'eth_signTypedData_v4':
          // Implement typed data signing
          result = '0x'; // Placeholder
          break;
        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }

      await web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          result,
        },
      });
    } catch (error) {
      await web3wallet.respondSessionRequest({
        topic,
        response: {
          id,
          jsonrpc: '2.0',
          error: {
            code: 5000,
            message: (error as Error).message,
          },
        },
      });
    }
  };

  const connect = async (uri: string) => {
    if (!web3wallet) {
      throw new Error('WalletKit not initialized');
    }

    try {
      setIsConnecting(true);
      await web3wallet.pair({ uri });
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async (topic?: string) => {
    if (!web3wallet) return;

    try {
      if (topic) {
        await web3wallet.disconnectSession({
          topic,
          reason: {
            code: 6000,
            message: 'User disconnected session',
          },
        });
      } else {
        // Disconnect all sessions
        const allSessions = Object.values(web3wallet.getActiveSessions());
        await Promise.all(
          allSessions.map((session) =>
            web3wallet.disconnectSession({
              topic: session.topic,
              reason: {
                code: 6000,
                message: 'User disconnected session',
              },
            })
          )
        );
      }

      const activeSessions = Object.values(web3wallet.getActiveSessions());
      setSessions(activeSessions);

      if (activeSessions.length === 0) {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  };

  const switchChain = async (chainId: number) => {
    // Implement chain switching logic
    setCurrentChainId(chainId);
    // You might need to update sessions or emit events
  };

  const sendTransaction = async (params: any): Promise<string> => {
    // This is a placeholder - implement actual transaction sending
    // You would typically use ethers.js or web3.js here
    console.log('Sending transaction:', params);

    // Mock transaction hash
    return '0x' + Array(64).fill(0).map(() =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const signMessage = async (message: string): Promise<string> => {
    // This is a placeholder - implement actual message signing
    // You would typically use ethers.js or web3.js here
    console.log('Signing message:', message);

    // Mock signature
    return '0x' + Array(130).fill(0).map(() =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const value: WalletConnectContextType = {
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
  };

  return (
    <WalletConnectContext.Provider value={value}>
      {children}
    </WalletConnectContext.Provider>
  );
}

export function useWalletConnect() {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error('useWalletConnect must be used within WalletConnectProvider');
  }
  return context;
}
