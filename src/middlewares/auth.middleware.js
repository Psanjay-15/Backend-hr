import { ApiError } from "../utils/ApiError.js";
import asynHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asynHandler (async(req,res,next)=>{
   try {
     const token = req.cookies?.acessToken || req.header("Authorization")?.replace("Bearer","")
 
     if(!token){
         throw new ApiError(401,"Unauthorized Request")
     }
 
     const decodeToekn=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decodeToekn?._id).select("-password -refreshToken")
  
     if(!user){
         throw new ApiError(401,"Invalid Acess Token")
     }
 
     req.user = user 
     next()

   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token")
    
   }
})