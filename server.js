import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app=express();
const dir=path.dirname(fileURLToPath(import.meta.url));
const PORT=process.env.PORT||3000;
const cache=new Map();

async function json(url, ms=12000){
  const hit=cache.get(url);
  if(hit && hit.expires>Date.now()) return hit.data;
  const ctl=new AbortController(), timer=setTimeout(()=>ctl.abort(),ms);
  try{
    const r=await fetch(url,{signal:ctl.signal,headers:{"User-Agent":"CryptoGrid/15"}});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const data=await r.json();
    cache.set(url,{data,expires:Date.now()+30000});
    return data;
  }finally{clearTimeout(timer)}
}
async function first(urls){
  let last;
  for(const u of urls){try{return await json(u)}catch(e){last=e}}
  throw last||new Error("upstream unavailable");
}

app.get("/api/top",async(_,res)=>{
  try{
    const data=await first([
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
      "https://api.binance.com/api/v3/ticker/24hr"
    ]);
    if(Array.isArray(data) && data[0]?.market_cap_rank){
      const stable=new Set(["USDT","USDC","FDUSD","TUSD","USDE","DAI","USDS","USDD","PYUSD","USD1","USDP","GUSD","FRAX","LUSD","USTC","EURC","EURT","EURS","USDB","USDY","USDM","RLUSD"]);
      return res.json(data.filter(c=>!stable.has(String(c.symbol).toUpperCase())&&!/stablecoin|tether|usd coin|dai/i.test(c.name||"")).map(c=>({id:c.id,name:c.name,symbol:String(c.symbol).toUpperCase(),rank:c.market_cap_rank})));
    }
    const stable=new Set(["USDT","USDC","FDUSD","TUSD","USDE","DAI","USDS","USDD","PYUSD","USD1","USDP","GUSD","FRAX","LUSD","USTC","EURC","EURT","EURS","USDB","USDY","USDM","RLUSD"]);
    res.json(data.filter(x=>x.symbol?.endsWith("USDT")).filter(x=>!stable.has(x.symbol.slice(0,-4))).sort((a,b)=>+b.quoteVolume-+a.quoteVolume).slice(0,100).map((x,i)=>({id:x.symbol,name:x.symbol,symbol:x.symbol.slice(0,-4),rank:i+1})));
  }catch(e){res.status(502).json({error:"top unavailable"})}
});

app.get("/api/markets",async(_,res)=>{
  try{
    const stable=new Set(["USDT","USDC","FDUSD","TUSD","USDE","DAI","USDS","USDD","PYUSD","USD1","USDP","GUSD","FRAX","LUSD","USTC","EURC","EURT","EURS","USDB","USDY","USDM","RLUSD"]);
    const map={};
    try{
      const a=await json("https://api.binance.com/api/v3/exchangeInfo",60000);
      for(const x of a.symbols||[]) if(x.status==="TRADING"&&x.quoteAsset==="USDT"&&!stable.has(x.baseAsset)) map[x.baseAsset]={exchange:"Binance",pair:x.symbol};
    }catch{}
    if(Object.keys(map).length<20){
      try{
        const a=await json("https://api.bybit.com/v5/market/instruments-info?category=spot&limit=1000",60000);
        for(const x of a.result?.list||[]) if(x.status==="Trading"&&x.quoteCoin==="USDT"&&!map[x.baseCoin]&&!stable.has(x.baseCoin)) map[x.baseCoin]={exchange:"Bybit",pair:x.symbol};
      }catch{}
    }
    res.json(map);
  }catch(e){res.status(502).json({error:"markets unavailable"})}
});

app.get("/api/candles",async(req,res)=>{
  const {exchange,pair,interval="60"}=req.query;
  try{
    let data;
    if(exchange==="Bybit") data=(await first([`https://api.bybit.com/v5/market/kline?category=spot&symbol=${encodeURIComponent(pair)}&interval=${encodeURIComponent(interval)}&limit=200`])).result?.list||[];
    else data=await first([`https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(pair)}&interval=${encodeURIComponent(interval==="60"?"1h":interval==="240"?"4h":"15m")}&limit=200`]);
    res.json(data);
  }catch(e){res.status(502).json({error:"candles unavailable"})}
});

app.get("/api/search",async(req,res)=>{
  try{
    const q=String(req.query.q||"").trim();
    if(!q) return res.json([]);
    const data=await json("https://api.coingecko.com/api/v3/search?query="+encodeURIComponent(q),12000);
    const stable=new Set(["USDT","USDC","FDUSD","TUSD","USDE","DAI","USDS","USDD","PYUSD","USD1","USDP","GUSD","FRAX","LUSD","USTC","EURC","EURT","EURS","USDB","USDY","USDM","RLUSD"]);
    res.json((data.coins||[]).filter(x=>!stable.has(String(x.symbol).toUpperCase())).slice(0,12).map(x=>({id:x.id,name:x.name,symbol:String(x.symbol).toUpperCase(),rank:x.market_cap_rank||null})));
  }catch(e){res.status(502).json({error:"search unavailable"})}
});

app.use(express.static(path.join(dir,"public")));
app.get("*splat",(_,res)=>res.sendFile(path.join(dir,"public","index.html")));
app.listen(PORT,()=>console.log(`Crypto Grid V15 running on ${PORT}`));
