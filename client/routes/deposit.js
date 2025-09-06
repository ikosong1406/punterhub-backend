import express from "express";
import User from "../models/user.schema.js";
import Transaction from "../models/transaction.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "User ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Invalid deposit amount" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new deposit transaction
    const transaction = new Transaction({
      user: userId,
      type: "deposit",
      amount,
      status: "completed", // Set status to completed as per your request
      date: new Date()
    });

    // Save the new transaction document
    await transaction.save();

    // Update the user's balance and add the new transaction's ID
    user.balance += amount;
    user.transactions.push(transaction._id);
    await user.save();

    res.status(200).json({
      status: "ok",
      message: "Deposit successful",
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