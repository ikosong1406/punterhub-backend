import express from "express";
import User from "../models/user.schema.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password and clear the reset code fields
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    return res
      .status(200)
      .json({ status: "ok", message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});

export default router;
