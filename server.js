import express from "express";
import path from "path";
import {fileURLToPath} from "url";
const app=express(), dir=path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(dir,"public")));
app.get("*splat",(_,res)=>res.sendFile(path.join(dir,"public","index.html")));
app.listen(process.env.PORT||3000,()=>console.log("Crypto Grid running"));
