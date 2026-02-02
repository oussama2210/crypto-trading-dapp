import { PERIOD_CONFIG } from '@/constants';

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
        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`,
            { next: { revalidate: 60 } }
        );

        if (!response.ok) {
            console.error(`Binance API Error: ${response.status} ${response.statusText}`);
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
