import express from "express";
import User from "../models/user.schema.js";
import Notification from "../models/notification.schema.js";

const router = express.Router();

/**
 * POST /api/get-notifications
 * Body: {
 *   userId: ""
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find the user
    const user = await User.findById(userId).select("notifications");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If no notifications
    if (!user.notifications || user.notifications.length === 0) {
      return res.status(200).json({ notifications: [] });
    }

    // Fetch notification details
    const notifications = await Notification.find({
      _id: { $in: user.notifications }
    }).sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      status: "ok",
      notifications
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

export default router;
