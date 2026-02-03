// WalletConnect configuration
export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '8e373c193a225dc42fef20c8013d6031';

export const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://eth.llamarpc.com'
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com'
  },
  bsc: {
    chainId: 56,
    name: 'BSC',
    currency: 'BNB',
    explorerUrl: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed.binance.org'
  }
} as const;

export const SUPPORTED_METHODS = [
  'eth_sendTransaction',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v4',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain'
];

export const SUPPORTED_EVENTS = [
  'chainChanged',
  'accountsChanged'
];

export const APP_METADATA = {
  name: 'Ceypto',
  description: 'Cryptocurrency Tracking & Trading Platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://ceypto.app',
  icons: ['/logo.png']
};
