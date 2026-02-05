'use client';

import { useState, useEffect, useRef } from 'react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceData {
    price: number;
    priceChange: number;
    priceChangePercent: number;
    volume: number;
    high: number;
    low: number;
}

interface RealtimePriceProps {
    symbol: string;
    initialPrice?: number;
    showChange?: boolean;
    showVolume?: boolean;
    className?: string;
    priceClassName?: string;
}

export function RealtimePrice({
    symbol,
    initialPrice = 0,
    showChange = true,
    showVolume = false,
    className,
    priceClassName,
}: RealtimePriceProps) {
    const [priceData, setPriceData] = useState<PriceData>({
        price: initialPrice,
        priceChange: 0,
        priceChangePercent: 0,
        volume: 0,
        high: 0,
        low: 0,
    });
    const [isConnected, setIsConnected] = useState(false);
    const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
    const ws = useRef<WebSocket | null>(null);
    const previousPrice = useRef(initialPrice);

    useEffect(() => {
        const pair = `${symbol.toLowerCase()}usdt`;

        // Connect to Binance WebSocket for real-time ticker updates
        const connect = () => {
            ws.current = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@ticker`);

            ws.current.onopen = () => {
                setIsConnected(true);
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const newPrice = parseFloat(data.c);

                // Flash price on change
                if (newPrice > previousPrice.current) {
                    setPriceFlash('up');
                } else if (newPrice < previousPrice.current) {
                    setPriceFlash('down');
                }
                previousPrice.current = newPrice;

                // Clear flash after animation
                setTimeout(() => setPriceFlash(null), 500);

                setPriceData({
                    price: newPrice,
                    priceChange: parseFloat(data.p),
                    priceChangePercent: parseFloat(data.P),
                    volume: parseFloat(data.q),
                    high: parseFloat(data.h),
                    low: parseFloat(data.l),
                });
            };

            ws.current.onerror = () => {
                setIsConnected(false);
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                // Reconnect after 3 seconds
                setTimeout(connect, 3000);
            };
        };

        connect();

        // Cleanup on unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [symbol]);

    const isPositive = priceData.priceChangePercent >= 0;

    return (
        <div className={cn('realtime-price', className)}>
            <div className="flex items-center gap-2">
                {isConnected && (
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live" />
                )}
                <span
                    className={cn(
                        'font-semibold transition-colors duration-300',
                        priceClassName,
                        priceFlash === 'up' && 'text-green-400',
                        priceFlash === 'down' && 'text-red-400'
                    )}
                >
                    {formatCurrency(priceData.price)}
                </span>
            </div>

            {showChange && (
                <div className={cn('flex items-center gap-1 text-sm', isPositive ? 'text-green-500' : 'text-red-500')}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{isPositive ? '+' : ''}{formatPercentage(priceData.priceChangePercent)}</span>
                </div>
            )}

            {showVolume && (
                <div className="flex items-center gap-1 text-sm text-purple-100">
                    <Activity className="w-4 h-4" />
                    <span>Vol: {formatCurrency(priceData.volume)}</span>
                </div>
            )}
        </div>
    );
}

interface MultiPriceTickerProps {
    symbols: string[];
    onPriceUpdate?: (symbol: string, price: number) => void;
}

export function MultiPriceTicker({ symbols, onPriceUpdate }: MultiPriceTickerProps) {
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const streams = symbols.map(s => `${s.toLowerCase()}usdt@ticker`).join('/');

        const connect = () => {
            ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

            ws.current.onmessage = (event) => {
                const { data } = JSON.parse(event.data);
                const symbol = data.s.replace('USDT', '');
                const newPrice = parseFloat(data.c);

                setPrices(prev => ({
                    ...prev,
                    [symbol]: {
                        price: newPrice,
                        priceChange: parseFloat(data.p),
                        priceChangePercent: parseFloat(data.P),
                        volume: parseFloat(data.q),
                        high: parseFloat(data.h),
                        low: parseFloat(data.l),
                    }
                }));

                onPriceUpdate?.(symbol, newPrice);
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
    }, [symbols, onPriceUpdate]);

    return prices;
}

export default RealtimePrice;
