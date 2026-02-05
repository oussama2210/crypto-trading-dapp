import React from 'react';
import { getBinanceOHLC, getBinanceTicker } from '@/lib/binance_api';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const CoinOverview = async () => {
    try {
        // Use Binance API for reliable real-time data
        const [tickerData, coinOHLCData] = await Promise.all([
            getBinanceTicker('BTC'),
            getBinanceOHLC('btc', 1),
        ]);

        if (!tickerData) {
            return <CoinOverviewFallback />;
        }

        const currentPrice = parseFloat(tickerData.lastPrice);
        const priceChange = parseFloat(tickerData.priceChangePercent);
        const isPositive = priceChange >= 0;

        return (
            <div id="coin-overview">
                <CandlestickChart data={coinOHLCData} coinId="bitcoin">
                    <div className="header pt-2">
                        <Image
                            src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png"
                            alt="Bitcoin"
                            width={56}
                            height={56}
                            className="rounded-full"
                        />
                        <div className="info">
                            <p className="flex items-center gap-2">
                                Bitcoin / BTC
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Live
                                </span>
                            </p>
                            <div className="flex items-center gap-3">
                                <h1>{formatCurrency(currentPrice)}</h1>
                                <span className={cn(
                                    'flex items-center gap-1 text-lg font-medium',
                                    isPositive ? 'text-green-500' : 'text-red-500'
                                )}>
                                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </CandlestickChart>
            </div>
        );
    } catch (error) {
        console.error('Error fetching coin overview:', error);
        return <CoinOverviewFallback />;
    }
};

export default CoinOverview;