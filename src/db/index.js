import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

 
const connectDB = async ()=> {
    try {
        //  Note:- is used to access the host information of 
        //  MongoDB server to which the application has successfully 
        // connected. 
      
       const connectingDB = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}?retryWrites=true&w=majority`)
          console.log(`\n MongoDB connected !! DB HOST: ${connectingDB.connection.host}`);
        //   console.log(`Connecting to: ${process.env.MONGODB_URL}/${DB_NAME}`);
         console.log("Connected Successfully !!");
    } catch (error) {
        console.log("MongoDB connection Failed", error);
        // current appn is running on some process so written below it is its reference
        process.exit(1)
    }
}



export default connectDB