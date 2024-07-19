// require beacuse utility require 
// kyu ki manlo jo functionality baar baar repeat hoga voh yha hota hai
// mongoose db seh connect karvata hai
//kyuki project load hone k baad .env file sab ko mil jaye issiliye ek experiment

//require('dotenv').config({path:'./env'}) 1st choice
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from './app.js'
//2nd

dotenv.config({
    path:'./.env'
})
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running in : ${process.env.PORT}`);
    })
})
.catch((error) =>
{
console.log("Mongo failed", error);
})













  


//FIRST METHOD TO CONNECT TO DATABASE
/*
import mongoose from "mongoose";
import {DB_NAME} from "./constants"; //The database name (DB_NAME) is required for the connection string because MongoDB allows a single server to host multiple databases. The database name specifies which particular database on the server you want to interact with. Without this, the connection would not know which database to target for operations such as reading and writing data.

import  express from "express"
const app =express()
(async() =>
{
try{
  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
  app.on("error", (error) => 
{
    console.log("Error",error);
    throw error
})
app.listen(process.env.PORT,() => {
    console.log(`app is listening on port ${process.env.PORT}`);
})
}
catch(error)
{
    console.log("Error",error)
    throw error
}
    
})()
*/
//IIFE APPROACH HAI PHATAFAT CONNECT KARWATA HAI
// MIDDLEWARE USE KARTE HAIN APP.USE() KARTE HAIN
//