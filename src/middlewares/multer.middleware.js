import multer from "multer"
/* 
we are going to use disk storage to save file at disk not on memory as if user uploads large file, our memory can get full
destination -: The folder to which the file has been saved	:- DiskStorage
*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) { // where we want to save the file
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {  // cb is callback here
        cb(null, file.originalname)  // taking original name that user used to upload a file
    }
})

export const upload = multer({
    storage,
})