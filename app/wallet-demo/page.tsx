'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { WalletModal } from '@/components/WalletModal';
import { Button } from '@/components/ui/button';
import { Wallet, Send, FileSignature, RefreshCw } from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/lib/walletconnect-config';

export default function WalletDemoPage() {
  const {
    isInitialized,
    isConnected,
    address,
    shortAddress,
    currentChainId,
    switchChain,
    sendTransaction,
    signMessage,
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('Hello from Ceypto!');
  const [txParams, setTxParams] = useState({
    to: '',
    value: '0.001',
  });

  const currentChain = Object.values(SUPPORTED_CHAINS).find(
    (chain) => chain.chainId === currentChainId
  );

  const handleSignMessage = async () => {
    try {
      const signature = await signMessage(message);
      alert(`Message signed!\n\nSignature: ${signature}`);
    } catch (error) {
      console.error('Failed to sign message:', error);
      alert('Failed to sign message');
    }
  };

  const handleSendTransaction = async () => {
    if (!txParams.to) {
      alert('Please enter a recipient address');
      return;
    }

    try {
      const txHash = await sendTransaction({
        to: txParams.to,
        value: txParams.value,
      });
      alert(`Transaction sent!\n\nHash: ${txHash}`);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      alert('Failed to send transaction');
    }
  };

  if (!isInitialized) {
    return (
      <main className="main-container py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          <p className="mt-4 text-gray-500">Initializing wallet...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-container py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Wallet Integration Demo</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Test WalletConnect integration with your mobile wallet
          </p>
        </div>

        {/* Connection Status */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Connection Status</h2>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">
              <Wallet className="w-4 h-4 mr-2" />
              {isConnected ? 'Manage Wallet' : 'Connect Wallet'}
            </Button>
          </div>

          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Address
                  </div>
                  <div className="font-mono text-sm break-all">{address}</div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Network
                  </div>
                  <div className="font-medium">
                    {currentChain?.name || 'Unknown'} ({currentChain?.currency})
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No wallet connected
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                Connect Your Wallet
              </Button>
            </div>
          )}
        </div>

        {/* Network Switcher */}
        {isConnected && (
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Switch Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(SUPPORTED_CHAINS).map((chain) => (
                <button
                  key={chain.chainId}
                  onClick={() => switchChain(chain.chainId)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    currentChainId === chain.chainId
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{chain.name}</span>
                    {currentChainId === chain.chainId && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {chain.currency}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sign Message */}
        {isConnected && (
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <FileSignature className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold">Sign Message</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message to Sign
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message..."
                />
              </div>
              <Button onClick={handleSignMessage} className="w-full">
                <FileSignature className="w-4 h-4 mr-2" />
                Sign Message
              </Button>
            </div>
          </div>
        )}

        {/* Send Transaction */}
        {isConnected && (
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Send className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-bold">Send Transaction</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={txParams.to}
                  onChange={(e) => setTxParams({ ...txParams, to: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount ({currentChain?.currency})
                </label>
                <input
                  type="text"
                  value={txParams.value}
                  onChange={(e) => setTxParams({ ...txParams, value: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.001"
                />
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  ⚠️ This is a demo. Transactions will be simulated and not actually sent.
                </p>
              </div>
              <Button onClick={handleSendTransaction} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Transaction
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <h3 className="font-bold mb-2">How to Connect</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900 dark:text-blue-100">
            <li>Click "Connect Wallet" button</li>
            <li>Open your mobile wallet app (MetaMask, Trust Wallet, etc.)</li>
            <li>Scan the QR code or paste the WalletConnect URI</li>
            <li>Approve the connection in your wallet app</li>
            <li>Start interacting with the demo features!</li>
          </ol>
        </div>
      </div>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
