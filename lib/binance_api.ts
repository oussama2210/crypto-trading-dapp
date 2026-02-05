'use server';

import { PERIOD_CONFIG } from '@/constants';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const BINANCE_US_API_BASE = 'https://api.binance.us/api/v3';

export async function getBinanceOHLC(symbol: string, days: number | string): Promise<OHLCData[]> {
    if (!symbol) return [];

    const pair = `${symbol.toUpperCase()}USDT`;

    let interval = '1d';
    let limit = 365;

    if (days === 1) {
        interval = '1h';
        limit = 24;
    } else if (days === 7) {
        interval = '4h';
        limit = 42;
    } else if (days === 30) {
        interval = '4h';
        limit = 180;
    } else if (days === 90) {
        interval = '1d';
        limit = 90;
    } else if (days === 180) {
        interval = '1d';
        limit = 180;
    } else if (days === 365 || days === 'yearly') {
        interval = '1d';
        limit = 365;
    } else if (days === 'max') {
        interval = '1w';
        limit = 1000;
    }

    try {
        const query = `?symbol=${pair}&interval=${interval}&limit=${limit}`;
        let response = await fetch(
            `${BINANCE_API_BASE}/klines${query}`,
            { next: { revalidate: 60 } }
        );

        if (response.status === 451) {
            response = await fetch(
                `${BINANCE_US_API_BASE}/klines${query}`,
                { next: { revalidate: 60 } }
            );
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`Binance API ${response.status} for ${pair}: ${errorData.msg || response.statusText}`);
            return [];
        }

        const data = await response.json();

        return data.map((d: any[]) => [
            d[0], // Open time
            parseFloat(d[1]), // Open
            parseFloat(d[2]), // High
            parseFloat(d[3]), // Low
            parseFloat(d[4]), // Close
        ]);
    } catch (error) {
        console.error('Error fetching Binance OHLC:', error);
        return [];
    }
}

export async function getBinanceTicker(symbol: string) {
    if (!symbol) return null;
    const pair = `${symbol.toUpperCase()}USDT`;

    try {
        const query = `?symbol=${pair}`;
        let response = await fetch(`${BINANCE_API_BASE}/ticker/24hr${query}`, {
            next: { revalidate: 60 },
        });

        if (response.status === 451) {
            response = await fetch(`${BINANCE_US_API_BASE}/ticker/24hr${query}`, {
                next: { revalidate: 60 },
            });
        }

        if (!response.ok) {
            console.warn(`Binance Ticker API ${response.status} for ${pair}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching Binance ticker:', error);
        return null;
    }
}
