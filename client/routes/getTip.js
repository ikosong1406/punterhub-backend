import express from "express";
import Signal from "../models/signal.schema.js"; // Import the Signal model

const router = express.Router();

// Route to get all details for a specific tip (Signal) by ID
// Example usage: POST /punter/getTipDetails
router.post("/", async (req, res) => {
  try {
    // 1. Get the tip ID from the request body
    const { tipId } = req.body; 

    if (!tipId) {
      return res.status(400).json({ status: "error", message: "Tip ID is required" });
    }

    // 2. Find the signal/tip by its ID. 
    // Mongoose finds the document and automatically includes ALL fields, 
    // including the embedded 'comments' array, 'matches' array, etc.
    const tip = await Signal.findById(tipId);

    if (!tip) {
      return res.status(404).json({ status: "error", message: "Tip not found" });
    }

    // 3. Return the complete tip document.
    // The 'tip' object here contains ALL the fields from your signalSchema.
    res.status(200).json({
      status: "ok",
      data: {
        tip: tip,
      },
    });

  } catch (error) {
    // Handle specific error for invalid MongoDB ID format
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ status: "error", message: "Invalid Tip ID format" });
    }
    // Handle other server errors
    res.status(500).json({ status: "error", message: "Server error", details: error.message });
  }
});

export default router;
