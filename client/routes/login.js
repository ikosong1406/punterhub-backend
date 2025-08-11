import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.schema.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // ✅ Safer

router.post("/", async (req, res) => {
  try {
    const { email, password, countryCode, phonenumber } = req.body;

    let user;

    if (email) {
      // Login via email
      user = await User.findOne({ email });
    } else if (countryCode && phonenumber) {
      // Login via phone
      user = await User.findOne({ countryCode, phonenumber });
    } else {
      return res
        .status(400)
        .json({ error: "Provide either email or phone details" });
    }

    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET
      // { expiresIn: "7d" } // Optional
    );

    res.status(200).json({
      status: "ok",
      token, // Return token directly, not in a nested data object
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
