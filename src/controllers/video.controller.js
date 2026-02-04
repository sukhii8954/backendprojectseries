import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { use } from "react"


const getAllVideos = asyncHandler(async (req, res) => {
    // this function Takes request filters → builds aggregation → returns paginated videos

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    // this req.query endpoint I used for listing videos not for creating/updating 
    //TODO: get all videos based on query, sort, pagination
    // example:-    /videos?page=2&limit=5&query=react&sortBy=views&sortType=desc

    /* that becoms rq.query = {
                             page: "2",
                             limit: "5",
                             query: "react",
                             sortBy: "views",
                             sortType: "desc"
    
                              userId → videos of a specific user
                               }

*/

    // $match → filters data


    /* $lookup → joins channel
       $addFields → flattens arrays
       $sort → ordering
       aggregatePaginate → page handling */





    // “Start with empty steps → add only what’s needed”
    // #########  using pipeline array ############

    const pipeline = [];

    pipeline.push({
        $match: {
            ispublished: true  // its existence known due to video.model.js
        }
    })



    // #########  search (title + discription)  ###########

    if (query) {
        pipeline.push({
            $match: {
                $or: [  // why $regex ? , because $regex allows pattern matching, not exact match.
                    { title: { $regex: query, $options: "i" } },

                    // options = "i" means case-  insensitive  
                    // without "i"  react != React 
                    // with "i" : react == React 

                    { discription: { $regex: query, $options: "i" } }
                ]
            }
        })
    }

    // Note:- 
    // Why not use regex earlier?

    /*   Use Regex earlier , Because:  Search is optional  -->  Running regex on every request is expensive 
          -->  So we only apply it if query exists.
    */

    //  ###### Filter by users/channel #######

    // "this means --> show me video of this specific channel(user)"

    if (userId && isValidObjectId(userId)) {
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(String(userId))  // converting it in objectId due to owner in video model is objectId type
            }
        })
    }

    // ##########   4)   join owner ( channel or user info) ###########
    pipeline.push({
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
    })


       // ###############  5)  flatten owner array ########
         
       pipeline.push({
         addFields:{
             $owner: { $first : "$owner"}
         }
       })
  


})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}