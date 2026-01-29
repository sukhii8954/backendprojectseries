import mongoose, { Schema } from "mongoose";



const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video", // this tells objectId belongs to video model
            // required: true
        },

        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment", // this tells objectId belongs to comment model
            // required: true
        },

        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet", // this tells objectId belongs to tweet model
            // required: true
        },

        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",  // this tells objectId belongs to likedBy model
            // required: true
        },


    },

    {
        timestamps: true,
    }
)


// connecting Schema to Mongo Database, creating a model using mongoose(the controller tool) 
// and by exporting making it reusable everywhere

export const Like = mongoose.model("Like", likeSchema)