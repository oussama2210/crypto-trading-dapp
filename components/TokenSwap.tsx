'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowDownUp, Settings, ChevronDown, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    COMMON_TOKENS,
    SUPPORTED_CHAINS,
    getChainName,
    getQuote,
    getSwap,
    formatTokenAmount,
    parseTokenAmount,
    type QuoteResponse,
} from '@/lib/1inch-api';

declare global {
    interface Window {
        ethereum?: any;
    }
}

interface TokenInfo {
    address: string;
    symbol: string;
    decimals: number;
    logo: string;
}

interface TokenSwapProps {
    chainId?: number;
    onSwapSuccess?: (txHash: string) => void;
}

export default function TokenSwap({ chainId: initialChainId = 1, onSwapSuccess }: TokenSwapProps) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [chainId, setChainId] = useState(initialChainId);
    const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
    const [toToken, setToToken] = useState<TokenInfo | null>(null);
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [slippage, setSlippage] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [showFromSelector, setShowFromSelector] = useState(false);
    const [showToSelector, setShowToSelector] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isQuoteLoading, setIsQuoteLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quote, setQuote] = useState<QuoteResponse | null>(null);
    const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

    const tokens = COMMON_TOKENS[chainId] || COMMON_TOKENS[1];
    const tokenList = Object.values(tokens);

    // Check for connected wallet on mount
    useEffect(() => {
        const checkWallet = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                    }
                    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
                    setChainId(parseInt(chainIdHex, 16));

                    // Listen for changes
                    window.ethereum.on('accountsChanged', (accounts: string[]) => {
                        setWalletAddress(accounts.length > 0 ? accounts[0] : null);
                    });
                    window.ethereum.on('chainChanged', (chainIdHex: string) => {
                        setChainId(parseInt(chainIdHex, 16));
                    });
                } catch (err) {
                    console.error('Error checking wallet:', err);
                }
            }
        };

        checkWallet();
    }, []);

    // Initialize default tokens
    useEffect(() => {
        if (tokenList.length >= 2) {
            setFromToken(tokenList[0]);
            setToToken(tokenList[1]);
        }
    }, [chainId]);

    // Fetch quote when amounts change
    const fetchQuote = useCallback(async () => {
        if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
            setQuote(null);
            setToAmount('');
            return;
        }

        setIsQuoteLoading(true);
        setError(null);

        try {
            const amountInWei = parseTokenAmount(fromAmount, fromToken.decimals);
            const quoteData = await getQuote({
                chainId,
                src: fromToken.address,
                dst: toToken.address,
                amount: amountInWei,
            });

            if (quoteData) {
                setQuote(quoteData);
                setToAmount(formatTokenAmount(quoteData.dstAmount, toToken.decimals));
            } else {
                setError('Unable to get quote. Try a different amount or token pair.');
                setToAmount('');
            }
        } catch (err) {
            setError('Failed to fetch quote');
            console.error(err);
        } finally {
            setIsQuoteLoading(false);
        }
    }, [fromToken, toToken, fromAmount, chainId]);

    // Debounced quote fetch
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchQuote();
        }, 500);

        return () => clearTimeout(handler);
    }, [fetchQuote]);

    const handleSwapTokens = () => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
    };

    const handleSwap = async () => {
        if (!walletAddress) {
            setError('Please connect your wallet first');
            return;
        }

        if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setIsLoading(true);
        setTxStatus('pending');
        setError(null);

        try {
            const amountInWei = parseTokenAmount(fromAmount, fromToken.decimals);
            const swapData = await getSwap({
                chainId,
                src: fromToken.address,
                dst: toToken.address,
                amount: amountInWei,
                from: walletAddress,
                slippage,
            });

            if (!swapData) {
                throw new Error('Failed to get swap data');
            }

            // Send transaction via MetaMask or connected wallet
            if (typeof window !== 'undefined' && window.ethereum) {
                const txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: swapData.tx.from,
                        to: swapData.tx.to,
                        data: swapData.tx.data,
                        value: swapData.tx.value,
                        gasPrice: swapData.tx.gasPrice,
                        gas: '0x' + swapData.tx.gas.toString(16),
                    }],
                });

                setTxStatus('success');
                onSwapSuccess?.(txHash);

                // Reset form after successful swap
                setTimeout(() => {
                    setFromAmount('');
                    setToAmount('');
                    setTxStatus('idle');
                }, 3000);
            } else {
                throw new Error('No wallet connected');
            }
        } catch (err: any) {
            console.error('Swap failed:', err);
            setError(err.message || 'Swap failed. Please try again.');
            setTxStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const TokenSelector = ({
        selectedToken,
        onSelect,
        isOpen,
        onToggle,
        excludeToken,
    }: {
        selectedToken: TokenInfo | null;
        onSelect: (token: TokenInfo) => void;
        isOpen: boolean;
        onToggle: () => void;
        excludeToken?: TokenInfo | null;
    }) => (
        <div className="relative">
            <button
                onClick={onToggle}
                className="token-selector-btn"
            >
                {selectedToken ? (
                    <>
                        <Image
                            src={selectedToken.logo}
                            alt={selectedToken.symbol}
                            width={24}
                            height={24}
                            className="rounded-full"
                        />
                        <span className="font-semibold">{selectedToken.symbol}</span>
                    </>
                ) : (
                    <span className="text-purple-100">Select</span>
                )}
                <ChevronDown className="w-4 h-4 text-purple-100" />
            </button>

            {isOpen && (
                <div className="token-dropdown">
                    <div className="p-3 border-b border-dark-400">
                        <p className="text-sm text-purple-100 font-medium">Select Token</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {tokenList
                            .filter((t) => t.address !== excludeToken?.address)
                            .map((token) => (
                                <button
                                    key={token.address}
                                    onClick={() => {
                                        onSelect(token);
                                        onToggle();
                                    }}
                                    className="token-option"
                                >
                                    <Image
                                        src={token.logo}
                                        alt={token.symbol}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                    <span className="font-medium">{token.symbol}</span>
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div id="token-swap">
            <div className="swap-header">
                <div className="header-left">
                    <Zap className="w-5 h-5 text-green-500" />
                    <h4>Swap Tokens</h4>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="settings-btn"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="settings-panel">
                    <p className="text-sm text-purple-100 mb-2">Slippage Tolerance</p>
                    <div className="slippage-options">
                        {[0.5, 1, 2, 3].map((value) => (
                            <button
                                key={value}
                                onClick={() => setSlippage(value)}
                                className={`slippage-btn ${slippage === value ? 'active' : ''}`}
                            >
                                {value}%
                            </button>
                        ))}
                        <div className="slippage-custom">
                            <Input
                                type="number"
                                value={slippage}
                                onChange={(e) => setSlippage(parseFloat(e.target.value) || 1)}
                                className="w-16 text-center"
                                min={0.1}
                                max={50}
                                step={0.1}
                            />
                            <span className="text-sm text-purple-100">%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* From Token */}
            <div className="swap-card">
                <div className="card-header">
                    <span className="label">From</span>
                    <span className="chain-badge">{getChainName(chainId)}</span>
                </div>
                <div className="swap-input-row">
                    <Input
                        type="number"
                        placeholder="0.0"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="swap-input"
                        min={0}
                        step="any"
                    />
                    <TokenSelector
                        selectedToken={fromToken}
                        onSelect={setFromToken}
                        isOpen={showFromSelector}
                        onToggle={() => {
                            setShowFromSelector(!showFromSelector);
                            setShowToSelector(false);
                        }}
                        excludeToken={toToken}
                    />
                </div>
            </div>

            {/* Swap Direction Button */}
            <div className="swap-divider">
                <button onClick={handleSwapTokens} className="swap-direction-btn">
                    <ArrowDownUp className="w-5 h-5" />
                </button>
            </div>

            {/* To Token */}
            <div className="swap-card">
                <div className="card-header">
                    <span className="label">To (estimated)</span>
                    {isQuoteLoading && <Loader2 className="w-4 h-4 animate-spin text-green-500" />}
                </div>
                <div className="swap-input-row">
                    <Input
                        type="text"
                        placeholder="0.0"
                        value={toAmount}
                        readOnly
                        className="swap-input"
                    />
                    <TokenSelector
                        selectedToken={toToken}
                        onSelect={setToToken}
                        isOpen={showToSelector}
                        onToggle={() => {
                            setShowToSelector(!showToSelector);
                            setShowFromSelector(false);
                        }}
                        excludeToken={fromToken}
                    />
                </div>
            </div>

            {/* Quote Info */}
            {quote && fromToken && toToken && (
                <div className="quote-info">
                    <div className="quote-row">
                        <span className="text-purple-100">Rate</span>
                        <span className="font-medium">
                            1 {fromToken.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                        </span>
                    </div>
                    <div className="quote-row">
                        <span className="text-purple-100">Estimated Gas</span>
                        <span className="font-medium">~{quote.gas.toLocaleString()} units</span>
                    </div>
                    <div className="quote-row">
                        <span className="text-purple-100">Slippage</span>
                        <span className="font-medium">{slippage}%</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success Message */}
            {txStatus === 'success' && (
                <div className="success-message">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Swap successful!</span>
                </div>
            )}

            {/* Swap Button */}
            <Button
                onClick={handleSwap}
                disabled={!walletAddress || !fromAmount || !toAmount || isLoading || isQuoteLoading}
                className="swap-btn"
            >
                {!walletAddress ? (
                    'Connect Wallet to Swap'
                ) : isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Swapping...
                    </>
                ) : (
                    'Swap'
                )}
            </Button>

            {/* Powered by 1inch */}
            <div className="powered-by">
                <span>Powered by</span>
                <span className="font-semibold">1inch</span>
            </div>
        </div>
    );
}
