// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js"
// import { User } from "../models/user.model.js"
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import path from "path";
// import crypto from "crypto";



// const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// const generateAccessAndRefreshTokens = async (userId) => {
//   try {
//     const user = await User.findById(userId)
//     const accessToken = user.generateAccessToken()
//     const refreshToken = user.generateRefreshToken()

//     // sending refresh token in database without validating any field here 

//     user.refreshToken = hashToken(refreshToken);
//     console.log("refeshtoken after getting hashed", user.refreshToken)
//     await user.save({ validateBeforeSave: false })

//     return { accessToken, refreshToken }

//   } catch (error) {
//     throw new ApiError(500, "something went wrong while generating refresh and access token")
//   }
// }
// // asyncHandler is an high order function so we can pass function in it as an parameter
// const registerUser = asyncHandler(async (req, res) => {
//   // res.status(200).json({
//   //         message: "Server handshaked successfully!!"   // inplace of this we now make a registration of actual user
//   //     })

//   // Step 1:- take values of user from body of req i.e taking user details from frontend or postman

//   // console.log("REQ.FILES:", JSON.stringify(req.files, null, 2)); 
//   // console.log("REQ.BODY:", req.body);
//   const { fullName, email, username, password } = req.body;
//   // console.log("email: ", email);

//   // step 2:- validate input (all inputs are required so will make sure nothing left empty)

//   if ([fullName, username, email, password].some((field) =>
//     field?.trim() === "")) {
//     //     // as in apiError we need statuCode and message so we pass here
//     throw new ApiError(400, "All fields  are required")

//   }

//   //step 3:- checking if already exist or not:username ,email
//   const exisitedUser = await User.findOne({ // if get any existed email or username and check if either of it already exists of not
//     $or: [{ username }, { email }]      // using or operator to check either of its already exist or not in Db
//   })


//   if (exisitedUser) {
//     throw new ApiError(409, "User already exists");
//   }
//   //  console.log(req.files);

//   // Step 4: check for images and check for avatar
//   //                                                    
//   const avatarLocalPath = req.files?.avatar[0]?.path;
//   // console.log("avatarLocalPath raw ->", avatarLocalPath);                                         
//   // const coverImageLocalPath = req.files?.coverImage[0]?.path; 

//   let coverImageLocalPath;
//   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
//     coverImageLocalPath = req.files.coverImage[0].path
//   }

//   // path on local server looks like this: uploads/avatar-1696021234567.png

//   if (!avatarLocalPath) {
//     //     //  console.log("req.files structure : " ,req.files);
//     throw new ApiError(400, "avatar file is required");
//   }

//   //     // step 5: if local paths avail , upload them to cloudinary
//   // resolving absolute paths

//   const avatarAbs = path.resolve(avatarLocalPath);
//   const coverAbs = coverImageLocalPath ? path.resolve(coverImageLocalPath) : null;

//   // the local URL that we can serve via express.static
//   const localAvatarUrl = `/public/temp/${encodeURIComponent(path.basename(avatarAbs))}`;
//   const localCoverUrl = coverAbs ? `/public/temp/${encodeURIComponent(path.basename(coverAbs))}` : "";



//   let avatarUrlSync = ""; // final avatar URL (cloud or local)
//   try {
//     const avatarResp = await uploadOnCloudinary(avatarAbs);
//     // console.log("avatarResp ->", avatarResp);
//     if (avatarResp && (avatarResp.secure_url || avatarResp.url)) {
//       avatarUrlSync = avatarResp.secure_url || avatarResp.url;

//     } else {
//       // cloud responded but no url — fallback to local
//       avatarUrlSync = localAvatarUrl;
//     }
//   } catch (err) {
//     console.error("Cloudinary avatar upload error:", err && err.message);
//     // fallback to local
//     avatarUrlSync = localAvatarUrl;
//   }



//   // if cover exists, upload cover (defensive)
//   let coverUrl = "";
//   if (coverAbs) {
//     try {
//       const coverResp = await uploadOnCloudinary(coverAbs);
//       //   console.log("coverResp ->", coverResp);
//       if (coverResp && (coverResp.secure_url || coverResp.url)) {
//         coverUrl = coverResp.secure_url || coverResp.url;
//         // safeUnlink(coverAbs);
//       } else {
//         coverUrl = localCoverUrl;
//       }
//     } catch (err) {
//       console.error("Cloudinary cover upload error:", err && err.message);
//       coverUrl = localCoverUrl;
//     }
//   }


//   // from utils after uploading to cloudinary ,we check if it is uploaded successfully the avatar or not
//   if (!avatarUrlSync) {
//     throw new ApiError(400, "wohhohohoh avatar file is required");
//   }
//   const filename = path.basename(avatarAbs);
//   const avatarUrl = `/public/temp/${encodeURIComponent(filename)}`;

//   // Step 6: create user object -: create entry in db (as in mongodb :data creates in form of object ) and do db calls
//   const user = await User.create({
//     fullName: fullName.trim(),
//     avatar: avatarUrl,
//     coverImage: coverUrl,
//     email,
//     password,
//     username: username.toLowerCase(),

//   })

//   //         // step 7: remove the password and refresh token field from response before giving to user 
//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken"                  //      fields with "-" sign which we want to remove
//   )

//   //         // step 8: check for user creation or got null 
//   if (!createdUser) {
//     throw new ApiError(500, "Something went wrong while registering the user");
//   }

//   //     // step 9: return response (res)

//   return res.status(201).json(  // sending success status code for postman as it keeps response at different place 
//     new ApiResponse(201, createdUser, "User Registered Successfully")
//   )
// })

//  Code 1: 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const generateAccessAndRefreshTokens = async (userId) => { 
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }


  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
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


  if (!avatarLocalPath){
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

  if (!password || (!email && !username)) {
    throw new ApiError(400, "Provide password and (email or username)");
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
          user: loggedInUser, accessToken  // sending again because when user wants to save token from there side 
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
    .clearCookie("accessToken", options)  // deletes the cookie from the user's browser.
    .clearCookie("refreshToken", options) // Also deletes only the cookie from the user's browser.
    .json(new ApiResponse(200, {}, "'user Logged out"))

})

export {
  registerUser,
  loginUser,
  logoutUser
}
// so when this method would run ,is only decided by routes so we make route for it