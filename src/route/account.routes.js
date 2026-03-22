import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createAccountController } from "../controllers/account.controllers.js";
const router=express.Router();

router.post("/",authMiddleware,createAccountController);


export default router;