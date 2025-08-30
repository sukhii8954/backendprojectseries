import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // inject as a plug in 



const videoSchema = new Schema(

    {
        videoFie: {
            type: String, // cloudinary video URL
            required: true,
        },

        thumbnail: {
            type: String, // cloudinary image URL
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        duration: {
            type: Number, // we get duration from cloudnary 
            required: true,
        },

        views: {
            type: Number,
            default: 0, // default views count is 0
        },

        ispublished: {
            type: Boolean,
            default: true, // default is true, meaning the video is published
        },
        // every video has an owner 
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // reference to the User model
            required: true, // owner is required
        },


    },
    {
        timestamps: true, // to automatically manage createdAt and updatedAt fields
    }

)

videoSchema.plugin(mongooseAggregatePaginate); 

// add pagination plugin to video schema
// now we can write aggregate queries with pagination on this schema
// this plugin is there because you’ll likely show videos in pages (page 1, page 2, etc) with filters/sorting.

export const Video = mongoose.model("Video", videoSchema);

// note:-
// 1. videofile is the video file URL stored in cloudinary.
// 2. thumbnail is the thumbnail image URL stored in cloudinary.
// 3. title and description are required fields for the video.
// 4. duration is the length of the video in seconds.
// 5. views is the number of times the video has been viewed, defaulting to 0.
// 6. ispublished indicates whether the video is published or not, defaulting to true.