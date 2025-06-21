import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express();


// doing some configuration before accepting any data into our DB :----

//  defining specific origins which we are allowing to get access to our db
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
// im accepting json format in my database

app.use(express.json({limit: "20kb"}))

// urlencoded: to insert some special charaters within url like: %20 inplace of space in url
app.use(express.urlencoded({extended: true , limit: "20kb"})) // by using extended we can give obj within the objects like nested objects

// to store file folder in our DB as public assets so anyone can access it
app.use(express.static("public")) // public is folder name

// cookieParser:  to access user's web browser cookies from my server and to set cookies of user
//  to put secure cookies in user browser only control by server 
app.use(cookieParser())
export { app }