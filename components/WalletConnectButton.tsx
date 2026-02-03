'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'

declare global {
  interface Window {
    ethereum?: any
  }
}

export function WalletConnectButton() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if already connected
    checkIfWalletIsConnected()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', () => window.location.reload())
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
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
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (account) {
    return (
      <Button
        onClick={disconnectWallet}
        variant="outline"
        className="wallet-button"
      >
        {formatAddress(account)}
      </Button>
    )
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="wallet-button"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}
