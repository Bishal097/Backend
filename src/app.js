import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app=express();

app.use(cors({     // object use karta hai
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json({limit: "10kb"})) // ek limit laga diye itna hi aayega kyuki dat bohot jaga seh aata hai aur agar sirf json leh toh server toh gya toh usko rokne k liye use karte hain
app.use(express.urlencoded({extended:true, limit: "10kb"})) // extended matlab object k andar object
//express.urlencoded: Yeh middleware function hai jo incoming requests ko parse (decode) karta hai jo URL-encoded data mein hote hain.
//extended: true: Yeh option allow karta hai ki complex objects bhi parse ho sakein.
//limit: "10kb": Yeh limit set karta hai ki maximum 10 kilobytes data hi parse hoga.
app.use(express.static("public")) // images ya pdf koi chiz aata hai toh public meh store hoga
app.use(cookieParser()) //cookie peh CRUD operation hota hai


// 