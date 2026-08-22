# Crypto Grid V12

- Entire UI is English.
- Fixed chart loading path: no blocking Binance exchangeInfo request before charts.
- Coin list uses CoinGecko with Binance 24h fallback.
- Each coin probes Binance directly and falls back to Bybit.
- First charts begin loading as soon as the coin list is ready.
- Chart instances persist across 15m / 1H / 4H switches.
- Candle data is cached per exchange/pair/timeframe.
- Dark theme, no chart grid lines, volume, 2-bar right offset, and hidden chart branding.
- Header only contains: Top 100, Favorites, Daily Watchlist, Weekly Watchlist, Long-Term Watchlist, 15m, 1H, 4H.
