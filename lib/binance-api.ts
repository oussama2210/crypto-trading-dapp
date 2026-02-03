'use server';

/**
 * Binance REST API Service
 * Replaces CoinGecko API with Binance public API endpoints
 */

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const COINGECKO_API_BASE = process.env.COINGECKO_BASE_URL;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

// For now, we'll keep CoinGecko for coin metadata (names, logos, descriptions)
// since Binance doesn't provide this. You can later replace with CoinMarketCap or other sources.
async function fetcher<T>(endpoint: string, revalidate = 60): Promise<T> {
    const response = await fetch(`${BINANCE_API_BASE}${endpoint}`, {
        next: { revalidate },
    });

    if (!response.ok) {
        throw new Error(`Binance API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Binance symbol mapping (CoinGecko ID to Binance symbol)
const SYMBOL_MAP: Record<string, string> = {
    bitcoin: 'BTCUSDT',
    ethereum: 'ETHUSDT',
    tether: 'USDTUSDT',
    'binance-coin': 'BNBUSDT',
    solana: 'SOLUSDT',
    ripple: 'XRPUSDT',
    cardano: 'ADAUSDT',
    dogecoin: 'DOGEUSDT',
    polkadot: 'DOTUSDT',
    'usd-coin': 'USDCUSDT',
    // Add more mappings as needed
};

function getBinanceSymbol(coinId: string): string {
    return SYMBOL_MAP[coinId] || `${coinId.toUpperCase()}USDT`;
}

export async function getBinance24hrTicker(symbol: string) {
    try {
        const binanceSymbol = symbol.toUpperCase() + 'USDT';
        return await fetcher<{
            symbol: string;
            priceChange: string;
            priceChangePercent: string;
            lastPrice: string;
            volume: string;
            quoteVolume: string;
            openPrice: string;
            highPrice: string;
            lowPrice: string;
        }>(`/ticker/24hr?symbol=${binanceSymbol}`);
    } catch (error) {
        console.error('Error fetching Binance ticker:', error);
        return null;
    }
}

export async function getAllBinanceTickers() {
    try {
        const tickers = await fetcher<
            Array<{
                symbol: string;
                priceChange: string;
                priceChangePercent: string;
                lastPrice: string;
                volume: string;
                quoteVolume: string;
            }>
        >('/ticker/24hr');

        // Filter only USDT pairs
        return tickers.filter((ticker) => ticker.symbol.endsWith('USDT'));
    } catch (error) {
        console.error('Error fetching all Binance tickers:', error);
        return [];
    }
}

// Keep using CoinGecko for metadata since Binance doesn't provide coin info
export async function getCoinGeckoData<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    revalidate = 60,
): Promise<T> {
    const queryString = params
        ? '?' +
          Object.entries(params)
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => `${k}=${v}`)
              .join('&')
        : '';

    const url = `${COINGECKO_API_BASE}${endpoint}${queryString}`;

    const response = await fetch(url, {
        headers: {
            'x-cg-pro-api-key': COINGECKO_API_KEY!,
            'Content-Type': 'application/json',
        } as Record<string, string>,
        next: { revalidate },
    });

    if (!response.ok) {
        if (response.status === 429) {
            console.warn('Rate limited by CoinGecko, retrying in 1s...');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return getCoinGeckoData(endpoint, params, revalidate);
        }

        const errorBody: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status}: ${errorBody.error || response.statusText}`);
    }

    return response.json();
}

export async function getPools(
    id: string,
    network?: string | null,
    contractAddress?: string | null,
): Promise<PoolData> {
    const fallback: PoolData = {
        id: '',
        address: '',
        name: '',
        network: '',
    };

    if (network && contractAddress) {
        try {
            const poolData = await getCoinGeckoData<{ data: PoolData[] }>(
                `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
            );

            return poolData.data?.[0] ?? fallback;
        } catch (error) {
            console.log(error);
            return fallback;
        }
    }

    try {
        const poolData = await getCoinGeckoData<{ data: PoolData[] }>('/onchain/search/pools', {
            query: id,
        });

        return poolData.data?.[0] ?? fallback;
    } catch {
        return fallback;
    }
}
