import mongoose, { isValidObjectId, mongo } from "mongoose"
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
            status(201).
            json(   // "isLiked" is a derived value sent to help the frontend update UI state  of like thumb to be filled or make it empty.

                new ApiResponse(201, { isLiked: true }, "video liked Successfully...")
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
        throw new ApiError(400, "invalid comment ID")
    }

    const existingCommentLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
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
            likedBy: req.user?._id
        })

        return res.
            status(201).
            json(
                new ApiResponse(201, { isLiked: true }, "comment liked Successfully...")
            )

    }


})



// ************************************************************



const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet Id");
    }

    const existingTweetLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if (existingTweetLike) {
        await Like.findByIdAndDelete(existingTweetLike._id)

        return res.
            status(200).
            json(
                new ApiResponse(200, { isLiked: false }, "tweet unliked Successfully...")
            )
    }
    else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id

        })

        return res.
            status(201).
            json(
                new ApiResponse(201, { isLiked: true }, "tweet liked Successfully...")
            )
    }
})


// ************************************************************



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // here we use mongoose and its pipeline concept to match the ._id and lookup the liked videos and count it
    // first I need to find all Like documents where likedBy = req.user._id
    //  Then have to fetch the actual Video documents for those likes
    /* 
      Start from Like, not User
      $match → likedBy user
      $lookup → videos
      $unwind / $first
      (Optional) $lookup → owner
      $project → clean response
    */

    // as video and likes are related to like collection so we start from there

    // Start from Like, not User
    const likedVideos = await Like.aggregate([

        {
            // $match → likedBy  logged in user
            $match: {
                likedBy: new mongoose.Types.ObjectId(String(req.user?._id))
            }
        },

        // $lookup → videos (joins)  -> objectId will get replaced by video document here
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                // looking for video owner so using sub pipeline
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",

                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },


                      // Note:- 
        /* 
             we used addfields above for making easier for frontend mainly
            for ex:- 
            before flattening the owner and video array our output may be look like this :-
            

            after first lookup:-  oining videos document with like document
                   
                {
                 _id: "likeId",
                      // video is an array not object :- point to be noted
                     video: [
                        {
                          _id: "videoId",
                          title: "Mongo Aggregation",
                           owner:; objectId("userId")
                        }
                      ]
                    }
 
             in video lookup we wrote sub pipeline  then output will looks like this 
             of Video document :-
              
              owner is also an array here : because lookup return array 
              
             {
                _id: "videoId",
                title: "Mongo Aggregation",
               owner: [
               {
               _id: "userId",
               username: "hitesh",
               avatar: "avatar.png"
                }
              ]
            }

            
        */

        //   / flattening owner array 
        // means From the owner array, take the first element and replace the array with that object
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },

        /* after flattening above :- 
          From the owner array, take the first element and replace the array with that object
          So that becomes:-

           owner: {
              uusername: "xyz",
              avatar: "avatar.png,
           }
            
           ####### so in frontend we can directly write owner.username instead of owner[0].username

           similar we did for video


        */
        

        //   flattening video array
        // means : convert the single element video array into single object

        {
            $addFields: {
                video: { $first: "$video" }
            }
        },

        /*
         after the outer lookup our video structure looks like this:-
           {
             video:: [
              {
               title: "Mongo Aggregation",
               owner: {username: "xyz"} 
              } 
             ]
           }

           ---->>> but frontend expects an object not array 
           like this :- 
           
           video: {
               title: "Mongo Aggregation",
               owner: {username: "xyz"} 
            } 

           so we flatten the video array --> which convert the single element video array into single object
         
        
        */ 

        // for frontend display we can use this :- 

        // {
        //     $project: {
        //         _id: 0,
        //         likedAt: "$createdAt",
        //         video: {
        //             _id: 1,
        //             title: 1,
        //             thumbnail: 1,
        //             views: 1,
        //             owner: 1
        //         }
        //     }
        // }


    ])
    return res.
        status(200).
        json(new ApiResponse(
            200,
            likedVideos,
            "Liked videos fetched successfully"
        )
        )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}