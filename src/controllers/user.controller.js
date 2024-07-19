
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
 //get user details from fronend or postman
 //validation
 //check if user already exists : username or email
 //check required details like images and avatars
 //upload them to cloudinary
 //create user object - create entry in db kyuki mongo dn objects leta hai
 //removve password and refresh token from response
 //check for user creation
 //return response
//req.body meh sara data aata hai
 const {fullName, email, username, password} =req.body
 console.log("email:", email);

if(
  [fullName, email, username, password].some(() => field?.trim() === "")  
)
{
  throw new ApiError(400, "All fields are required")
}

const existedUser=User.findOne({
  $or:[{username},{email}] // $ sign seh koi bhi operator use ho skta hai doh objects check ho rha hai if they exist or not
})

if(existedUser)
{
  throw new ApiError(409,"User Exists")
}


const avatarLocalPath=req.files?.avatar[0]?.path 
//yha agar files meh jab multer upload karta hai then voh toh local meh rhega then uska path from temp/ public seh aayega


const coverImageLocalPath=req.files?.coverImage[0]?.path
// cover image k liye

if (!avatarLocalPath) {
  throw new ApiError(400,"Avatar is required")
}

if(!coverImageLocalPath)
{
  throw new ApiError(400,"CoverImage is required")
}
const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath)

// yha global meh declare kiya 

if(!avatar)
{
  throw new ApiError(400,"Avatar is required")
}

if(!coverImage)
  {
    throw new ApiError(400,"CoverImage is required")
  }


const user =await User.create({
  fullName,
  avatar:avatar.url,
  coverImage:coverImage.url,
  email,
  password,
  username:username.toLowerCase(),

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





});

export { registerUser };
// field kyuki user route meh object except karta hai