import { userModel } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

const JWT_SECRET = "supersecret";

// User SignUp route
export const userRegisterController = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isExist = await userModel.findOne({ email });
    if (isExist) {
      return res.status(422).json({
        message: "User already exists with email.",
        status: "failed",
      });
    }

    const user = await userModel.create({ email, password, name });

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    // ✅ FIX: wrap email in try-catch (so signup doesn’t fail)
    try {
      await sendEmail(
        email,
        "Welcome to Bank System 💰",
        `Hello ${name}, your account has been created successfully!`
      );
    } catch (e) {
      console.log("Email failed:", e.message);
    }

    // ✅ FIX: add return
    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token
    });

  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
};

// User Login Route
export const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ FIX: validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Password or Email is invalid" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Password or Email is invalid" });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    // ✅ FIX: add return
    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token
    });

  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
};