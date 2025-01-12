// require('dotenv').config()
import dotenv from "dotenv"
import connectDB from "./db/index.js";


dotenv.config({
    path: './env'
})



connectDB()
























/*   //  ******** First approach **********
import express from "express"
const app = express()

// using IIFE(Immediately Invoked Function Expression)

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    app.on("error", (err)=> {
        console.log("not able to talk to DB", err);
        throw err;
    })


     app.listen(process.env.PORT , ()=> {
        console.log(`app is listening on port ${process.env.PORT}`);
     })

  } catch (error) {
    console.log("ERROR:", error);
    throw error;
  }
})();

*/