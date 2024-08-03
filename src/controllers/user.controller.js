
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) =>
{
  try{
   const user=await User.findOne(userId)
   const accessToken = user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()
   User.refreshToken=refreshToken
   await user.save({validateBeforeSave: false})
   return {accessToken, refreshToken}
  }
  catch(error)
  {
    throw new ApiError(500,"Something went wrong while generating the tokens")
  }
}

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
  [fullName, email, username, password].some( field => field?.trim() === "")  
)
{
  throw new ApiError(400, "All fields are required")
}

const existedUser= await User.findOne({
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

const loginUser=asyncHandler(async(req, res) => {
  //req body->data
  //username or email check if user exits
  //find the user
  //password check
  //access and refresh token
  //send cookie

  const {email, password, username} =req.body
  if(!username && !email)
  {
    throw new ApiError(400, "Provide any email or username")
  }

  const user=await User.findOne({
    $or:[{username},{email}] 
  })

  if(!user)
  {
    throw new ApiError(404,"User doesn't exists")
  }
  const isPasswordValid= await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401,"Password Incorrect")
  }

  const {refreshToken, accessToken}= await generateAccessAndRefreshTokens(user._id)
   const loggedInUser= await User.findById(user._id).select("-password, -refreshToken") // select token is used to remove what is not necessary
 // yhahai cookie ko sirf server hi change kar paye issiliye nhi toh frontend shi bhi ho skta hai but nhi karna
   const options = {
    httpOnly:true,
    secure:true,
   }

   return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(200, 
      {
        user:loggedInUser,accessToken, refreshToken
      },
      "User Logged in Succesfully"
    )
   )
})


const logoutUser= asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
        $unset: {
            refreshToken: 1 // this removes the field from document
        }
    },
    {
        new: true
    }
)
// unset is a mongodb operator 
const options = {
    httpOnly: true,
    secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or used")
          
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
          new ApiResponse(
              200, 
              {accessToken, refreshToken: newRefreshToken},
              "Access token refreshed"
          )
      )
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }


})



const changeCurrentPassword =asyncHandler( async (req, res) => {
  const {oldPassword, newPassword} =req.body
  const user =await User.findById(req.user?.id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect)
  {
    throw new ApiError(400, "Invalid Old Password")
  }
  user.password=newPassword
  await user.save({validateBeforeSave: false})
  return res.status(200)
  .json(new ApiResponse(200, {}, "password is changed"))
  
})


const getCurrentUser =asyncHandler(async(req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User fetched succesfully"))
})


const updateAccountDetails = asyncHandler(async(req, res) => {
  const {fullName, email} = req.body

  if (!fullName || !email) {
      throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set: {
              fullName,
              email: email
          }
      },
      {new: true}
      
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
  }

  //TODO: delete old image - assignment


  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }

  const userd = await User.findById(req.user?._id);
  const currentAvatarUrl = user?.avatar;

  if (currentAvatarUrl) {
    const publicId = extractPublicId(currentAvatarUrl);
    try {
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error("Error deleting previous avatar:", error);
      throw new ApiError(500, "Error deleting previous avatar");
    }
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              avatar: avatar.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Avatar image updated successfully")
  )
})


const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file is missing")
  }

  //TODO: delete old image - assignment
    const userd= await User.findById(req.user?._id)

    const currentCoverImage =user?.avatar;
    if(!currentCoverImage)
    {
      throw new ApiError(400, "User has not uploaded any cover image")
    }

    const pid = extractPublicId(currentCoverImage)
    try{
     await deleteFromCloudinary(pid)
    }
    catch(error)
    {
      throw new ApiError(500, "Error deleting previous avatar");
    }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
      throw new ApiError(400, "Error while uploading on avatar")     
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              coverImage: coverImage.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Cover image updated successfully")
  )
})


const getUserChannelProfile = asyncHandler(async(req, res) => {
  const{username} =req.params
  if(!username?.trim())
  {
    throw new ApiError(400, "USERNAME IS MISSING");
  }
  
  const channel =await User.aggregate([

    {
      $match: {
          username:username?.toLowerCase()
     }
    },
    {
       $lookup:{           //look up join karne k liye help karta hai
        from: "Subscription", // from matlab konse table eh dekhu
        localField:"-id", //kis k base meh join karna  hai
        foreignField:"channel",// 2nd table meh konsa join karna hai
        as:"subscribers" // name hai bss
       }
    },
    //Purpose: This stage performs a join operation with the subscriptions collection to find all subscription documents where this user is listed as a channel.
//localField: _id (User ID in the User collection)
//foreignField: channel (Channel ID in the subscriptions collection)
//as: subscribers (The result of the join will be stored in this field)
    {
       $lookup:{
        from: "Subscription",
        localField:"-id",
        foreignField:"subscriber",
        as:"subscribedTo"
       }
    },
    //Purpose: This stage performs another join operation with the subscriptions collection to find all subscription documents where this user is listed as a subscriber.
//localField: _id (User ID in the User collection)
//foreignField: subscriber (Subscriber ID in the subscriptions collection)
//as: subscribedTo (The result of the join will be stored in this field)
    //
    {
      $addFields:{
        subscribersCount:{
           $size:"$subscribers"
        },
       channelsSubscribedToCount:{
         $size:"subscribedTo"
       },
       isSubscribed:{
        $cond: {
           if: {$in: [req.user?._id, "$subscribers.subscriber"]},
           then: true,
           else: false
          }},
      },
    },
    {
      $project:{
        fullName:1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])

 if(!channel.length)
 {
  throw new ApiError(404,"Channel Doesnot Exist")
 }
 return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async(req,res) =>{
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup: {
              from:"users",
              localfield:"owner",
              foreignField:"-id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName: 1,
                    username: 1,
                    avatar: 1

                  }
                }
              ]

            }
          }
        ]

      }
    },
    //
    {
      $addFields:{
        owner:{
          $first:"$owner"
        }
      }
    }
  ])

  return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})




export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken, 
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
// field kyuki user route meh object except karta hai