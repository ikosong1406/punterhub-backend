import express from "express";
import User from "../models/user.schema.js";
import Transaction from "../models/transaction.schema.js";

const router = express.Router();

/**
 * POST /api/get-transactions
 * Body: {
 *   userId: ""
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find user
    const user = await User.findById(userId).select("transactions");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If no transactions
    if (!user.transactions || user.transactions.length === 0) {
      return res.status(200).json({ transactions: [] });
    }

    // Fetch transaction details
    const transactions = await Transaction.find({
      _id: { $in: user.transactions }
    }).sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      status: "ok",
      transactions
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

export default router;
