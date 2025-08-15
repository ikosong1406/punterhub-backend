import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: "User ID and role are required" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's role
    user.role = role;
    await user.save();

    res.status(200).json({
      status: "ok",
      message: "User role updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;