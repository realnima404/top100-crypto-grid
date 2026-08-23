import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const dir = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const cache = new Map();

async function json(url, ms=10000){
  const hit=cache.get(url);
  if(hit && hit.expires>Date.now()) return hit.data;
  const ctl=new AbortController();
  const timer=setTimeout(()=>ctl.abort(),ms);
  try{
    const r=await fetch(url,{signal:ctl.signal,headers:{"User-Agent":"CryptoGrid/16","Accept":"application/json"}});
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
const stable=new Set(["USDT","USDC","FDUSD","TUSD","USDE","DAI","USDS","USDD","PYUSD","USD1","USDP","GUSD","FRAX","LUSD","USTC","EURC","EURT","EURS","USDB","USDY","USDM","RLUSD"]);

app.get("/api/top",async(_,res)=>{
  try{
    try{
      const data=await json("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",10000);
      if(Array.isArray(data)&&data.length){
        const out=data.filter(c=>!stable.has(String(c.symbol).toUpperCase())&&!/stablecoin|tether|usd coin|dai/i.test(c.name||""))
          .map(c=>({id:c.id,name:c.name,symbol:String(c.symbol).toUpperCase(),rank:c.market_cap_rank}))
          .slice(0,100);
        if(out.length) return res.json(out);
      }
    }catch(e){}
    const data=await json("https://api.binance.com/api/v3/ticker/24hr",10000);
    const out=(data||[]).filter(x=>x.symbol?.endsWith("USDT"))
      .filter(x=>!stable.has(x.symbol.slice(0,-4)))
      .sort((a,b)=>Number(b.quoteVolume)-Number(a.quoteVolume))
      .slice(0,100).map((x,i)=>({id:x.symbol,name:x.symbol,symbol:x.symbol.slice(0,-4),rank:i+1}));
    if(!out.length) throw Error("No market list");
    res.json(out);
  }catch(e){res.status(502).json({error:"top unavailable",detail:String(e.message||e)})}
});

app.get("/api/candles",async(req,res)=>{
  const symbol=String(req.query.symbol||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  const interval=String(req.query.interval||"60");
  if(!symbol) return res.status(400).json({error:"missing symbol"});
  const binanceInterval=interval==="15"?"15m":interval==="240"?"4h":"1h";
  const bybitInterval=interval==="15"?"15":interval==="240"?"240":"60";
  const candidates=[
    {exchange:"Binance",pair:symbol+"USDT",url:`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${binanceInterval}&limit=200`},
    {exchange:"Bybit",pair:symbol+"USDT",url:`https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}USDT&interval=${bybitInterval}&limit=200`}
  ];
  let last;
  for(const c of candidates){
    try{
      const raw=await json(c.url,10000);
      const rows=c.exchange==="Bybit"?(raw?.result?.list||[]):raw;
      if(Array.isArray(rows)&&rows.length) return res.json({exchange:c.exchange,pair:c.pair,rows});
    }catch(e){last=e}
  }
  res.status(502).json({error:"candles unavailable",detail:String(last?.message||last||"No market")});
});

app.get("/api/search",async(req,res)=>{
  const q=String(req.query.q||"").trim();
  if(!q) return res.json([]);
  try{
    const data=await json("https://api.coingecko.com/api/v3/search?query="+encodeURIComponent(q),10000);
    res.json((data.coins||[]).filter(x=>!stable.has(String(x.symbol).toUpperCase())).slice(0,15)
      .map(x=>({id:x.id,name:x.name,symbol:String(x.symbol).toUpperCase(),rank:x.market_cap_rank||null})));
  }catch(e){res.status(502).json({error:"search unavailable"})}
});

app.use(express.static(path.join(dir,"public")));
app.get(/.*/,(_,res)=>res.sendFile(path.join(dir,"public","index.html")));
app.listen(PORT,()=>console.log(`Crypto Grid V16 running on ${PORT}`));
