'use client';

import { useState, useEffect } from 'react';
import { useWalletConnect } from '@/lib/walletconnect-context';
import { Button } from './ui/button';
import { X, Wallet, ExternalLink, Copy, Check } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/lib/walletconnect-config';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const {
    isConnecting,
    sessions,
    accounts,
    currentChainId,
    connect,
    disconnect,
    switchChain,
  } = useWalletConnect();

  const [uri, setUri] = useState('');
  const [copied, setCopied] = useState(false);

  const isConnected = sessions.length > 0;
  const currentChain = Object.values(SUPPORTED_CHAINS).find(
    (chain) => chain.chainId === currentChainId
  );

  useEffect(() => {
    if (!isOpen) {
      setUri('');
      setCopied(false);
    }
  }, [isOpen]);

  const handleConnect = async () => {
    if (!uri.trim()) {
      alert('Please enter a WalletConnect URI');
      return;
    }

    try {
      await connect(uri);
      setUri('');
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onClose();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const copyAddress = () => {
    if (accounts[0]) {
      navigator.clipboard.writeText(accounts[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openExplorer = () => {
    if (accounts[0] && currentChain) {
      window.open(`${currentChain.explorerUrl}/address/${accounts[0]}`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Wallet className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isConnected ? 'Your Wallet' : 'Connect Wallet'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isConnected ? 'Manage your connection' : 'Connect via WalletConnect'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            {/* Account Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Address</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyAddress}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={openExplorer}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="font-mono text-sm break-all">
                {accounts[0] || 'Not connected'}
              </div>
            </div>

            {/* Chain Info */}
            {currentChain && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Network</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">{currentChain.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chain Switcher */}
            <div className="space-y-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Switch Network</span>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(SUPPORTED_CHAINS).map((chain) => (
                  <button
                    key={chain.chainId}
                    onClick={() => switchChain(chain.chainId)}
                    className={`p-3 rounded-lg border transition-all ${
                      currentChainId === chain.chainId
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xs font-medium">{chain.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {chain.currency}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Active Sessions
              </div>
              <div className="text-sm font-medium">{sessions.length} session(s)</div>
            </div>

            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                To connect your wallet, scan the QR code with your mobile wallet app or paste the connection URI below.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">WalletConnect URI</label>
              <input
                type="text"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                placeholder="wc:..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting || !uri.trim()}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>

            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              Supported: MetaMask, Trust Wallet, Rainbow, and more
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
