'use client';
import { useEffect, useRef, useState } from 'react';

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

export const useBinanceWebSocket = ({
    symbol,
    liveInterval,
}: UseBinanceWebSocketProps): UseBinanceWebSocketReturn => {
    const wsRef = useRef<WebSocket | null>(null);
    const [price, setPrice] = useState<ExtendedPriceData | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
    const [isWsReady, setIsWsReady] = useState(false);

    // Binance requires lowercase symbol for streams (e.g., btcusdt)
    const binanceSymbol = symbol ? `${symbol.toLowerCase()}usdt` : '';

    // Map the '1s' | '1m' interval to Binance intervals
    // Binance supports 1m for klines (1s is not supported for klines)
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
                ws.send(JSON.stringify(payload));
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
                setOhlcv(candle);
            }
        };

        ws.onopen = () => {
            setIsWsReady(true);
            subscribe();
        };

        ws.onmessage = handleMessage;
        ws.onclose = () => setIsWsReady(false);
        ws.onerror = (err: any) => {
            console.warn(`Binance WS Error for ${binanceSymbol}. This symbol might not be listed on Binance.`);
            setIsWsReady(false);
        };

        return () => {
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
