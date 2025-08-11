import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

/**
 * POST /api/deposit
 * Body: { userId: "...", amount: 1000 }
 */
router.post("/", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "User ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than zero" });
    }

    // Find and update user balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.balance += amount;
    await user.save();

    res.status(200).json({
      status: "ok",
      message: "Deposit successful",
      balance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
