import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
const app=express(),__dirname=path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname,'public')));
app.get('/api/cmc',async(req,res)=>{try{const key=req.query.key;if(!key)return res.status(400).json({error:'Missing CoinMarketCap API key'});const r=await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=100&convert=USD',{headers:{'X-CMC_PRO_API_KEY':key,Accept:'application/json'}});const j=await r.json();res.status(r.status).json(j)}catch(e){res.status(500).json({error:e.message})}});
app.get('*splat',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(process.env.PORT||3000,()=>console.log('http://localhost:3000'));
