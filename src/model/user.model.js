import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating Account"],
        trim:true,
        lowercase:true,
        match:[ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid Email address" ],
        unique:true
    },
    name:{
        type:String,
        required:[true,"Name is required for creating an account"]
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:[6,"password should be grater equal to 6 characters"],
    },
},{timestamps:true});

userSchema.pre("save",async function (){
    if(!this.isModified("password")) return;
     const hash=await bcrypt.hash(this.password,10);
     this.password=hash;
     return;
})

userSchema.methods.comparePassword=async function (password){
    console.log(password,this.password);
    return await bcrypt.compare(password,this.password);
}

export const userModel=mongoose.model("user",userSchema);

