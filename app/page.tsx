import React, { Suspense } from 'react';
import CoinOverview from '@/components/home/CoinOverview';
import TrendingCoins from '@/components/home/TrendingCoins';
import {
  CategoriesFallback,
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from '@/components/home/fallback';
import Categories from '@/components/home/Categories';
import { getTopCoins } from '@/lib/binance-realtime';
import LivePriceTicker from '@/components/home/LivePriceTicker';

const Page = async () => {
  // Fetch top coins for the live ticker
  const topCoins = await getTopCoins(8);

  return (
    <main className="main-container">
      {/* Live Price Ticker */}
      {topCoins.length > 0 && (
        <section className="mb-6">
          <LivePriceTicker coins={topCoins} />
        </section>
      )}

      <section className="home-grid">
        <Suspense fallback={<CoinOverviewFallback />}>
          <CoinOverview />
        </Suspense>

        <Suspense fallback={<TrendingCoinsFallback />}>
          <TrendingCoins />
        </Suspense>
      </section>

      <section className="w-full mt-7 space-y-4">
        <Suspense fallback={<CategoriesFallback />}>
          <Categories />
        </Suspense>
      </section>
    </main>
  );
};

export default Page;