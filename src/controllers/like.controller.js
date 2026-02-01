import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"



// algorithm to implment:-
// 1. Validate incoming ID
// 2. Check: does a like already exist?
// 3. IF exists → delete it (unlike)
// 4. ELSE → create it (like)
// 5. Return success response

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    //  1. Validate incoming ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check: does a like already exist?
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    // IF exists → delete it (unlike)

    if (existingLike) {
        //  Like.findByIdAndDelete : used to unlike the video
        await Like.findByIdAndDelete(existingLike._id)

        return res.
            status(200).
            json(
                new ApiResponse(200, { isLiked: false }, "video unliked Successfully...")
            )
    }

    else {
        //    :- use to like a particular video 
        // if like does not exist -> like it
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })

        return res.
            status(200).
            json(   // "isLiked" is a derived value sent to help the frontend update UI state  of like thumb to be filled or make it empty.

                new ApiResponse(200, { isLiked: true }, "video liked Successfully...")
            )
    }

    // Note:-
    //  isliked is just a normal flag variable in JS im using here to toggle the like and its value store
    // in data field in apiresponse which we return to frontend

    /* req.params :- is used to identify which resource

  --> req.params from the URL path itself
      for ex:- router.post("/videos/:videoId/like", toggleVideoLike)

      Request URL looks like this with videoId :
         
       POST /videos/64fabc123/like
    */


    /* req.body :-   is used to send data to change that resource
    
      --> req.body is extra data sent with the request(usually JSON)
         It used when 
        * creating something 
        * updating content
        * sending form Data
    
    */

})

// ************************************************************



const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
        return new ApiError(400, "invalid comment ID")
    }

    const existingCommentLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (existingCommentLike) {
        await Like.findByIdAndDelete(existingCommentLike._id)

        return res.
            status(200).
            json(
                new ApiResponse(200, { isLiked: false }, "comment unliked Successfully...")
            )

    }

    else {

        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })

        return res.
            status(200).
            json(
                new ApiResponse(200, { isLiked: true }, "comment liked Successfully...")
            )

    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // here we use mongoose and its pipeline concept to match the ._id and lookup the liked videos and count it


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}