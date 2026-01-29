import mongoose, { Schema } from "mongoose";



const playlistSchema = new Schema(

    {


        name:{
            type: String,
            required: true,

        },

        description:{
            type: String,
            required: true,
        },

        video: [
           {
            type: Schema.Types.ObjectId,
            ref: "Video", // this tells objectId belongs to video model
        
           }
       ],

        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",  // this tells objectId belongs to video model
           
        },


    },
    

    { timestamps: true }
)


export const Playlist = mongoose.model("Playlist", playlistSchema)