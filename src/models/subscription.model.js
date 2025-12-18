import mongoose, { Schema } from "mongoose"


const subscriptionSchema = new Schema({


    // when we ask to find how many channels a user has subscribed let say user->C 
    // then we select subscriber name C in this model then count the documents whch have C name user in it

    subscriber: {
        type: Schema.Types.ObjectId,  // one who is subscribing
        ref: "User"
    },

    // when we ask to find total subscribers who subs CAC then we select channel CAC in this model and 
    // then count documents which have these CAC channel in it

    channel: {
        type: Schema.Types.ObjectId,  // one to whom 'subscriber' is subscribing
        ref: "User"
    }
      
    // to count subs of a channel -> we select a document in which channel is X 
    // for ex- if multiple user subs CAC then we select all documents in which channel is CAC
},
    {
        timestamps: true,
    }

)

export const Subscription = mongoose.model("Subscription",
    subscriptionSchema)