import express from "express";
import User from "../models/user.schema.js";
import Signal from "../models/signal.schema.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { punterId } = req.body;

    // 1. Find the user and select their signal IDs
    const user = await User.findById(punterId).select("signals");

    if (!user) {
      return res.status(404).json({ message: "Punter not found." });
    }

    // 2. Use the signal IDs to find all associated signals
    const signals = await Signal.find({
      _id: { $in: user.signals },
    });

    // 3. Count the wins and losses
    const wins = signals.filter((signal) => signal.status === "win").length;
    const losses = signals.filter((signal) => signal.status === "loss").length;

    // 4. Return the calculated counts to the frontend
    res.status(200).json({
      wins,
      losses,
    });
  } catch (error) {
    console.error("Error getting signal stats:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

export default router;
