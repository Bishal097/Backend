import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
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

export default router;



