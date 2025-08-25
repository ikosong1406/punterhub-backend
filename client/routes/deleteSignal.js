import express from "express";
import Signal from "../models/signal.schema.js"; // Adjust the import path as needed
import User from "../models/user.schema.js"; // Import the User model

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { signalId } = req.body;

    if (!signalId) {
      return res.status(400).json({ error: "Signal ID is required" });
    }

    // Find and delete the signal by its ID
    const deletedSignal = await Signal.findByIdAndDelete(signalId);

    if (!deletedSignal) {
      return res.status(404).json({ error: "Signal not found" });
    }

    // After deleting the signal, find all users and remove the signal ID from their signals array
    await User.updateMany(
      { signals: signalId }, // Find users who have this signal ID in their signals array
      { $pull: { signals: signalId } } // Use $pull to remove the signal ID
    );

    res.status(200).json({
      status: "ok",
      message: "Signal deleted successfully and removed from user accounts",
      signal: deletedSignal,
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

export default router;