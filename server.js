import express from "express";
import path from "path";
import {fileURLToPath} from "url";
const app=express(), dir=path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(dir,"public")));
app.get("/api/cmc",async(req,res)=>{
  const k=req.query.key;if(!k)return res.status(400).json({error:"Missing API key"});
  try{const r=await fetch("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=100&convert=USD",{headers:{"X-CMC_PRO_API_KEY":k,"Accept":"application/json"}});res.status(r.status).json(await r.json())}
  catch(e){res.status(500).json({error:e.message})}
});
app.get("*splat",(_,res)=>res.sendFile(path.join(dir,"public","index.html")));
app.listen(process.env.PORT||3000,()=>console.log("Crypto Grid running"));
