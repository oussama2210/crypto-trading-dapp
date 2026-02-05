import { getTrendingCoins, type TopCoin } from '@/lib/binance-realtime';
import Link from 'next/link';
import FallbackImage from '@/components/ui/FallbackImage';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingDown, TrendingUp, Flame } from 'lucide-react';
import DataTable from '@/components/DataTabel';
import { TrendingCoinsFallback } from './fallback';

const TrendingCoins = async () => {
    let trendingCoins: TopCoin[] = [];

    try {
        trendingCoins = await getTrendingCoins(8);
    } catch (error) {
        console.error('Error fetching trending coins:', error);
        return <TrendingCoinsFallback />;
    }

    if (trendingCoins.length === 0) {
        return <TrendingCoinsFallback />;
    }

    const columns: DataTableColumn<TopCoin>[] = [
        {
            header: 'Name',
            cellClassName: 'name-cell',
            cell: (coin) => {
                return (
                    <Link href={`/coins/${coin.id}`}>
                        <FallbackImage
                            src={coin.image}
                            alt={coin.name}
                            width={36}
                            height={36}
                        />
                        <p>{coin.name}</p>
                    </Link>
                );
            },
        },
        {
            header: '24h Change',
            cellClassName: 'change-cell',
            cell: (coin) => {
                const isTrendingUp = coin.priceChangePercent24h > 0;

                return (
                    <div className={cn('price-change', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
                        <p className="flex items-center">
                            {formatPercentage(coin.priceChangePercent24h)}
                            {isTrendingUp ? (
                                <TrendingUp width={16} height={16} />
                            ) : (
                                <TrendingDown width={16} height={16} />
                            )}
                        </p>
                    </div>
                );
            },
        },
        {
            header: 'Price',
            cellClassName: 'price-cell',
            cell: (coin) => formatCurrency(coin.price),
        },
    ];

    return (
        <div id="trending-coins">
            <h4 className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                Trending Coins
                <span className="text-sm font-normal text-purple-100 ml-2">(Real-time)</span>
            </h4>

            <DataTable
                data={trendingCoins}
                columns={columns}
                rowKey={(coin) => coin.symbol}
                tableClassName="trending-coins-table"
                headerCellClassName="py-3!"
                bodyCellClassName="py-2!"
            />
        </div>
    );
};

export default TrendingCoins;