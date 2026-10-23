import express from "express";
import Tip from "../models/tip.schema.js"; // Adjust the import path as needed

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { TipId, status } = req.body;

    if (!TipId || !status) {
      return res.status(400).json({ error: "Tip ID and status are required" });
    }

    // Find the Tip by its ID and update the status
    const updatedTip = await Tip.findByIdAndUpdate(
      TipId,
      { status },
      { new: true } // Returns the updated document
    );

    if (!updatedTip) {
      return res.status(404).json({ error: "Tip not found" });
    }

    res.status(200).json({
      status: "ok",
      message: "Tip status updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

export default router;