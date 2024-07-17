//cloudinary ko ek utility me rekhna hai issiliye kyu ki hmlogo ko file upload karna hai toh 
//hmlog multer ka use karte hain jo ki file local server meh pehle rakhta hai then  and then usko remove karke
//usko firse cloudinary meh rakha ja ta he two step process hai  taki reattempt for better upload

import { v2 as cloudinary } from "cloudinary";
import fs from  "fs"// file ko read , write and manage karne k liye help karvata hai


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET, 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary}