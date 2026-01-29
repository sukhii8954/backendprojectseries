import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate
    from "mongoose-aggregate-paginate-v2";


// defining structure of a comment document for DB
const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },

        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            // required: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",  // this tells objectId belongs to video model
            // required: true
        },


    },

    {
        timestamps: true,
    }
)

// for comments pagination adding extra plugin or methods to it
commentSchema.plugin(mongooseAggregatePaginate);

// connecting Schema to Mongo Database, creating a model using mongoose(the controller tool) and by exporting making it reusable everywhere

export const Comment = mongoose.model("Comment", commentSchema)