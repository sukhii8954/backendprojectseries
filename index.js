// require('dotenv').config()
import dotenv from "dotenv"
import connectDB from "./src/db/index.js";
import express from "express"


dotenv.config();



const port = process.env.PORT || 8000;


//   //  ******** First approach **********
const app = express()



// using IIFE(Immediately Invoked Function Expression)

(async () => {
  try {
      await connectDB();
        // await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        // app.on("error", (err)=> {
        //       console.log("not able to talk to DB", err);
        //       throw err;
        //   })
      app.get('/', (req, res)=> {  // route on which we did get request and got response 
        res.send("hello im listening")
      })
      
       app.listen(port, ()=> {  // listening at port
          console.log(`app is listening on port ${port}`);
       })
     
 

  } catch (error) {
    console.log("ERROR:", error);
    throw error;
  }
})();

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send("Something went wrong!");
});

