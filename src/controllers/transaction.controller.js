import { transactionModel } from "../model/transaction.model.js";
import { ledgerModel } from "../model/ledger.model.js";
import { accountModel } from "../model/account.model.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendEmail.js";

export const createTransaction = async (req, res) => {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    // 1. Validate request
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required"
        });
    }

    // 2. Validate accounts
    const fromAcc = await accountModel.findById(fromAccount);
    const toAcc = await accountModel.findById(toAccount);

    if (!fromAcc || !toAcc) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        });
    }

    // 3. Idempotency check
    const existingTransaction = await transactionModel.findOne({ idempotencyKey });

    if (existingTransaction) {
        if (existingTransaction.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already completed",
                transaction: existingTransaction
            });
        }

        if (existingTransaction.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing"
            });
        }

        if (existingTransaction.status === "FAILED" || existingTransaction.status === "REVERSED") {
            return res.status(500).json({
                message: "Previous transaction failed or reversed, please retry"
            });
        }
    }

    // 4. Account status check
    if (fromAcc.status !== "ACTIVE" || toAcc.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both accounts must be ACTIVE"
        });
    }

    // 5. Balance check
    const balance = await fromAcc.getBalance();

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient Balance. Current: ${balance}, Requested: ${amount}`
        });
    }

    let transaction;
    let session;

    try {
        // 6. Start transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // 7. Create transaction (PENDING)
        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0];

        // 8. Debit entry
        await ledgerModel.create([{
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session });

        // (Optional delay simulation)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 9. Credit entry
        await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session });

        // 10. Mark transaction completed
        await transactionModel.findByIdAndUpdate(
            transaction._id,
            { status: "COMPLETED" },
            { session }
        );

        // 11. Commit
        await session.commitTransaction();
        session.endSession();

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        return res.status(500).json({
            message: "Transaction failed, please retry"
        });
    }

    // 12. Send email (outside transaction)
    try {
        await sendEmail(req.user.email, req.user.name, amount, toAccount);
    } catch (e) {
        console.log("Email failed:", e.message);
    }

    // 13. Final response
    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction
    });
};