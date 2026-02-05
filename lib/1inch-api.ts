/**
 * 1inch Swap API Integration
 * This module provides functions to interact with the 1inch Swap API v6
 * for token quotes and swaps across supported chains.
 */

const ONEINCH_API_BASE = 'https://api.1inch.dev/swap/v6.0';

// Supported chain IDs
export const SUPPORTED_CHAINS = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    arbitrum: 42161,
    optimism: 10,
    avalanche: 43114,
    base: 8453,
} as const;

export type ChainId = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS];

// Common token addresses by chain
export const COMMON_TOKENS: Record<number, Record<string, { address: string; symbol: string; decimals: number; logo: string }>> = {
    1: { // Ethereum
        ETH: { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', symbol: 'ETH', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png' },
        USDT: { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', decimals: 6, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png' },
        USDC: { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', decimals: 6, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdc.png' },
        DAI: { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dai.png' },
        WBTC: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', symbol: 'WBTC', decimals: 8, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png' },
        WETH: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png' },
        LINK: { address: '0x514910771af9ca656af840dff83e8264ecf986ca', symbol: 'LINK', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/link.png' },
        UNI: { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', symbol: 'UNI', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/uni.png' },
    },
    56: { // BSC
        BNB: { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', symbol: 'BNB', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png' },
        USDT: { address: '0x55d398326f99059ff775485246999027b3197955', symbol: 'USDT', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png' },
        USDC: { address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', symbol: 'USDC', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdc.png' },
        BUSD: { address: '0xe9e7cea3dedca5984780bafc599bd69add087d56', symbol: 'BUSD', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/busd.png' },
        WBNB: { address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', symbol: 'WBNB', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png' },
    },
    137: { // Polygon
        MATIC: { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', symbol: 'MATIC', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png' },
        USDT: { address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', symbol: 'USDT', decimals: 6, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png' },
        USDC: { address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', symbol: 'USDC', decimals: 6, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdc.png' },
        WETH: { address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', symbol: 'WETH', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png' },
        WMATIC: { address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', symbol: 'WMATIC', decimals: 18, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png' },
    },
};

// Get chain name from ID
export const getChainName = (chainId: number): string => {
    const chains: Record<number, string> = {
        1: 'Ethereum',
        56: 'BNB Chain',
        137: 'Polygon',
        42161: 'Arbitrum',
        10: 'Optimism',
        43114: 'Avalanche',
        8453: 'Base',
    };
    return chains[chainId] || 'Unknown';
};

export interface QuoteParams {
    chainId: number;
    src: string; // Source token address
    dst: string; // Destination token address
    amount: string; // Amount in smallest unit (wei, etc.)
    fee?: number; // Partner fee (optional, in basis points)
}

export interface QuoteResponse {
    dstAmount: string;
    srcToken: TokenInfo;
    dstToken: TokenInfo;
    protocols: ProtocolInfo[][];
    gas: number;
}

export interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
}

export interface ProtocolInfo {
    name: string;
    part: number;
    fromTokenAddress: string;
    toTokenAddress: string;
}

export interface SwapParams extends QuoteParams {
    from: string; // User's wallet address
    slippage: number; // Slippage tolerance in percentage (e.g., 1 for 1%)
    disableEstimate?: boolean;
    allowPartialFill?: boolean;
}

export interface SwapResponse extends QuoteResponse {
    tx: {
        from: string;
        to: string;
        data: string;
        value: string;
        gasPrice: string;
        gas: number;
    };
}

/**
 * Fetches the 1inch API Key from environment
 * The API key should be stored in .env as NEXT_PUBLIC_ONEINCH_API_KEY
 */
const getApiKey = (): string => {
    const apiKey = process.env.NEXT_PUBLIC_ONEINCH_API_KEY;
    if (!apiKey) {
        console.warn('1inch API key not found. Set NEXT_PUBLIC_ONEINCH_API_KEY in .env');
        return '';
    }
    return apiKey;
};

/**
 * Get a swap quote from 1inch
 */
export async function getQuote(params: QuoteParams): Promise<QuoteResponse | null> {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('1inch API key is required for quotes');
        return null;
    }

    try {
        const queryParams = new URLSearchParams({
            src: params.src,
            dst: params.dst,
            amount: params.amount,
            ...(params.fee && { fee: params.fee.toString() }),
        });

        const response = await fetch(
            `${ONEINCH_API_BASE}/${params.chainId}/quote?${queryParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Quote fetch error:', error);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to get quote:', error);
        return null;
    }
}

/**
 * Get swap transaction data from 1inch
 */
export async function getSwap(params: SwapParams): Promise<SwapResponse | null> {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('1inch API key is required for swaps');
        return null;
    }

    try {
        const queryParams = new URLSearchParams({
            src: params.src,
            dst: params.dst,
            amount: params.amount,
            from: params.from,
            slippage: params.slippage.toString(),
            ...(params.disableEstimate && { disableEstimate: 'true' }),
            ...(params.allowPartialFill && { allowPartialFill: 'true' }),
            ...(params.fee && { fee: params.fee.toString() }),
        });

        const response = await fetch(
            `${ONEINCH_API_BASE}/${params.chainId}/swap?${queryParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Swap fetch error:', error);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to get swap data:', error);
        return null;
    }
}

/**
 * Get token allowance for 1inch router
 */
export async function getAllowance(
    chainId: number,
    tokenAddress: string,
    walletAddress: string
): Promise<string | null> {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    try {
        const queryParams = new URLSearchParams({
            tokenAddress,
            walletAddress,
        });

        const response = await fetch(
            `${ONEINCH_API_BASE}/${chainId}/approve/allowance?${queryParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.allowance;
    } catch (error) {
        console.error('Failed to get allowance:', error);
        return null;
    }
}

/**
 * Get approval transaction data for 1inch router
 */
export async function getApprovalTransaction(
    chainId: number,
    tokenAddress: string,
    amount?: string // Optional, if not provided, approves max amount
): Promise<{ data: string; to: string; gasPrice: string; value: string } | null> {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    try {
        const queryParams = new URLSearchParams({
            tokenAddress,
            ...(amount && { amount }),
        });

        const response = await fetch(
            `${ONEINCH_API_BASE}/${chainId}/approve/transaction?${queryParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error('Failed to get approval transaction:', error);
        return null;
    }
}

/**
 * Get 1inch router contract address for a chain
 */
export async function getRouterAddress(chainId: number): Promise<string | null> {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    try {
        const response = await fetch(
            `${ONEINCH_API_BASE}/${chainId}/approve/spender`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.address;
    } catch (error) {
        console.error('Failed to get router address:', error);
        return null;
    }
}

/**
 * Format token amount from wei to human readable
 */
export function formatTokenAmount(amount: string, decimals: number): string {
    const value = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');

    if (trimmedFractional.length === 0) {
        return integerPart.toString();
    }

    return `${integerPart}.${trimmedFractional.slice(0, 6)}`;
}

/**
 * Parse token amount from human readable to wei
 */
export function parseTokenAmount(amount: string, decimals: number): string {
    const [integerPart, fractionalPart = ''] = amount.split('.');
    const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(integerPart + paddedFractional).toString();
}
