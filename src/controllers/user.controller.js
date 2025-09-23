import { asyncHandler } from "../utils/asyncHandler.js";

// asyncHandler is an high order function so we can pass function in it as an parameter

const registerUser = asyncHandler(async (req,res)=> {
    res.status(200).json({
        message: "Server handshaked successfully!!"   // inplace of this we now make a registration of actual user
    })
})


export {registerUser}
// so when this method would run ,is only decided by routes so we make route for it