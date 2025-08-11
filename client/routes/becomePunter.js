import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

/**
 * POST /api/become-punter
 * Body: { userId: "..." }
 */
router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isPunter = true;
    user.role = "punter";
    await user.save();

    res.status(200).json({
      status: "ok",
      message: "User is now a punter",
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        isPunter: user.isPunter,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
