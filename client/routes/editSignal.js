import express from "express";
import Signal from "../models/signal.schema.js"; // Adjust the import path as needed

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { signalId, status } = req.body;

    if (!signalId || !status) {
      return res.status(400).json({ error: "Signal ID and status are required" });
    }

    // Find the signal by its ID and update the status
    const updatedSignal = await Signal.findByIdAndUpdate(
      signalId,
      { status },
      { new: true } // Returns the updated document
    );

    if (!updatedSignal) {
      return res.status(404).json({ error: "Signal not found" });
    }

    res.status(200).json({
      status: "ok",
      message: "Signal status updated successfully",
      signal: updatedSignal,
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

export default router;