import express from "express";
import Signal from "../models/signal.schema.js"; // Adjust path if needed
import User from "../models/user.schema.js"; // Import the User model

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      userId, // Now expecting userId from the request body
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

    // 1. Validate required fields, including userId
    if (!userId || !primaryCategory) {
      return res.status(400).json({ error: "User ID and primary category are required" });
    }

    // 2. Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 3. Create the signal
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
      status,
      // Add the punter's user ID to the signal document itself (recommended practice)
      punter: user._id 
    });

    // 4. Save the new signal to the Signal collection
    await newSignal.save();

    // 5. Add the new signal's ID to the user's signals array and save the user
    user.signals.push(newSignal._id);
    await user.save();

    res.status(201).json({
      status: "ok",
      message: "Signal created and linked to user successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

export default router;