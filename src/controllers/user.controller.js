//  Code 1: 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"



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
      $set: {
        refreshToken: undefined   // removing refreshToken from DB
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



    //  save refresh token in db
    //  send both tokens back in cookies and in json response



    //  comparing it with database by finding user in db
    //Is this the current refresh token I (the server) issued for this user?
    // (revocation / rotation check)
    if (holdingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired")
    }

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
    .json(200, req.user, "Current user fetched successfully")
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
        username: username,
        email: email,
        fullname: fullName
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
     $set:{
       avatar: avatar.url  // taking cloudinary url here not the full object
     }
   },
   {new: true}
  ).select("-password")
   
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
     $set:{
       coverImage: coverImage.url  // taking cloudinary url here not the full object
     }
   },
   {new: true}
  ).select("-password")
   
  return res
    .status(200)
    .json(
      new ApiResponse(200, userNewCoverImage, "coverImage updated Successfully")
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
  userCoverImage
}
// so when this method would run ,is only decided by routes so we make route for it