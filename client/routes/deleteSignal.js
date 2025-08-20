import express from "express";
import Signal from "../models/signal.schema.js"; // Adjust the import path as needed

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

    res.status(200).json({
      status: "ok",
      message: "Signal deleted successfully",
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