import mongoose, { Schema } from "mongoose";


const tweetSchema = new Schema(
    {
      content:{
        type: String,
        required: true
      },

        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",  // this tells objectId belongs to video model
           
        },
    },
    {timestamps: true}
)

export const Tweet = mongoose.model("Tweet", tweetSchema)