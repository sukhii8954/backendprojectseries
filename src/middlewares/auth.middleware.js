import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, _ , next) => {

  // may be we not getting accesstoken from cookies may be the user sending a custom header 
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")  //“First try to get the token from cookies;
    //                                                                                   if not found, try to get it from the Authorization header.”
    //    console.log(token)                                                              if client is using mobile app or postman then token we take from header 

    if (!token) {
      throw new ApiError(401, "Unauthorized request")
    }
    // if we have then we verifying the token by decoding it using jwt secret
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // now we find the user from DB by matching the id by using decodedToken as it will have all details from user model

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) {
      // todo: discuss about frontend

      throw new ApiError(401, "Invalid access token");

    }
    // giving access of user to req object so next controller/middleware can use it
    req.user = user;
    next();

  } catch (error) {
      throw new ApiError(401 , error?.message || "invalid access token");
  }
})


// Note:verifyJWT checks:-

// Is token present? (yes)
// Is token valid and not expired? (verified)
// Attaches user info to req.user
// Proceeds to next() → your controller now knows who the user is!

