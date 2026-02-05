import React from 'react';
import { getBinanceOHLC, getBinanceTicker } from '@/lib/binance_api';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import LiveDataWrapper from '@/components/LiveDataWrapper';
import Converter from '@/components/Converter';
import TokenSwap from '@/components/TokenSwap';

const COIN_MAPPING: Record<string, string> = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'tether': 'USDT',
    'binancecoin': 'BNB',
    'solana': 'SOL',
    'ripple': 'XRP',
    'cardano': 'ADA',
    'dogecoin': 'DOGE',
};

const Page = async ({ params }: NextPageProps) => {
    const { id } = await params;
    const symbol = COIN_MAPPING[id.toLowerCase()] || id.toUpperCase();

    // Fetch Binance Data
    const [tickerData, coinOHLCData] = await Promise.all([
        getBinanceTicker(symbol),
        getBinanceOHLC(symbol, 1),
    ]);

    const priceChange = tickerData ? parseFloat(tickerData.priceChangePercent) : 0;
    const isPositive = priceChange >= 0;

    // Synthesize coinData from Binance ticker
    const coinData: CoinDetailsData = {
        id: id.toLowerCase(),
        symbol: symbol,
        name: symbol, // Binance doesn't provide full names, using symbol as name
        image: {
            large: tickerData ? `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png` : '/logo.png',
            small: tickerData ? `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${symbol.toLowerCase()}.png` : '/logo.png',
        },
        market_data: {
            current_price: { usd: tickerData ? parseFloat(tickerData.lastPrice) : 0 },
            price_change_24h_in_currency: { usd: tickerData ? parseFloat(tickerData.priceChange) : 0 },
            price_change_percentage_24h_in_currency: { usd: tickerData ? parseFloat(tickerData.priceChangePercent) : 0 },
            price_change_percentage_30d_in_currency: { usd: 0 },
            market_cap: { usd: 0 },
            total_volume: { usd: tickerData ? parseFloat(tickerData.quoteVolume) : 0 },
        },
        market_cap_rank: 0,
        description: { en: '' },
        links: {
            homepage: [],
            blockchain_site: [],
            subreddit_url: '',
        },
        tickers: [],
    };

    const coinDetails = [
        {
            label: '24h High',
            value: tickerData ? formatCurrency(parseFloat(tickerData.highPrice)) : '-',
            icon: <TrendingUp className="w-4 h-4 text-green-500" />,
        },
        {
            label: '24h Low',
            value: tickerData ? formatCurrency(parseFloat(tickerData.lowPrice)) : '-',
            icon: <TrendingDown className="w-4 h-4 text-red-500" />,
        },
        {
            label: '24h Volume',
            value: tickerData ? formatCurrency(parseFloat(tickerData.quoteVolume)) : '-',
            icon: <Activity className="w-4 h-4 text-purple-100" />,
        },
        {
            label: 'Price Change',
            value: tickerData ? `${isPositive ? '+' : ''}${tickerData.priceChangePercent}%` : '-',
            icon: <BarChart3 className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />,
            isChange: true,
        },
        {
            label: 'Trading Pair',
            value: `${symbol}/USDT`,
            icon: null,
        },
        {
            label: 'Source',
            value: 'Binance API',
            icon: null,
        },
    ];

    const pool = { id: '', address: '', name: '', network: '' };

    return (
        <main id="coin-details-page">
            <section className="primary">
                <LiveDataWrapper coinId={id} poolId={pool.id} coin={coinData} coinOHLCData={coinOHLCData}>
                    <h4>Market Activity</h4>
                </LiveDataWrapper>
            </section>

            <section className="secondary">
                {/* Token Swap Component */}
                <TokenSwap chainId={1} />

                <Converter
                    symbol={coinData.symbol}
                    icon={coinData.image.small}
                    priceList={coinData.market_data.current_price}
                />

                <div className="details">
                    <h4>Market Statistics</h4>

                    <ul className="details-grid">
                        {coinDetails.map(({ label, value, icon, isChange }, index) => (
                            <li key={index} className="glass-card">
                                <div className="flex items-center gap-2">
                                    {icon}
                                    <p className="label">{label}</p>
                                </div>
                                <p className={`text-base font-medium ${isChange ? (isPositive ? 'text-green-500' : 'text-red-500') : ''}`}>
                                    {value}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </main>
    );
};
export default Page;