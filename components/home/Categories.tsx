import { getCryptoCategories } from '@/lib/binance-realtime';
import DataTable from '@/components/DataTabel';
import FallbackImage from '@/components/ui/FallbackImage';
import { cn, formatCurrency, formatPercentage, formatCompactNumber } from '@/lib/utils';
import { TrendingDown, TrendingUp, Layers } from 'lucide-react';
import { CategoriesFallback } from './fallback';
import Link from 'next/link';

interface CategoryData {
    name: string;
    slug: string;
    coins: {
        symbol: string;
        name: string;
        image: string;
        price: number;
        priceChangePercent24h: number;
    }[];
    marketCap: number;
    volume24h: number;
    change24h: number;
}

const Categories = async () => {
    try {
        const categories = await getCryptoCategories();

        if (!categories || categories.length === 0) {
            return <CategoriesFallback />;
        }

        const columns: DataTableColumn<CategoryData>[] = [
            {
                header: 'Category',
                cellClassName: 'category-cell',
                cell: (category) => (
                    <Link href={`/categories/${category.slug}`} className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                        <Layers className="w-4 h-4 text-purple-100 group-hover:text-green-500 transition-colors" />
                        {category.name}
                    </Link>
                )
            },
            {
                header: 'Top Coins',
                cellClassName: 'top-gainers-cell',
                cell: (category) =>
                    category.coins.slice(0, 3).map((coin) => (
                        <FallbackImage
                            src={coin.image}
                            alt={coin.symbol}
                            key={coin.symbol}
                            width={28}
                            height={28}
                            className="rounded-full"
                        />
                    )),
            },
            {
                header: '24h Change',
                cellClassName: 'change-header-cell',
                cell: (category) => {
                    const isTrendingUp = category.change24h > 0;

                    return (
                        <div className={cn('change-cell', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
                            <p className="flex items-center">
                                {isTrendingUp ? '+' : ''}{category.change24h.toFixed(2)}%
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
                header: 'Market Cap',
                cellClassName: 'market-cap-cell',
                cell: (category) => formatCompactNumber(category.marketCap),
            },
            {
                header: '24h Volume',
                cellClassName: 'volume-cell',
                cell: (category) => formatCurrency(category.volume24h),
            },
        ];

        return (
            <div id="categories" className="custom-scrollbar">
                <h4 className="flex items-center gap-2">
                    <Layers className="w-6 h-6 text-purple-100" />
                    Top Categories
                    <span className="text-sm font-normal text-purple-100 ml-2">(Real-time)</span>
                </h4>

                <DataTable
                    columns={columns}
                    data={categories as CategoryData[]}
                    rowKey={(category, index) => `${category.name}-${index}`}
                    tableClassName="mt-3"
                />
            </div>
        );
    } catch (error) {
        console.error('Error fetching categories:', error);
        return <CategoriesFallback />;
    }
};

export default Categories;