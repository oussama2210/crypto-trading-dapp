# Ceypto - Advanced Cryptocurrency Dashboard

![Ceypto Dashboard](public/screenshot-placeholder.png)

Ceypto is a state-of-the-art, real-time cryptocurrency dashboard designed for traders, investors, and crypto enthusiasts. Built with modern web technologies, it delivers a premium, high-performance experience with live market data, interactive charts, and comprehensive asset tracking.

## 🚀 Features

### 1. **Real-Time Market Data**
   - **Live Price Tracking**: Real-time price updates for top cryptocurrencies (BTC, ETH, SOL, etc.) powered by Binance API.
   - **Dynamic Tickers**: Live price ticker bar with 24h change indicators.
   - **Top Gainers & Losers**: Automatically identifies and displays significant market movers.
   - **Trending Assets**: Algo-driven identification of trending coins based on volume and momentum.

### 2. **Advanced Analytics & Charts**
   - **Interactive Candlestick Charts**: Professional-grade charts with customizable timeframes (1H, 4H, 1D, 1W, etc.).
   - **Technical Indicators**: Visual indicators for market trends (Bullish/Bearish signals).
   - **Deep Dive Data**: Detailed metrics including Market Cap, 24h Volume, High/Low stats, and Circulating Supply.

### 3. **Crypto Intelligence & News**
   - **Aggregated News Feed**: A dedicated news section pulling the latest stories from top crypto publishers via CryptoCompare.
   - **Detailed Article View**: Immersive reading experience with rich metadata, source attribution, and direct links to original content.
   - **Sentiment Analysis**: Integration of upvote/downvote statistics to gauge community sentiment.

### 4. **Portfolio Management**
   - **Wallet Connection**: Seamless Web3 integration using WalletConnect for secure wallet linking.
   - **Asset Tracking**: Personalized portfolio view showing current holdings, total balance, and P&L (Profit & Loss).
   - **Simulated Trading**: (Demo Mode) Experience portfolio management with simulated assets and real-time valuation updates.

### 5. **Ecosystem Explorer**
   - **Category Deep Dives**: Explore specific crypto sectors like Layer 1, DeFi, Meme Coins, AI & Big Data.
   - **Compare & Contrast**: Dedicated views for comparing tokens within the same ecosystem.

## 🛠️ Technology Stack

Ceypto is architected for speed, scalability, and developer experience.

### **Core Framework**
- **[Next.js 15](https://nextjs.org/)**: The React framework for the web, utilizing App Router for robust routing and Server Components for optimal performance and SEO.
- **[React 19](https://react.dev/)**: The latest library for building interactive user interfaces.
- **[TypeScript](https://www.typescriptlang.org/)**: For static type checking, ensuring code reliability and maintainability.

### **Styling & Design System**
- **[Tailwind CSS v4](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
- **[Lucide React](https://lucide.dev/)**: Beuatiful, consistent icon set.
- **Custom Design System**: A bespoke "Dark Mode" aesthetic featuring:
    - **Color Palette**: Sophisticated Deep Blue (`#000000`/`#0a0a0a`) background with Electric Blue (`#3b82f6`) and Neon Green accents.
    - **Glassmorphism**: Subtle translucency and blur effects for a modern, layered depth.
    - **Responsive Layouts**: Mobile-first design ensuring a perfect experience on all devices.

### **Data & APIs**
- **[Binance API](https://binance.com/)**: Primary source for real-time price feeds, ticker data, and complex market stats.
- **[CryptoCompare API](https://min-api.cryptocompare.com/)**: Source for aggregated cryptocurrency news and media.
- **[CoinCap API](https://coincap.io/)**: Provides high-quality vector assets and icons for thousands of tokens.

### **State Management & Web3**
- **WalletConnect**: Standard protocol for connecting decentralized applications to mobile wallets.
- **React Hooks**: Custom hooks for managing websocket connections, wallet state, and fetching logic.

## 🎨 Design Philosophy

The design of Ceypto is centered around **"Data Clarity in Dark Mode"**.
- **Visual Hierarchy**: Critical data (Price, Change %) is highlighted with bold typography and color-coded indicators (Green/Red).
- **Immersive Environment**: The dark theme reduces eye strain during long trading sessions while allowing vibrant accent colors to pop, drawing attention to actionable insights.
- **Micro-Interactions**: Subtle hover effects, smooth transitions, and skeleton loading states create a polished, responsive feel.

## 🔧 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ceypto.git
    cd ceypto
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

```bash
/app
  ├── /categories   # Dynamic category explorer pages
  ├── /news         # News feed and detailed article pages
  ├── /portfolio    # User portfolio and wallet management
  ├── globals.css   # Global styles and Tailwind configuration
  └── page.tsx      # Main dashboard landing page
/components
  ├── /home         # Dashboard specific components (Ticker, Lists)
  ├── /ui           # Reusable UI primitives (Buttons, Badges)
  └── Header.tsx    # Main navigation and layout header
/lib
  ├── binance-api.ts # Binance API integration services
  ├── news-api.ts    # News fetching services
  └── walletconnect  # Web3 configuration
```

---

*Ceypto is a demonstration of modern web engineering capabilities, designed to showcase the potential of Next.js in building complex, data-intensive financial applications.*
