import React from 'react';
import { getBinanceOHLC, getBinanceTicker } from '@/lib/binance_api';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import LiveDataWrapper from '@/components/LiveDataWrapper';
import Converter from '@/components/Converter';

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
        },
        {
            label: '24h Low',
            value: tickerData ? formatCurrency(parseFloat(tickerData.lowPrice)) : '-',
        },
        {
            label: '24h Volume',
            value: tickerData ? formatCurrency(parseFloat(tickerData.quoteVolume)) : '-',
        },
        {
            label: 'Price Change',
            value: tickerData ? `${tickerData.priceChangePercent}%` : '-',
        },
        {
            label: 'Trading Pair',
            value: `${symbol}/USDT`,
        },
        {
            label: 'Source',
            value: 'Binance API',
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
                <Converter
                    symbol={coinData.symbol}
                    icon={coinData.image.small}
                    priceList={coinData.market_data.current_price}
                />

                <div className="details">
                    <h4>Market Statistics</h4>

                    <ul className="details-grid">
                        {coinDetails.map(({ label, value }, index) => (
                            <li key={index}>
                                <p className={label}>{label}</p>
                                <p className="text-base font-medium">{value}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </main>
    );
};
export default Page;