'use server';

const BINANCE_API_URL = 'https://api.binance.com/api/v3';

export interface BinanceTicker {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    lastPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
}

export interface TopCoin {
    symbol: string;
    name: string;
    price: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    image: string;
    id: string;
}

// Map of common symbols to full names and CoinGecko IDs
const COIN_INFO: Record<string, { name: string; id: string }> = {
    BTC: { name: 'Bitcoin', id: 'bitcoin' },
    ETH: { name: 'Ethereum', id: 'ethereum' },
    BNB: { name: 'BNB', id: 'binancecoin' },
    SOL: { name: 'Solana', id: 'solana' },
    XRP: { name: 'XRP', id: 'ripple' },
    ADA: { name: 'Cardano', id: 'cardano' },
    DOGE: { name: 'Dogecoin', id: 'dogecoin' },
    AVAX: { name: 'Avalanche', id: 'avalanche-2' },
    DOT: { name: 'Polkadot', id: 'polkadot' },
    MATIC: { name: 'Polygon', id: 'matic-network' },
    LINK: { name: 'Chainlink', id: 'chainlink' },
    UNI: { name: 'Uniswap', id: 'uniswap' },
    SHIB: { name: 'Shiba Inu', id: 'shiba-inu' },
    LTC: { name: 'Litecoin', id: 'litecoin' },
    TRX: { name: 'TRON', id: 'tron' },
    ATOM: { name: 'Cosmos', id: 'cosmos' },
    XLM: { name: 'Stellar', id: 'stellar' },
    NEAR: { name: 'NEAR Protocol', id: 'near' },
    APT: { name: 'Aptos', id: 'aptos' },
    ARB: { name: 'Arbitrum', id: 'arbitrum' },
    OP: { name: 'Optimism', id: 'optimism' },
    FIL: { name: 'Filecoin', id: 'filecoin' },
    PEPE: { name: 'Pepe', id: 'pepe' },
};

// Top coins to track (by market cap)
const TOP_SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC', 'LINK', 'UNI'];

function getCoinIcon(symbol: string): string {
    return `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}

/**
 * Get real-time ticker data for multiple symbols from Binance
 */
export async function getMultipleTickers(symbols: string[] = TOP_SYMBOLS): Promise<BinanceTicker[]> {
    try {
        // Optimization: Request only specific symbols to keep response size small and cacheable
        const targetSymbols = symbols.map(s => `${s.toUpperCase()}USDT`);
        const query = `?symbols=${encodeURIComponent(JSON.stringify(targetSymbols))}`;

        const response = await fetch(`${BINANCE_API_URL}/ticker/24hr${query}`, {
            next: { revalidate: 10 },
        });

        if (!response.ok) {
            console.error('Binance API error:', response.status);
            return [];
        }

        const data = await response.json();
        // Binance returns an array for 'symbols' query, but check just in case
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error fetching Binance tickers:', error);
        return [];
    }
}

/**
 * Get top coins with real-time data
 */
export async function getTopCoins(limit: number = 12): Promise<TopCoin[]> {
    const symbols = TOP_SYMBOLS.slice(0, limit);
    const tickers = await getMultipleTickers(symbols);

    return tickers.map(ticker => {
        const symbol = ticker.symbol.replace('USDT', '');
        const info = COIN_INFO[symbol] || { name: symbol, id: symbol.toLowerCase() };

        return {
            symbol,
            name: info.name,
            id: info.id,
            price: parseFloat(ticker.lastPrice),
            priceChange24h: parseFloat(ticker.priceChange),
            priceChangePercent24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.quoteVolume),
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            image: getCoinIcon(symbol),
        };
    });
}

/**
 * Get trending coins based on volume and price change
 */
export async function getTrendingCoins(limit: number = 10): Promise<TopCoin[]> {
    try {
        const response = await fetch(`${BINANCE_API_URL}/ticker/24hr`, {
            cache: 'no-store', // Disable cache for large response (> 2MB)
        });

        if (!response.ok) {
            return [];
        }

        const allTickers: BinanceTicker[] = await response.json();

        // Filter for USDT pairs and sort by volume
        const usdtPairs = allTickers
            .filter(t => t.symbol.endsWith('USDT') && !t.symbol.includes('UP') && !t.symbol.includes('DOWN'))
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 50);

        // Get top gainers from high volume coins
        const trending = usdtPairs
            .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
            .slice(0, limit);

        return trending.map(ticker => {
            const symbol = ticker.symbol.replace('USDT', '');
            const info = COIN_INFO[symbol] || { name: symbol, id: symbol.toLowerCase() };

            return {
                symbol,
                name: info.name,
                id: info.id,
                price: parseFloat(ticker.lastPrice),
                priceChange24h: parseFloat(ticker.priceChange),
                priceChangePercent24h: parseFloat(ticker.priceChangePercent),
                volume24h: parseFloat(ticker.quoteVolume),
                high24h: parseFloat(ticker.highPrice),
                low24h: parseFloat(ticker.lowPrice),
                image: getCoinIcon(symbol),
            };
        });
    } catch (error) {
        console.error('Error fetching trending coins:', error);
        return [];
    }
}

/**
 * Get top losers for the day
 */
export async function getTopLosers(limit: number = 10): Promise<TopCoin[]> {
    try {
        const response = await fetch(`${BINANCE_API_URL}/ticker/24hr`, {
            cache: 'no-store', // Disable cache for large response (> 2MB)
        });

        if (!response.ok) {
            return [];
        }

        const allTickers: BinanceTicker[] = await response.json();

        // Filter for USDT pairs and sort by volume first
        const usdtPairs = allTickers
            .filter(t => t.symbol.endsWith('USDT') && !t.symbol.includes('UP') && !t.symbol.includes('DOWN'))
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 50);

        // Get top losers from high volume coins
        const losers = usdtPairs
            .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
            .slice(0, limit);

        return losers.map(ticker => {
            const symbol = ticker.symbol.replace('USDT', '');
            const info = COIN_INFO[symbol] || { name: symbol, id: symbol.toLowerCase() };

            return {
                symbol,
                name: info.name,
                id: info.id,
                price: parseFloat(ticker.lastPrice),
                priceChange24h: parseFloat(ticker.priceChange),
                priceChangePercent24h: parseFloat(ticker.priceChangePercent),
                volume24h: parseFloat(ticker.quoteVolume),
                high24h: parseFloat(ticker.highPrice),
                low24h: parseFloat(ticker.lowPrice),
                image: getCoinIcon(symbol),
            };
        });
    } catch (error) {
        console.error('Error fetching top losers:', error);
        return [];
    }
}

/**
 * Get crypto categories data (simulated since Binance doesn't have categories)
 * This creates virtual categories based on real market data
 */
export async function getCryptoCategories(): Promise<{
    name: string;
    slug: string;
    coins: TopCoin[];
    marketCap: number;
    volume24h: number;
    change24h: number;
}[]> {
    const allCoins = await getTopCoins(12);

    // Create categories based on coin types
    const categories = [
        {
            name: 'Layer 1',
            slug: 'layer-1',
            symbols: ['ETH', 'SOL', 'ADA', 'AVAX', 'DOT', 'NEAR', 'APT'],
        },
        {
            name: 'DeFi',
            slug: 'defi',
            symbols: ['UNI', 'LINK', 'AAVE', 'CRV', 'COMP', 'SNX'],
        },
        {
            name: 'Meme Coins',
            slug: 'meme-coins',
            symbols: ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'],
        },
        {
            name: 'Layer 2',
            slug: 'layer-2',
            symbols: ['MATIC', 'ARB', 'OP', 'IMX', 'STRK'],
        },
        {
            name: 'AI & Big Data',
            slug: 'ai-big-data',
            symbols: ['FET', 'AGIX', 'OCEAN', 'RNDR', 'GRT'],
        },
    ];

    const tickers = await getMultipleTickers([
        ...new Set(categories.flatMap(c => c.symbols))
    ]);

    return categories.map(category => {
        const categoryCoins = category.symbols
            .map(symbol => {
                const ticker = tickers.find(t => t.symbol === `${symbol}USDT`);
                if (!ticker) return null;

                const info = COIN_INFO[symbol] || { name: symbol, id: symbol.toLowerCase() };
                return {
                    symbol,
                    name: info.name,
                    id: info.id,
                    price: parseFloat(ticker.lastPrice),
                    priceChange24h: parseFloat(ticker.priceChange),
                    priceChangePercent24h: parseFloat(ticker.priceChangePercent),
                    volume24h: parseFloat(ticker.quoteVolume),
                    high24h: parseFloat(ticker.highPrice),
                    low24h: parseFloat(ticker.lowPrice),
                    image: getCoinIcon(symbol),
                };
            })
            .filter((c): c is TopCoin => c !== null);

        const totalVolume = categoryCoins.reduce((sum, c) => sum + c.volume24h, 0);
        const avgChange = categoryCoins.length > 0
            ? categoryCoins.reduce((sum, c) => sum + c.priceChangePercent24h, 0) / categoryCoins.length
            : 0;

        // Estimate market cap based on volume (rough approximation)
        const estimatedMarketCap = totalVolume * 10;

        return {
            name: category.name,
            slug: category.slug,
            coins: categoryCoins, // Return all coins
            marketCap: estimatedMarketCap,
            volume24h: totalVolume,
            change24h: avgChange,
        };
    });
}

export async function getCategoryBySlug(slug: string) {
    const categories = await getCryptoCategories();
    return categories.find(c => c.slug === slug);
}
