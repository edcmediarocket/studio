# **App Name**: Meme Prophet

## Core Features:

- AI Signal System: Real-time AI-driven buy/sell signals for meme coins, incorporating multi-algorithm engines using time series forecasting (LSTM/Prophet), sentiment analysis (NLP), and reinforcement learning models. Smart prediction confidence levels with heatmaps or star ratings, multi-timeframe support (1h, 4h, 1d, 1w projections), adjustable risk level, and auto-refresh live predictions with last update timestamp.
- Live Crypto Market Data Integration: Connect to CoinGecko API (or equivalent) for real-time meme coin data (prices, volume, market cap, % changes). Sortable, searchable, and filterable coin list table with trending tags. Custom icons and logos for popular meme tokens.
- AI Analysis Dashboard: Interactive charts showing price trends, predicted vs actual values, and whale movements. Coin-specific AI tool summaries of key market behavior, real-time social sentiment analysis from Twitter, Reddit, Telegram, and whale activity alerts (integrated with Whale Alert API).
- User Accounts & Subscriptions: Firebase Auth with Google login. Tiered subscription system using PayPal API: Free Tier (delayed signals), Basic (real-time AI signals for top 10 coins), Pro (full AI features + whale alerts + custom predictions). Protected routes for tiered access with real-time subscription validation.
- Watchlist & Alerts: User-customizable watchlist with local storage and cloud sync. Push notifications (via Firebase Cloud Messaging) for price spikes, buy/sell signals, and whale alerts.
- Advanced Tools & Utilities: Meme coin ROI calculator tool with AI prediction estimates, an AI chat assistant for coin-specific advice and FAQs, a coin comparison tool, and real-time on-chain data visualization.

## Style Guidelines:

- Primary color: Saturated blue (#4285F4) evoking trust and technological innovation, suitable for financial tools.
- Background color: Dark navy blue (#1A237E), providing a modern and serious base that inspires confidence.
- Accent color: Neon green, to highlight key interactive elements.
- Clean and modern fonts for data presentation.
- Sharp, minimalist icons for easy navigation.
- Subtle animations for data updates and interactions.
- Dark royal blue theme with neon-accented futuristic UI.
- Animated galaxy star background with rocket visuals.
- Responsive layout, PWA-ready (installable on mobile).