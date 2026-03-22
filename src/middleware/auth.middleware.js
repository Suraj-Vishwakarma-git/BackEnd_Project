import { userModel } from "../model/user.model.js";
import jwt from "jsonwebtoken";
const JWT_SECRET="supersecret";

export const authMiddleware=async (req,res,next)=>{
    console.log("cookies:", req.cookies);
    const token=req.cookies?.token || req.headers.authorization?.split(" ")[1] ;
    if(!token) {
        return res.status(401).json({
            message:"Unauthorized access , token is missing"
        })
    }
    try{
        const decoded=jwt.verify(token,JWT_SECRET);
        const user=await userModel.findById(decoded.userId);
        req.user=user;
        return next();
    }catch(e){
        return res.status(401).json({
            message:"Unauthorized access , token is missing" 
        })
    }
}
