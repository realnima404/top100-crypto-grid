# Top 100 Crypto Grid V7

## Fixes and improvements
- Fixes the first-load issue: visible charts start loading immediately without needing to switch tabs.
- Faster mobile behavior:
  - only a small number of visible charts are loaded immediately
  - lower initial request concurrency on phones
  - the remaining charts load while scrolling
  - reduced mobile card/UI cost
- Timeframes are direct buttons: 15m / 1H / 4H.
- Keeps V6 features: independent Favorites, unlimited custom watchlists, global coin search, chart cache, DOM cache, lazy loading, Binance→Bybit fallback, stablecoin filtering, volume, no grid lines and right-side candle spacing.

## Render deploy
Replace the project files in GitHub and commit to main. Render will auto-deploy.
