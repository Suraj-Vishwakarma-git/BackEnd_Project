import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./route/auth.routes.js";
import transactionRoutes from "./route/transaction.routes.js"
import accountRouter from "./route/account.routes.js";
const app=express();
app.use(cookieParser());
app.use(express.json());
app.use
app.use("/api/account",accountRouter);
app.use("/api/transactions",transactionRoutes);
app.use("/api/auth",authRouter);

export default app;
