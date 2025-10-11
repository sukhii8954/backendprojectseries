// require('dotenv').config()
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: './.env'
});



connectDB()
.then(()=>{
   
    app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error;
    })

    app.listen(process.env.PORT || 8000 , ()=> {
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connection faile !!", err);
})
// const app = express()

//   //  ******** First approach **********
// using IIFE(Immediately Invoked Function Expression)

// app.get('/', (req, res)=> {  // route on which we did get request and got response
//   res.send("hello im listening")
// })

// app.get('/youtube', (req , res)=>{
//     res.send("this is my youtube channel")
// })
//  app.listen(process.env.PORT, ()=> {  // listening at port
//     console.log(`app is listening on port ${process.env.PORT}`);
//  })
