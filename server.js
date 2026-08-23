import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/cmc", async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ error: "Missing CoinMarketCap API key" });
  try {
    const r = await fetch("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=100&convert=USD", {
      headers: { "X-CMC_PRO_API_KEY": key, "Accept": "application/json" }
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("*splat", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on ${port}`));
