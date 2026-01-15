import { Router } from "express";
import { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    currentUser, 
    updateAccountDetails,
    userAvatar,
    userCoverImage, 
    getUserChannelProfile,
    getUserWatchHistory} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router()

router.route("/register").post(
   upload.fields([   // using middleware in between before routing to registerUser and in between we upload 2 files 
      {
         name: "avatar",
         maxCount: 1
      },
      {
         name: "coverImage",
         maxCount: 1
      }
   ]),
   registerUser)  // using post method to add new user i.e to intract with resource
// before /register : /users which we used in app.js to use the route get prefix then our final url would get a route

router.route("/login").post
   (loginUser) // will make this login method

//secured routes
router.route("/logout").post(
   verifyJWT, logoutUser)


router.route("/refresh-token").post(
   refreshAccessToken
)

router.route("/change-password").post(verifyJWT , changeCurrentPassword)
router.route("/current-user").post(verifyJWT,currentUser)
router.route("/update-account").patch(verifyJWT , updateAccountDetails)
router.route("/avatar").patch(verifyJWT ,upload.single("avatar"), userAvatar)
router
.route("/cover-image")
.patch(
   verifyJWT,
   upload.single("coverImage"),
   userCoverImage)
   
// as we used
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)

/*   : tells Express → “this part is dynamic”
      username becomes the key
      Value comes from the URL
*/

router.route("/watchHistory").get(verifyJWT,getUserWatchHistory)




export default router


// we will import user controller and routes in app.js