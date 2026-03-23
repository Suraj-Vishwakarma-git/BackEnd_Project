import { transactionModel } from "../model/transaction.model.js";
import { ledgerModel } from "../model/ledger.model.js";
import { accountModel } from "../model/account.model.js";


export const createTransaction=async (req,res)=>{
    const {fromAccount,toAccount,amount,idempotencyKey}=req.body;
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            mesage:"fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }
    const fromAcc=await accountModel.findOne({_id:fromAccount});
    const toAcc=await accountModel.findOne({_id:toAccount});
    if(!fromAcc || !toAcc){
        return res.status(400).json({
            message:"Invalid from and toAccount"
        });
    }
    const istransactionAlreadyExists=await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    });
    if(istransactionAlreadyExists){
        if(istransactionAlreadyExists.status==="COMPLETED"){
           return res.status(200).json({
                message:"Transaction Already Completed",
                transaction:istransactionAlreadyExists
            });
        }
        if(istransactionAlreadyExists.status==="PENDING"){
            return res.status(200).json({
                message:"Transaction is still processing",
            });
        }
        if(istransactionAlreadyExists.status==="FAILED"){
            return res.status(500).json({
                message:"Transaction Failed",
            });
        }
        if(istransactionAlreadyExists.status==="REVERSED"){
            return res.status(500).json({
                message:"Transaction REVERSED , try again",
            });
        }
    }

    if(fromAcc.status!=="ACTIVE" || toAcc.status!=="ACTIVE"){
        return res.status(400).json({
            message:"Both account must br active"
        });
    }
    const balance=await fromAcc.getBalance();
    if(balance<amount) {
        res.status(400).json({
            message:`Insufficient Balance. Current Balance is ${balance}. Requested amount is ${amount}`
        });
    }

} 