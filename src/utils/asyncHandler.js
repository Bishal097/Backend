// method banayega and export karega  
// higher oreder function use karta hai joh function ko return bhi karba skta hai and function us ekarke parameter bhi use karta hai

const asyncHandler = (requestHandler) => {
    return(req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}
export {asyncHandler}
/*
const asyncHandler = (fn) => async(req, res, next) => {
    try{
         await fn(req, res, next);
    }
    catch(error)
    {
        res.status(error.code || 500).json({
            success:false,
            message:error.message
        })
    }
}
    */