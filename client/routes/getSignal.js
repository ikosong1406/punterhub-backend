import express from "express";
import User from "../models/user.schema.js";
import Signal from "../models/signal.schema.js";

const router = express.Router();

/**
 * POST /api/get-signals
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

    // Find the user and get their signals
    const user = await User.findById(userId).select("signals");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If no signals
    if (!user.signals || user.signals.length === 0) {
      return res.status(200).json({ signals: [] });
    }

    // Get full signal details
    const signals = await Signal.find({
      _id: { $in: user.signals }
    }).sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      status: "ok",
      signals
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

export default router;
