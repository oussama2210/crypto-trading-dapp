'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface CoinData {
    symbol: string;
    name: string;
    id: string;
    price: number;
    priceChange: number;
    image: string;
}

interface TopCoinData {
    symbol: string;
    name: string;
    id: string;
    price: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    image: string;
}

// Real-time price ticker component
export function LivePriceTicker({ coins }: { coins: TopCoinData[] }) {
    const [liveData, setLiveData] = useState<Record<string, CoinData>>({});
    const [priceFlash, setPriceFlash] = useState<Record<string, 'up' | 'down' | null>>({});
    const ws = useRef<WebSocket | null>(null);
    const previousPrices = useRef<Record<string, number>>({});

    useEffect(() => {
        // Initialize with server data
        const initialData: Record<string, CoinData> = {};
        coins.forEach(coin => {
            initialData[coin.symbol] = {
                symbol: coin.symbol,
                name: coin.name,
                id: coin.id,
                price: coin.price,
                priceChange: coin.priceChangePercent24h,
                image: coin.image,
            };
            previousPrices.current[coin.symbol] = coin.price;
        });
        setLiveData(initialData);

        // Connect to Binance WebSocket
        const symbols = coins.map(c => `${c.symbol.toLowerCase()}usdt@ticker`).join('/');

        const connect = () => {
            ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${symbols}`);

            ws.current.onmessage = (event) => {
                const { data } = JSON.parse(event.data);
                const symbol = data.s.replace('USDT', '');
                const newPrice = parseFloat(data.c);
                const priceChange = parseFloat(data.P);

                // Flash effect
                if (previousPrices.current[symbol]) {
                    if (newPrice > previousPrices.current[symbol]) {
                        setPriceFlash(prev => ({ ...prev, [symbol]: 'up' }));
                    } else if (newPrice < previousPrices.current[symbol]) {
                        setPriceFlash(prev => ({ ...prev, [symbol]: 'down' }));
                    }
                    setTimeout(() => {
                        setPriceFlash(prev => ({ ...prev, [symbol]: null }));
                    }, 500);
                }
                previousPrices.current[symbol] = newPrice;

                setLiveData(prev => ({
                    ...prev,
                    [symbol]: {
                        ...prev[symbol],
                        price: newPrice,
                        priceChange: priceChange,
                    }
                }));
            };

            ws.current.onclose = () => {
                setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [coins]);

    return (
        <div className="live-price-ticker">
            <div className="ticker-header">
                <h4 className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-green-500 animate-spin" style={{ animationDuration: '3s' }} />
                    Live Prices
                    <span className="live-badge">
                        <span className="live-dot" />
                        LIVE
                    </span>
                </h4>
            </div>

            <div className="ticker-grid">
                {Object.values(liveData).map((coin) => (
                    <Link href={`/coins/${coin.id}`} key={coin.symbol} className="ticker-card glass-card">
                        <div className="ticker-info">
                            <Image
                                src={coin.image}
                                alt={coin.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/logo.png';
                                }}
                            />
                            <div>
                                <p className="font-semibold">{coin.symbol}</p>
                                <p className="text-xs text-purple-100">{coin.name}</p>
                            </div>
                        </div>
                        <div className="ticker-price">
                            <p className={cn(
                                'font-bold transition-colors duration-300',
                                priceFlash[coin.symbol] === 'up' && 'text-green-400',
                                priceFlash[coin.symbol] === 'down' && 'text-red-400'
                            )}>
                                {formatCurrency(coin.price)}
                            </p>
                            <p className={cn(
                                'text-sm flex items-center gap-1',
                                coin.priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                            )}>
                                {coin.priceChange >= 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {coin.priceChange >= 0 ? '+' : ''}{coin.priceChange.toFixed(2)}%
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default LivePriceTicker;
