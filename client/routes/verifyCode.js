import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Convert the provided code to a number
    const providedCode = parseInt(code, 10);

    // Check if the reset code matches
    if (user.resetCode !== providedCode) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or expired code" });
    }

    // Check if the reset code has expired
    const currentTime = new Date();
    if (currentTime > user.resetCodeExpires) {
      return res
        .status(400)
        .json({ status: "error", message: "Code has expired" });
    }

    // If the code matches and is not expired, send success response
    return res
      .status(200)
      .json({ status: "ok", message: "Code verified successfully" });
  } catch (error) {
    console.error("Error verifying code:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});

export default router;
