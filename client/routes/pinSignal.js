import express from "express";
import Signal from "../models/signal.schema.js"; // Adjust the import path as needed

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { signalId, isPinned } = req.body;

    // 1. Validate required fields
    if (!signalId) {
      return res.status(400).json({ status: "error", message: "Signal ID is required." });
    }

    // 2. Find and update the signal document
    const updatedSignal = await Signal.findByIdAndUpdate(
      signalId,
      { isPinned: isPinned }, // The field to update
      { new: true } // Return the updated document
    );

    // 3. Handle cases where the signal is not found
    if (!updatedSignal) {
      return res.status(404).json({ status: "error", message: "Signal not found." });
    }

    // 4. Send a success response with the updated signal data
    res.status(200).json({
      status: "ok",
      message: "Signal pin status updated successfully.",
      signal: updatedSignal,
    });
  } catch (error) {
    // 5. Handle any server-side errors
    res.status(500).json({
      status: "error",
      message: "Server error.",
      details: error.message,
    });
  }
});

export default router;