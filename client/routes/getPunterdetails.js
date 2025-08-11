import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { punterId } = req.body;

    if (!punterId) {
      return res.status(400).json({ error: "Punter ID is required" });
    }

    // Find punter by ID
    const punter = await User.findOne({ _id: punterId, isPunter: true });

    if (!punter) {
      return res.status(404).json({ error: "Punter not found" });
    }

    res.status(200).json({
      status: "ok",
      data: punter,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
