# Crypto Grid V16

Robust chart loading architecture:
- Cards render immediately without waiting for exchange metadata.
- Server proxy resolves Binance first and Bybit second for each symbol.
- 200 candles, volume, dark theme, no grid lines, 2-bar right offset.
- Chart instances persist across 15m / 1H / 4H; candle data is cached.
- Header contains Top 100, Favorites, Daily Watchlist, Weekly Watchlist, Long-Term Watchlist, timeframe buttons.
- Watchlist search is in the header and supports coins outside Top 100.
- Search closes when clicking elsewhere.
