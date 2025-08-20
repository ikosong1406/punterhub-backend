import express from "express";
import User from "../models/user.schema.js";
import Transaction from "../models/transaction.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, amount, bankCode, accountNumber, accountName } = req.body;

    if (!userId || !amount || !bankCode || !accountNumber || !accountName) {
      return res.status(400).json({ error: "User ID, amount, bank details, and account name are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal amount" });
    }

    // Find the user and deduct the balance in a single atomic operation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Create a new withdrawal transaction
    const transaction = new Transaction({
      user: userId,
      type: "withdrawal",
      amount,
      status: "pending",
      details: {
        bankCode,
        accountNumber,
        accountName,
      },
      date: new Date()
    });

    // Save the new transaction document
    await transaction.save();

    // Now, update the user document to add the new transaction's ID
    user.balance -= amount;
    user.transactions.push(transaction._id); // Add the new transaction's ID to the array
    await user.save();

    res.status(200).json({
      status: "ok",
      message: "Withdrawal request submitted successfully",
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