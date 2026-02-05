# Ceypto - Next-Gen Crypto Analytics Platform

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Binance API](https://img.shields.io/badge/Binance_Data-F0B90B?style=for-the-badge&logo=binance&logoColor=black)

**Ceypto** is a high-performance, real-time cryptocurrency dashboard built for the modern web. It leverages **Next.js 16 (App Router)** and **Tailwind CSS v4** to deliver an immersive, lightning-fast experience for tracking markets, analyzing assets, and monitoring portfolios.

## ✨ Key Features

### 1. 📊 Real-Time Market Intelligence
- **Live Tickers**: Instant price updates powered by direct Binance API integration.
- **Smart Fallback System**: Automatically switches between `Binance.com` and `Binance.us` APIs to ensure global availability (including restricted regions like the US).
- **Trend Discovery**: Algo-driven identification of **Top Gainers**, **Losers**, and **Trending** coins based on 24h volume and momentum.

### 2. 📈 Professional Charting
- **Interactive OHLC Candles**: Powered by `lightweight-charts` for smooth, responsive financial plotting.
- **Multi-Frame Analysis**: Switch seamlessly between 1H, 1D, 1W, and Yearly views.
- **Deep Metrics**: Visual indicators for Volume, Market Cap, Supply, and Price Changes.

### 3. 📰 Crypto News & Sentiment
- **Aggregated Feed**: Curated news from top industry publishers.
- **Sentiment Analysis**: Tracks community engagement (Upvotes/Downvotes) on news stories.
- **Rich Reading Mode**: Distraction-free article viewer with source attribution.

### 4. 💼 Ecosystem Explorer
- **Sector Analysis**: Dedicated views for market segments like **Layer 1**, **DeFi**, **AI & Big Data**, and **Meme Coins**.
- **Dynamic Categories**: Automatically aggregates and calculates market cap/volume for entire crypto sectors.

### 5. 🔗 Wallet & Portfolio (Web3)
- **WalletConnect Integration**: Securely connect mobile wallets using the Reown/WalletKit protocol.
- **Portfolio Tracking**: Monitor asset values and P&L in real-time.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.1](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **State & UI**: [React 19](https://react.dev/), Radix UI Primitives
- **Data Visualization**: [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- **Web3**: [Reown AppKit (WalletConnect)](https://reown.com/) & [Wagmi](https://wagmi.sh/)
- **Data Providers**: Binance API (Price), CryptoCompare (News), CoinCap (Assets)

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ceypto.git
   cd ceypto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory (optional for public APIs, but recommended for WalletConnect):
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
