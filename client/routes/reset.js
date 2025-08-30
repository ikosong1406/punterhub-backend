import express from "express";
import User from "../models/user.schema.js";
import { sendMail } from "../../utils/mail.js";
import {reset} from "../templates/reset.js"

const router = express.Router();

// 📌 Reset Password Request Route
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate 4-digit code
    const resetCode = Math.floor(1000 + Math.random() * 9000);

    // Save reset code and expiry time in the database (valid for 10 minutes)
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email with reset code
    sendMail(user.email, "Password Reset Code", "", reset(resetCode));

    res.status(200).json({ status: "ok", data: "Reset code sent to email" });
  } catch (error) {
    console.error("Error in reset password route:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
