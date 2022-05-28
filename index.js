"use strict"
import express from "express"
import { config } from "dotenv"
import mongoose from "mongoose"
import router from "./routes/userRoute.js"
import cors from "cors"

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));



const app = express();
app.use(cors());
app.use(express.json())
mongoose.connect(process.env.DATABASE)
config();

app.use(router);



app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`)
})
