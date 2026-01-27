//  Code 1: 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { Aggregate } from "mongoose";
import mongoose from "mongoose";




const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    // adding value in object
    user.refreshToken = refreshToken   // saving refresh token in DB and only returning access token to user
    await user.save({ validateBeforeSave: false }) // without validation saving the user data 

    return { accessToken, refreshToken }


  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res


  const { fullName, email, username, password } = req.body
  //console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) =>
      field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //console.log(req.files);
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files?.coverImage[0]?.path
  }


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }


  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )

})

// step 1-> will bring data from req.body
// step 2-> validate the input field of username or email 
// step 3-> find user if have in database with email id or username
// step 4-> verify if password is correct or not 
// step 5-> if user able to login , mark failed login attempts to 0 (own adding features)
// step 6-> create tokens or send it if already getting created tokens and need to send to user using cookies
// step 7-> response if able to login and log the a successful login

const loginUser = asyncHandler(async (req, res) => {

  const { email, username, password } = req.body;

  if ((!email && !username)) {
    throw new ApiError(400, "username or email is required");
  }


  const alreadyExistUser = await User.findOne({ // if get any existed email or username and check if either of it already exists of not
    $or: [{ username }, { email }]      // using or operator to check either of its already exist or not in Db
  })

  // if(alreadyExistUser){
  //    throw new ApiError(400 , "User already exists");
  // }

  if (!alreadyExistUser) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await alreadyExistUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(alreadyExistUser._id);

  // Note:-
  // as previously we called the user as having empty refresh token and we called method just above 
  // so we calling database once again so that we send the just generated refresh token or we can update the object and send it in cookies

  // get logged in user to return (exclude secrets)

  const loggedInUser = await User.findById(alreadyExistUser._id).
    select("-password -refreshToken");

  // returns the full user document from the database. 
  // That document may include fields you never want to send to clients, especially sensitive ones


  //sending tokens in form of cookies of user ,desinging options for that

  const options = {
    httpOnly: true,   // making cookies secure so that it can only be modifible from server not from frontend 
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken,
          refreshToken  // sending again because when user wants to save token from there side 
        },
        "User logged in successfully"
      )
    )

})


const logoutUser = asyncHandler(async (req, res) => {
  //step 1 : find the user and we clear cookies when logging out
  //step 2 : also clearing the tokens 
  await User.findByIdAndUpdate(  // we using this method to finding the user as well updating right after it
    req.user._id,
    {
      // using monogoDB operator to update user feild when logging out user
      $unset: {
        refreshToken: 1   // this unsetting means this removes the field from document by passing flag as 1 in particular which we want to remove
      }
    },
    {
      new: true,    // the response we get will bring updated value
    }
  )

  const options = {
    httpOnly: true,   // making cookies secure so that it can only be modifible from server not from frontend 
    secure: true
  }

  // now clearing cookies when logging out the user

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "'user Logged out"))

})


const refreshAccessToken = asyncHandler(async (req, res) => {
  // first we access the refresh token from cookie or body if using mobile app
  //  getting refresh token
  const holdingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

  if (!holdingRefreshToken) {
    throw new ApiError(401, "token is unauthorized");
  }

  //  verfiy refresh token with jwt
  // Was this token tampered with?
  // Was this token truly created by the server that knows REFRESH_TOKEN_SECRET?
  // Is it expired?

  try {
    const decodedToken = jwt.verify(
      holdingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );



    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "no such user found");
    }

    //  comparing it with database by finding user in db
    //Is this the current refresh token I (the server) issued for this user?
    // (revocation / rotation check)

    if (holdingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired")
    }
    
    //  save refresh token in db
    //  send both tokens back in cookies and in json response
    //  generating new access token and refresh token 
    const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);


    const options = {
      httpOnly: true,   // making cookies secure so that it can only be modifible from server not from frontend 
      secure: true
    }

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            newAccessToken,
            newRefreshToken  // sending again because when user wants to save token from there side 
          },
          " Access token refreshed successfully"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }


})


const changeCurrentPassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(401, "both old and new password are required")
  }
  // if user is able to change password means he is already logged in so we take user from req
  const user = await User.findById(req?.user._id);  // got user

  if (!user) {
    throw new ApiError(404, "User not found");

  }
  //  will check password entered is correct or not will check with user.model isPasswordCorrect custom made method
  const isOldPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isOldPasswordValid) {
    throw new ApiError(400, "old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false }) // rest of the validation i dont want to run so keeping it false

  return res.
    status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));

})


const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      req.user,
      "Current user fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {

  // allowing username , email ,fullName only to update by user in this controller

  const { username, email, fullName } = req.body

  if (!fullName || !username || !email) {
    throw new ApiError(400, "all fields are required");

  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {  // mongoDB update operator :; it tells DB to go inside doc and set these specific fields to new value

        // FIELD_NAME : NEW_VALUE
         username,
         email,
         fullName

      }
    },
    {
      new: true
    }

  ).select("-password")


  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details updated Successfully"))

})


const userAvatar = asyncHandler(async (req, res) => {

  const avatarLocalPath = req.file?.path; // user want to change or update his avatar here 

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  // uploading new avatar to cloud and we get full object in return

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar")
  }

  const userNewAvatar = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
        // taking cloudinary url here not the full object
        // utility function to make

      }
    },
    { new: true }
  ).select("-password")

  //TODo: delete old avatar (old avatar was on cloudinary)

  return res
    .status(200)
    .json(new ApiResponse(200, userNewAvatar, "Avatar updated Successfully"))

})


const userCoverImage = asyncHandler(async (req, res) => {

  const coverImageLocalPath = req.file?.path; // user want to change or update his avatar here 

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  // uploading new avatar to cloud and we get full object in return

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading avatar")
  }

  const userNewCoverImage = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url  // taking cloudinary url here not the full object
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(
      new ApiResponse(200, userNewCoverImage, "coverImage updated Successfully")
    )

})


const getUserChannelProfile = asyncHandler(async (req, res) => {
  // we will get url of channel from params

  const { username } = req.params

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing of this channel");

  }

  // here we will write our aggregation pipelines to find channel information

  const channel = await User.aggregate([

    {
      $match: {
        username: username?.toLowerCase()
      }
    },

    // fixed the typo error here as MongoDB is case sensitive and throws 500 server error due to that
    // instead of localfield I need to write localField to fix that error
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"  // here this is become a new field 
      }
    },
    {
      $lookup: {
        // matching in db so name become in lowercase and plural
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"  // here this is become a new field 
      }
    },
    // adding 2 more fields to user details when displaying on frontend

    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },

        // here we add logic of to find if user who logged in is subscribed this channel or not
        // so we send true or false to the frontend :- isSubscribed is true or false 
        isSubscribed: {
          $cond: {
            // we check in subscribers document is user is there or not
            // $in is a syntax use to check one thing inside another by checking in array or object separated by comma 

            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // checking user with _id is "in" subscribers field or not
            then: true,
            else: false
          }
        }
      }
    },

    {
      // thhis $ project pipeline only pass or show in frontend those fields which we allow to do from the documents
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1

      }
    }
  ])
  console.log(channel);  // shows array as an output

  // checking if array  is having at most one object or not  : actual checking it is not having any object then return not exist
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
  }


  return res.
    status(200)
    .json(
      new ApiResponse(200, channel[0], "user channel fetched successfully")
    )

})


const getUserWatchHistory = asyncHandler(async (req, res) => {

  // writing another pipeline here for getting watch history of user by matching it with _id of user
  //mongoose won't work here , all data goes directly when using aggregation pipelines
  // so we need to create objectId manually using mongoose types here

  const user = await User.aggregate([
    {  // #1 got the user 
      $match: {            // Ts giving deprecated warning for ObjectId so using string to ignore that warning 
        _id: new mongoose.Types.ObjectId(String(req.user._id))
      }
    },
    {  // #2 lookup in watchhistory  
      $lookup: {
        // matching in db so name become in lowercase and plural -: Video --> videos
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        // nesting pipelines to find owners of users : sub pipelines
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {  // #3 only getting those fields of user which needed using project pipeline
                    $project: {
                          fullName: 1,   // getting user name and avatar to display in frontend
                          username: 1,
                          avatar: 1
                    }
                }
              ]
            }
          },
          {
              $addFields: {
                owner: {
                    $first: "$owner"  // sending first value as object to frontend with same name 
                }
              }
          }
        ]
      }
    }
  ])


    return res.status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully!!"
      )
    )
})




export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  currentUser,
  updateAccountDetails,
  userAvatar,
  userCoverImage,
  getUserChannelProfile,
  getUserWatchHistory
}


// so when this method would run ,is only decided by routes so we make route for it