import express from "express";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";


configDotenv({path:"./.env"});
const app = express();

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(cookieParser());


app.listen(process.env.PORT || 8080, () => {
    console.log(`App is runing on port ${process.env.PORT || 8080}`)
});