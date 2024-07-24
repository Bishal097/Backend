import multer from "multer";

const storage = multer.diskStorage({ // disk storage use kar rhe hain due to memory issue
    destination: function (req, file, cb) { // cb --> callback, 
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      //console.log('Filename function called', file.originalname);
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})