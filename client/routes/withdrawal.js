import dotenv from "dotenv";
dotenv.config();
import express from "express";
import User from "../models/user.schema.js";
import Transaction from "../models/transaction.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    userId,
    amount: coinAmount, // The amount in coins
    bankCode,
    bankName,
    accountNumber,
    accountName,
    conversionRate, // The rate (e.g., 100) sent from the frontend
  } = req.body;

  // --- Initial Validation ---
  if (
    !userId ||
    !coinAmount ||
    !bankCode ||
    !bankName ||
    !accountNumber ||
    !accountName ||
    !conversionRate
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided" });
  }
  const parsedCoinAmount = Number(coinAmount);
  if (parsedCoinAmount <= 0) {
    return res.status(400).json({ error: "Invalid withdrawal amount" });
  }

  // Calculate the actual Naira amount to be paid out for logging purposes
  const nairaAmountToTransfer = parsedCoinAmount * Number(conversionRate);

  let user;
  try {
    // 1. Find User and Check Balance
    user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.balance < parsedCoinAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
  } catch (dbError) {
    return res.status(500).json({
      error: "Database error during user check",
      details: dbError.message,
    });
  }

  // 2. Deduct Balance and Prepare Transaction
  let transaction;
  try {
    // Deduct the **coin amount** immediately to reserve the funds
    user.balance -= parsedCoinAmount;
    await user.save();

    // Create a new withdrawal transaction with 'pending' status
    transaction = new Transaction({
      user: userId,
      type: "withdrawal",
      amount: parsedCoinAmount, // Store the withdrawn coin amount
      status: "pending", // 💡 FIX APPLIED: Set status to 'pending'
      details: {
        userName: user.firstname + " " + user.lastname,
        bankCode,
        bankName,
        accountNumber,
        accountName,
        conversionRate: conversionRate,
        nairaAmountToPay: nairaAmountToTransfer, // Store the Naira value to be paid
        // Removed Paystack-specific fields
      },
      date: new Date(),
    });

    // 3. Save Transaction and Update User's Transactions
    await transaction.save();
    user.transactions.push(transaction._id);
    await user.save(); // Save user again with the new transaction ID

    // 4. Send Success Response
    res.status(200).json({
      status: "pending",
      message: `Withdrawal request created successfully.`,
      transactionId: transaction._id,
      newBalance: user.balance,
    });
  } catch (processError) {
    // --- ROLLBACK LOGIC ---
    // If the transaction failed to save or the user update failed,
    // the balance deduction needs to be rolled back.
    try {
      if (user) {
        user.balance += parsedCoinAmount;
        await user.save();
        console.warn(
          `Balance rolled back due to transaction saving failure.`
        );
      }
    } catch (rollbackError) {
      console.error(
        `CRITICAL: Failed to rollback balance . Manual intervention required.`,
        rollbackError
      );
    }
    // -----------------------

    res.status(500).json({
      error:
        "Failed to record withdrawal transaction. Funds credited back to user balance.",
      details: processError.message,
    });
  }
});

export default router;