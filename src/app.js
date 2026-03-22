import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./route/auth.routes.js";
import accountRouter from "./route/account.routes.js";
const app=express();
app.use(cookieParser());
app.use(express.json());
app.use("/api/account",accountRouter);
app.use("/api/auth",authRouter);

export default app;
