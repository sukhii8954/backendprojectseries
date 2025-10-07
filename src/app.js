import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
// importing routes here
import userRouter from './routes/user.routes.js'


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
//  basically: to perform CRUD operations of cookies of user in its web browser
app.use(cookieParser())




// routes declaration
// as we separated the things , routes written in different file and controllers in another 
// so we use middlewares to get the route
app.use("/api/v1/users", userRouter) // if we are making api then we define which api version it is in the url only

// after the above route , we need to write at which route we need to go
// http://localhost:8000/api/v1/users/register or login   ***:- will practice later in postman

export { app }