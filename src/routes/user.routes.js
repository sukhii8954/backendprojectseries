import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
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
export default router


// we will import user controller and routes in app.js