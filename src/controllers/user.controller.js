import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";

// asyncHandler is an high order function so we can pass function in it as an parameter
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //         message: "Server handshaked successfully!!"   // inplace of this we now make a registration of actual user
    //     })

    // Step 1:- take values of user from body of req i.e taking user details from frontend or postman

    console.log("REQ.FILES:", JSON.stringify(req.files, null, 2)); 
    console.log("REQ.BODY:", req.body);
    const { fullName, email, username, password } = req.body;
    // console.log("email: ", email);

    // step 2:- validate input (all inputs are required so will make sure nothing left empty)
   
    if ([fullName, username, email, password].some((field) =>
        field?.trim() === "")) {
        //     // as in apiError we need statuCode and message so we pass here
        throw new ApiError(400, "All fields  are required")

    }

    //step 3:- checking if already exist or not:username ,email
    const exisitedUser = await User.findOne({ // if get any existed email or username and check if either of it already exists of not
        $or: [{ username }, { email }]      // using or operator to check either of its already exist or not in Db
    })


    if (exisitedUser) {
        throw new ApiError(409, "User already exists");
    }
    //  console.log(req.files);

    // Step 4: check for images and check for avatar
    //                                                    
    const avatarLocalPath = req.files?.avatar[0]?.path; 
    console.log("avatarLocalPath raw ->", avatarLocalPath);                                         
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;                                                                                   
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // path on local server looks like this: uploads/avatar-1696021234567.png
    
       if (!avatarLocalPath) {
        //     //  console.log("req.files structure : " ,req.files);
        throw new ApiError(400, "avatar file is required");
    }

    //     // step 5: if local paths avail , upload them to cloudinary
    // resolving absolute paths

    const avatarAbs = path.resolve(avatarLocalPath);
    const coverAbs = coverImageLocalPath ? path.resolve(coverImageLocalPath) : null;
    
    // the local URL that we can serve via express.static
    const localAvatarUrl = `/public/temp/${encodeURIComponent(path.basename(avatarAbs))}`;
  const localCoverUrl = coverAbs ? `/public/temp/${encodeURIComponent(path.basename(coverAbs))}` : "";



    let avatarUrlSync = ""; // final avatar URL (cloud or local)
  try {
    const avatarResp = await uploadOnCloudinary(avatarAbs);
    console.log("avatarResp ->", avatarResp);
    if (avatarResp && (avatarResp.secure_url || avatarResp.url)) {
      avatarUrlSync = avatarResp.secure_url || avatarResp.url;

    } else {
      // cloud responded but no url — fallback to local
      avatarUrlSync = localAvatarUrl;
    }
  } catch (err) {
    console.error("Cloudinary avatar upload error:", err && err.message);
    // fallback to local
    avatarUrlSync = localAvatarUrl;
  }



    // if cover exists, upload cover (defensive)
    let coverUrl = "";
  if (coverAbs) {
    try {
      const coverResp = await uploadOnCloudinary(coverAbs);
      console.log("coverResp ->", coverResp);
      if (coverResp && (coverResp.secure_url || coverResp.url)) {
        coverUrl = coverResp.secure_url || coverResp.url;
        safeUnlink(coverAbs);
      } else {
        coverUrl = localCoverUrl;
      }
    } catch (err) {
      console.error("Cloudinary cover upload error:", err && err.message);
      coverUrl = localCoverUrl;
    }
  }


         // from utils after uploading to cloudinary ,we check if it is uploaded successfully the avatar or not
    if (!avatarUrlSync) {
        throw new ApiError(400, "wohhohohoh avatar file is required");
    }
    const filename = path.basename(avatarAbs);
    const avatarUrl = `/public/temp/${encodeURIComponent(filename)}`;

        // Step 6: create user object -: create entry in db (as in mongodb :data creates in form of object ) and do db calls
    const user = await User.create({
        fullName: fullName.trim(),
        avatar: avatarUrl,
        coverImage: coverUrl,
        email,
        password,
        username: username.toLowerCase(),

    })

    //         // step 7: remove the password and refresh token field from response before giving to user 
    const createdUser = await User.findById(user._id).select(  
        "-password -refreshToken"                  //      fields with "-" sign which we want to remove
    )

    //         // step 8: check for user creation or got null 
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    //     // step 9: return response (res)

    return res.status(201).json(  // sending success status code for postman as it keeps response at different place 
        new ApiResponse(201, createdUser, "User Registered Successfully")
    )
})

export {
    registerUser,
}
// so when this method would run ,is only decided by routes so we make route for it