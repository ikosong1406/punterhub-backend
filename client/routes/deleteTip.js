import express from "express";
import Tip from "../models/tip.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { tipId } = req.body;

    if (!tipId) {
      return res.status(400).json({ error: "Signal ID is required" });
    }

    // Find and delete the signal by its ID
    const tipDelete = await Tip.findByIdAndDelete(tipId);

    if (!tipDelete) {
      return res.status(404).json({ error: "Signal not found" });
    }

    res.status(200).json({
      status: "ok",
      message: "Tip deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

export default router;