import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
const transactionRoutes=express.Router(); 

transactionRoutes.post("/",authMiddleware)

export default transactionRoutes;