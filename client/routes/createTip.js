import express from "express";
import Tip from "../models/tip.schema.js"; // Adjust path if needed

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      primaryCategory,
      bettingSite,
      bettingCode,
      startTime,
      totalOdd,
      confidenceLevel,
      matches,
      status
    } = req.body;

    // 1. Validate required fields, including userId
    if (!primaryCategory) {
      return res.status(400).json({ error: "primary category are required" });
    }

    // 3. Create the signal
    const newTip = new Tip({
      primaryCategory,
      bettingSite,
      bettingCode,
      startTime,
      totalOdd,
      confidenceLevel,
      matches,
      status,
    });

    // 4. Save the new signal to the Signal collection
    await newTip.save();

    res.status(201).json({
      status: "ok",
      message: "Tip created",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

export default router;