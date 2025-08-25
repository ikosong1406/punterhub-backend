import express from "express";
import User from "../models/user.schema.js";
import Signal from "../models/signal.schema.js"; // Import the Signal model

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { punterId } = req.body;

    if (!punterId) {
      return res.status(400).json({ error: "Punter ID is required" });
    }

    // Find punter by ID
    const punter = await User.findOne({ _id: punterId, isPunter: true });

    if (!punter) {
      return res.status(404).json({ error: "Punter not found" });
    }

    // Find all signals where the _id is in the punter's signals array
    const signals = await Signal.find({
      _id: { $in: punter.signals },
    });

    res.status(200).json({
      status: "ok",
      data: {
        punter: punter,
        signals: signals,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;