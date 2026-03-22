import mongoose from "mongoose";

const accountSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"Account must Associated with a user"],
        index:true
    },
    status:{
        type: String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"Status can be either ACTIVE , FROZEN OR CLOSED " 
        },
        default:"ACTIVE" 
    },
    currency:{
        type:String,
        required:[true,"Currency is required for creating an account"],
        default:"INR"
    }
},
{
    timestamps:true
}
)

accountSchema.index({user:1,status:1});
export const accountModel=mongoose.model("account",accountSchema);