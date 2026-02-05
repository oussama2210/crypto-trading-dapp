'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Button } from './ui/button'
import { Wallet, ChevronDown, LogOut, Copy, Check } from 'lucide-react'

declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletContextType {
  account: string | null;
  chainId: number;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    return { account: null, chainId: 1, isConnecting: false, connectWallet: async () => { }, disconnectWallet: () => { } };
  }
  return context;
}

export function WalletConnectButton() {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if already connected
    checkIfWalletIsConnected()

    // Listen for account and chain changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        setAccount(accounts[0])
      }

      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(parseInt(chainIdHex, 16))
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0])
    } else {
      setAccount(null)
    }
  }

  const handleChainChanged = (chainIdHex: string) => {
    setChainId(parseInt(chainIdHex, 16))
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install MetaMask extension!')
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    try {
      setIsConnecting(true)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])

      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(parseInt(chainIdHex, 16))
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error)
      if (error.code === 4001) {
        alert('Please connect to MetaMask.')
      } else {
        alert('Error connecting to MetaMask')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setShowDropdown(false)
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (id: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      56: 'BNB',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      43114: 'Avalanche',
      8453: 'Base',
    }
    return chains[id] || `Chain ${id}`
  }

  if (account) {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          variant="outline"
          className="wallet-button connected"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="hidden sm:inline">{formatAddress(account)}</span>
          <span className="sm:hidden">{account.slice(0, 4)}...</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </Button>

        {showDropdown && (
          <>
            <div className="wallet-dropdown">
              <div className="p-3 border-b border-dark-400">
                <p className="text-xs text-purple-100 mb-1">Connected to</p>
                <p className="font-medium text-green-500">{getChainName(chainId)}</p>
              </div>

              <div className="p-3 border-b border-dark-400">
                <p className="text-xs text-purple-100 mb-1">Address</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm truncate flex-1">{formatAddress(account)}</p>
                  <button
                    onClick={copyAddress}
                    className="p-1.5 rounded-lg hover:bg-dark-400 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-purple-100" />}
                  </button>
                </div>
              </div>

              <button
                onClick={disconnectWallet}
                className="w-full flex items-center gap-2 p-3 text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Disconnect</span>
              </button>
            </div>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="wallet-button"
    >
      <Wallet className="w-4 h-4" />
      <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      <span className="sm:hidden">{isConnecting ? '...' : 'Connect'}</span>
    </Button>
  )
}
