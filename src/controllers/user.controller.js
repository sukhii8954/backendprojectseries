import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// asyncHandler is an high order function so we can pass function in it as an parameter
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //         message: "Server handshaked successfully!!"   // inplace of this we now make a registration of actual user
    //     })
        // Step 1:- take values of user from body of req i.e taking user details from frontend or postman
    //     console.log("REQ.FILES:", JSON.stringify(req.files, null, 2));
        console.log("REQ.BODY:", req.body);
    const { fullName,  email, username, password } = req.body;
    // console.log("email: ", email);
     
    // step 2:- validate input (all inputs are required so will make sure nothing left empty)
    // some function we using to get true or false in return for each field check
    //  We’re checking the request body. If any of the fields (fullName, username, email, password) are missing 
    // or just blank (even spaces only),
    // we throw an error that will stop registration and tell the client “this field is required!”.
    if ([fullName, username, email, password].some((field) =>
        field?.trim() === "")) {
    //     // as in apiError we need statuCode and message so we pass here
        throw new ApiError(400, "All fields  are required")

    }

    // Note:- 
    /* .some(callback)
       .some() is an array method.
       It checks each element in the array and runs the callback on it.
       If at least one element makes the callback return true, then .some() returns true.   */

       

    //step 3:- checking if already exist or not:username ,email
   const exisitedUser = await User.findOne({ // if get any existed email or username and check if either of it already exists of not
         $or: [{ username }, { email }]      // using or operator to check either of its already exist or not in Db
    })
    

    if(exisitedUser){
        throw new ApiError(409 ,"User already exists");
    }
    //  console.log(req.files);

    // Step 4: check for images and check for avatar
//                                                     // just like express provide req.body , multer provides access of files 
  const avatarLocalPath = req.files?.avatar[0]?.path; // if first prop exist in uploaded file then take the whole path of that file uploaded by multer
     console.log("avatarLocalPath raw ->", avatarLocalPath);                                          // first prop. of field we need have one obj with the help of which we get proper path
  const coverImageLocalPath = req.files?.coverImage[0]?.path;                                                 // req.files.avatar[0].path → the actual path where the file is saved on your server.
//                                     
                                                    // path on local server looks like this: uploads/avatar-1696021234567.png
     
    
//     let coverImageLocalPath;
//     if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
//         coverImageLocalPath = req.files.coverImage[0].path
//     }

    if(!avatarLocalPath){
//     //  console.log("req.files structure : " ,req.files);
     throw new ApiError(400 ,"avatar file is required");
    }
//     // step 5: if local paths avail , upload them to cloudinary
        
//     //   const normalizedPath = path.resolve(avatarLocalPath);

     const avatar =  await uploadOnCloudinary(avatarLocalPath);
     console.log(avatar);
     const coverImagesync = await uploadOnCloudinary(coverImageLocalPath);
      
     

//      // from utils after uploading to cloudinary ,we check if it is uploaded successfully the avatar or not
     if(!avatar){
           throw new ApiError(400,  "wohhohohoh avatar file is required");
     }
     
//     // Step 6: create user object -: create entry in db (as in mongodb :data creates in form of object ) and do db calls
       const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase(),

           })

//         // step 7: remove the password and refresh token field from response before giving to user 
        const createdUser = await User.findById(user._id).select(  // if user is created then only we use "select" method to add those 
                      "-password -refreshToken"                  //      fields with "-" sign which we want to remove
        ) 
        
//         // step 8: check for user creation or got null 
        if(!createdUser){
            throw new ApiError(500 , "Something went wrong while registering the user");
        }

//     // step 9: return response (res)

       return res.status(201).json(  // sending success status code for postman as it keeps response at different place 
        new ApiResponse(200 , createdUser , "User Registered Successfully")
       )
})

export { 
    registerUser,
 }
// so when this method would run ,is only decided by routes so we make route for it