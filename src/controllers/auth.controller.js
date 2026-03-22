import { userModel } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import {sendEmail} from "../utils/sendEmail.js"
const JWT_SECRET="supersecret";

// User SignUp route
export const userRegisterController=async (req,res)=>{
    try{
        const {email,password,name}= req.body;
    const isExist=await userModel.findOne({email})
    if(isExist) return res.status(422).json({
          message: "User already exists with email.",
          status: "failed"
    });
    const user=await userModel.create({
        email,password,name
    })
    const token=jwt.sign({userId:user._id},JWT_SECRET,{expiresIn:"3d"});
     res.cookie("token", token, {
     httpOnly: true,
     secure: false, 
     sameSite: "lax",
     maxAge: 3 * 24 * 60 * 60 * 1000 
});
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
     await sendEmail(
      email,
      "Welcome to Bank System 💰",
      `Hello ${name}, your account has been created successfully!`
    );
}catch(e){
    console.log(e);
     res.status(500).json({ message: e.message });
   }
}

//User Login Route

export const userLoginController=async (req,res)=>{
   try{
     const {email,password}=req.body;
    const user=await userModel.findOne({email});
    if(!user){
        return res.status(401).json({message:"Password Or Email is Invalid"});
    }
    const isValidPassword=await user.comparePassword(password);
    if(!isValidPassword) return res.status(401).json({message:"Password Or Email is Invalid"});
    const token=jwt.sign({userId:user._id},JWT_SECRET,{expiresIn:"3d"});
    res.cookie("token", token, {
     httpOnly: true,
     secure: false, 
     sameSite: "lax",
     maxAge: 3 * 24 * 60 * 60 * 1000 
});
    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    }) 
  }catch(e){
    console.log(e);
     res.status(500).json({ message: e.message });
  }
}

