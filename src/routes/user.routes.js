import { Router } from "express";
import { registerUser, loginUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { logoutUser } from "../controllers/user.controller.js";
import {refreshAccessToken} from "../controllers/user.controller.js"
const router = Router();
//bohot filed chahiye  issilye array of objects hoga//bohot filed chahiye  issilye array of objects hoga
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
           name:"coverImage",
           maxCount:1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;


