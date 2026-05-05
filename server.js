const express=require("express");
const dotenv=require("dotenv");
const connectDatabase=require("./helpers/database/connectDatabase");
const routers = require("./routers"); //index.js ana dosya oldugu icin belirtilmese de olur
const path=require("path");

dotenv.config({
    path:"./config/env/config.env"
});

connectDatabase();

const app=express();
//express - body middleware
app.use(express.json());

const PORT=process.env.PORT;
app.use("/api",routers);

app.get("/", (req,res) => {
    res.send("Hello Question Answer API -updated");
});

app.listen(PORT,()=>{
     console.log(`app started on ${PORT} and ${process.env.NODE_ENV}`);
})
