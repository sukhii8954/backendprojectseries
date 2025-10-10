// here we assuming file already on server and we take local path from server of file and will upload to cloudinary 
// and we also remove file from server

// NOTE :-  important point **

// file will be uploaded through multer , cloudinary is the service which we use it as it is .sdk ,it takes our file
// and upload it on its server 
// Here we upload file with the help of multer on our local storage temporary then with cloudinary we upload it on server

// Note:- 
// fs is a file system in node and it comes by default with node.js 
// fs helps us to read , write ,remove , copy  the files and etc so much more things it can do with files 
// also we can change path , can change file permission using file system

// we cant delete a file but we use unlink to remove the link of the file without affecting the directory to which link refers
// if file is uploaded then we can remove it by unlinking with fs

import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    // Configuration
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });


    // this is the defualt code we can use anywhere when we want to use cloudinary to upload , img , video or any file
    
const uploadOnCloudinary = async (localFilePath)=> {
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
       const response = await cloudinary.uploader.upload
       (localFilePath,{
           resource_type:"auto" 
        })
        // file has beed uploaded , now we give msg that it is uploaded
        console.log("file upload successfully",response.url);
         
         return response;  // Returns response → so that we can store the url in your database (e.g., user’s profile picture URL, or a video link).

    } catch (error) {
        // if file get not uploaded to server :- as we have localfilepath on server but not uploaded , so to avoid
        // fishing , or malacious we use fs unlinksync to delete the file 
        fs.unlinkSync(localFilePath) // remove the locally saved temp file as the upload operation got failed
        return null;
    }
   
   
}
    export {uploadOnCloudinary}
   