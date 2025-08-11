import express from "express";
import Signal from "../models/signal.schema.js"; // Adjust path if needed

const router = express.Router();

/**
 * POST /api/signal
 * Creates a new trading/betting signal
 */
router.post("/", async (req, res) => {
  try {
    const {
      primaryCategory,
      secondaryCategory,
      bettingSite,
      bettingCode,
      startTime,
      totalOdd,
      confidenceLevel,
      matches,
      pair,
      direction,
      entryPrice,
      takeProfit,
      stopLoss,
      timeFrame,
      status
    } = req.body;

    // Validate required fields
    if (!primaryCategory) {
      return res.status(400).json({ error: "Primary category is required" });
    }

    // Create signal
    const newSignal = new Signal({
      primaryCategory,
      secondaryCategory,
      bettingSite,
      bettingCode,
      startTime,
      totalOdd,
      confidenceLevel,
      matches,
      pair,
      direction,
      entryPrice,
      takeProfit,
      stopLoss,
      timeFrame,
      status
    });

    // Save to database
    await newSignal.save();

    res.status(201).json({
      status: "ok",
      message: "Signal created successfully",
      signal: newSignal
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

export default router;
