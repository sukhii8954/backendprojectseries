// require('dotenv').config()
import dotenv from "dotenv"
import connectDB from "./src/db/index.js";
import express from "express"



dotenv.config();



const app = express()



//   //  ******** First approach **********
// using IIFE(Immediately Invoked Function Expression)


app.get('/', (req, res)=> {  // route on which we did get request and got response 
  res.send("hello im listening")
})

app.get('youtube', (req , res)=>{
    res.send("this is my youtube channel")
})
 app.listen(process.env.PORT, ()=> {  // listening at port
    console.log(`app is listening on port ${process.env.PORT}`);
 })



