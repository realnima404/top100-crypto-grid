# Top 100 Crypto Grid V7

## New in V6
- Independent Favorites tab
- Custom watchlists
- Search across CoinGecko's full coin universe, not only Top 100
- Add search results directly to any watchlist
- In-memory chart data cache
- DOM/chart view cache: switching Top 100 / Favorites / Watchlists does not rebuild already loaded charts
- Lazy loading: charts load only when they approach the viewport
- Timeframes: 15m, 1H, 4H
- 200 candles loaded, ~45 visible initially
- Binance USDT preferred, Bybit USDT fallback
- Stablecoins excluded from Top 100
- Volume displayed
- No chart background guide lines
- Two-candle right-side padding
- Browser-persistent favorites and watchlists

## Deploy
Node / main / root directory blank / build `npm install` / start `npm start`

- Watchlists are independent top-level tabs beside Favorites.
- Watchlist tabs render their own chart grids.
- Watchlist management is in a separate plus button.
- Chart attribution/branding is hidden.
