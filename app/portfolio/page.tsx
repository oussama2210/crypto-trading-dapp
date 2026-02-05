'use client';

import { useWallet } from '@/hooks/useWallet';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { WalletConnectButton } from '@/components/WalletConnectButton';

export default function PortfolioPage() {
    const { isConnected, address, currentChainId } = useWallet();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading state
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="main-container min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="main-container min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-dark-500 rounded-full flex items-center justify-center mb-4 border border-dark-400">
                    <Wallet className="w-12 h-12 text-purple-100" />
                </div>
                <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
                <p className="text-gray-400 max-w-md mx-auto">
                    Connect your wallet to view your portfolio, track your assets, and manage your investments in real-time.
                </p>
                <div className="pt-4">
                    <WalletConnectButton />
                </div>
            </div>
        );
    }

    return (
        <div className="main-container space-y-8">
            {/* Portfolio Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
                    <div className="flex items-center gap-2 text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Layers className="w-4 h-4" />
                        History
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600 text-white gap-2">
                        <CreditCard className="w-4 h-4" />
                        Buy Crypto
                    </Button>
                </div>
            </div>

            {/* Total Balance Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-purple-600/10 border border-green-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <p className="text-purple-100 mb-2 font-medium">Total Balance</p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">{formatCurrency(12450.80)}</h2>
                        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 w-fit px-3 py-1 rounded-full text-sm font-medium">
                            <TrendingUp className="w-4 h-4" />
                            +2.4% (24h)
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-dark-500 border border-dark-400">
                        <h3 className="text-gray-400 text-sm mb-2">Total Profit</h3>
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-bold text-green-500">+$2,340.50</p>
                            <ArrowUpRight className="w-5 h-5 text-green-500" />
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-dark-500 border border-dark-400">
                        <h3 className="text-gray-400 text-sm mb-2">Simulated Assets</h3>
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-bold">4 Assets</p>
                            <Layers className="w-5 h-5 text-purple-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Assets Table */}
            <div className="bg-dark-500 rounded-2xl border border-dark-400 overflow-hidden">
                <div className="p-6 border-b border-dark-400">
                    <h3 className="text-xl font-bold">Your Assets</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-400/50">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Asset</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Price</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Balance</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-400">
                            {[
                                { symbol: 'ETH', name: 'Ethereum', price: 2340.50, balance: 2.5, change: 1.2 },
                                { symbol: 'BTC', name: 'Bitcoin', price: 42350.80, balance: 0.15, change: -0.5 },
                                { symbol: 'SOL', name: 'Solana', price: 98.40, balance: 25, change: 5.4 },
                                { symbol: 'USDT', name: 'Tether', price: 1.00, balance: 450.00, change: 0.01 },
                            ].map((asset) => (
                                <tr key={asset.symbol} className="hover:bg-dark-400/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`}
                                                alt={asset.name}
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                            <div>
                                                <p className="font-bold">{asset.name}</p>
                                                <p className="text-sm text-gray-400">{asset.symbol}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <p className="font-medium">{formatCurrency(asset.price)}</p>
                                        <p className={`text-sm ${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {asset.change >= 0 ? '+' : ''}{asset.change}%
                                        </p>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <p className="font-medium">{asset.balance} {asset.symbol}</p>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <p className="font-bold">{formatCurrency(asset.price * asset.balance)}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
