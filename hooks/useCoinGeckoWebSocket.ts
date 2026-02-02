'use client';
import { useEffect, useRef, useState } from 'react';

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

export const useCoinGeckoWebSocket = ({
    symbol,
    liveInterval,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
    const wsRef = useRef<WebSocket | null>(null);
    const [price, setPrice] = useState<ExtendedPriceData | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
    const [isWsReady, setIsWsReady] = useState(false);

    // Binance requires lowercase symbol for streams (e.g., btcusdt)
    // We default to 'usdt' pair if not provided in symbol
    // If the symbol already contains a pair (which it likely doesn't from coin info), append 'usdt'
    // This is a naive assumption but works for many major coins on Binance.
    // Ideally we would need to map coinId to a Binance symbol if they differ significantly.
    const binanceSymbol = symbol ? `${symbol.toLowerCase()}usdt` : '';

    // Map the '1s' | '1m' interval to Binance intervals
    // Binance supports 1s (ticker), but for klines it supports 1m, 3m, 5m, 15m, 30m, 1h, etc.
    // '1s' is not a kline interval. The smallest is '1m'.
    // If liveInterval is '1s', we might just want 1m klines or just ticker updates.
    // Let's assume '1m' for klines.
    const klineInterval = liveInterval === '1m' ? '1m' : '1m';

    useEffect(() => {
        if (!binanceSymbol) return;

        const ws = new WebSocket(BINANCE_WS_BASE);
        wsRef.current = ws;

        const subscribe = () => {
            if (ws.readyState === WebSocket.OPEN) {
                const streams = [
                    `${binanceSymbol}@ticker`,
                    `${binanceSymbol}@trade`,
                    `${binanceSymbol}@kline_${klineInterval}`,
                ];

                const payload = {
                    method: 'SUBSCRIBE',
                    params: streams,
                    id: 1,
                };
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(payload));
                }
            }
        };

        const handleMessage = (event: MessageEvent) => {
            const msg = JSON.parse(event.data);

            // Ticker Event: 24h ticker
            if (msg.e === '24hrTicker') {
                setPrice({
                    usd: parseFloat(msg.c), // Current price
                    change24h: parseFloat(msg.P), // Price change percent
                    volume24h: parseFloat(msg.q), // Quote volume (USD volume approx)
                    // Binance doesn't send market cap in ticker stream easily without calc
                    // We can retain previous or just ignore if not needed strictly for live update
                    timestamp: msg.E,
                });
            }

            // Trade Event
            if (msg.e === 'trade') {
                const newTrade: Trade = {
                    price: parseFloat(msg.p),
                    amount: parseFloat(msg.q),
                    timestamp: msg.T,
                    type: msg.m ? 's' : 'b', // m=true means buyer is maker (sell), m=false means buyer is taker (buy)
                    // value is price * amount
                    value: parseFloat(msg.p) * parseFloat(msg.q),
                };
                setTrades((prev) => [newTrade, ...prev].slice(0, 50));
            }

            // Kline (Candlestick) Event
            if (msg.e === 'kline') {
                const k = msg.k;
                const candle: OHLCData = [
                    k.t, // Open time
                    parseFloat(k.o),
                    parseFloat(k.h),
                    parseFloat(k.l),
                    parseFloat(k.c),
                ];
                // Only update if the candle is closed or we want live updates
                // Binance sends updates for the current growing candle
                setOhlcv(candle);
            }
        };

        ws.onopen = () => {
            setIsWsReady(true);
            subscribe();
        };

        ws.onmessage = handleMessage;
        ws.onclose = () => setIsWsReady(false);
        ws.onerror = (err) => {
            console.error('Binance WS Error:', err);
            setIsWsReady(false);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                // Unsubscribe logic if strict cleanup needed, but closing socket is usually enough
            }
            ws.close();
        };
    }, [binanceSymbol, klineInterval]);

    return {
        price,
        trades,
        ohlcv,
        isConnected: isWsReady,
    };
};