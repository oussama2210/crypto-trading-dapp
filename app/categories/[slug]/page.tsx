
import { getCategoryBySlug, TopCoin } from '@/lib/binance-realtime';
import DataTable from '@/components/DataTabel';
import FallbackImage from '@/components/ui/FallbackImage';
import { cn, formatCurrency, formatPercentage, formatCompactNumber } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Layers, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export const revalidate = 60;

const CategoryPage = async ({ params }: CategoryPageProps) => {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    const columns: DataTableColumn<TopCoin>[] = [
        {
            header: 'Token',
            cellClassName: 'token-cell',
            cell: (coin) => (
                <div className="flex items-center gap-3">
                    <FallbackImage
                        src={coin.image}
                        alt={coin.symbol}
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                    <div>
                        <p className="font-semibold">{coin.name}</p>
                        <p className="text-xs text-gray-400">{coin.symbol}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Price',
            cellClassName: 'price-cell',
            cell: (coin) => formatCurrency(coin.price),
        },
        {
            header: '24h Change',
            cellClassName: 'change-cell',
            cell: (coin) => {
                const isTrendingUp = coin.priceChangePercent24h > 0;
                return (
                    <span
                        className={cn('flex items-center gap-1 font-medium', {
                            'text-green-500': isTrendingUp,
                            'text-red-500': !isTrendingUp,
                        })}
                    >
                        {isTrendingUp ? '+' : ''}
                        {formatPercentage(coin.priceChangePercent24h)}
                        {isTrendingUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </span>
                );
            },
        },
        {
            header: '24h Volume',
            cellClassName: 'volume-cell',
            cell: (coin) => formatCurrency(coin.volume24h),
        },
        {
            header: 'High (24h)',
            cellClassName: 'hidden md:table-cell',
            cell: (coin) => formatCurrency(coin.high24h),
        },
        {
            header: 'Low (24h)',
            cellClassName: 'hidden md:table-cell',
            cell: (coin) => formatCurrency(coin.low24h),
        },
    ];

    return (
        <main className="main-container py-12">
            <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-green-500 transition-colors">
                <Link href="/" className="flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>
            </Button>

            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-dark-400 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Layers className="w-6 h-6 text-green-500" />
                            </div>
                            <h1 className="text-3xl font-bold">{category.name}</h1>
                        </div>
                        <p className="text-gray-400 max-w-xl">
                            Top cryptocurrencies in the {category.name} ecosystem by market capitalization.
                        </p>
                    </div>
                    <div className="flex gap-4 md:gap-8">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                            <p className="text-xl font-bold">{formatCompactNumber(category.marketCap)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-1">24h Volume</p>
                            <p className="text-xl font-bold">{formatCompactNumber(category.volume24h)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-500 rounded-xl border border-dark-400 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={category.coins}
                        rowKey={(coin) => coin.symbol}
                        tableClassName="text-sm md:text-base"
                    />
                </div>
            </div>
        </main>
    );
};

export default CategoryPage;
