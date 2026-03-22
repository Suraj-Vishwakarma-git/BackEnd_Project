import { accountModel } from "../model/account.model.js";

export const createAccountController=async (req,res)=>{
    const user=req.user;
    const account=await accountModel.create({
        user:user._id
    })
    res.status(201).json({
        account
    })
}
