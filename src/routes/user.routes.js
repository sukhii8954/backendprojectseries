import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)  // using post method to add new user i.e to intract with resource
// before /register : /users which we used in app.js to use the route get prefix then our final url would get a route

// router.route("login").post(login) // will make this login method 
export default router

// we will import user controller and routes in app.js