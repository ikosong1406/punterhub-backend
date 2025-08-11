import express from "express";
import User from "../models/user.schema.js";
import Transaction from "../models/transaction.schema.js";

const router = express.Router();

/**
 * POST /api/withdraw
 * Body: {
 *   userId: "",
 *   amount: Number
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "User ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal amount" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if balance is enough
    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct the balance
    user.balance -= amount;
    await user.save();

    // Log transaction
    const transaction = new Transaction({
      userId,
      type: "withdrawal",
      amount,
      status: "completed",
      date: new Date()
    });
    await transaction.save();

    res.status(200).json({
      status: "ok",
      message: "Withdrawal successful",
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

export default router;
