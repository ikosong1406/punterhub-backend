import dotenv from "dotenv";
dotenv.config();
import express from "express";
import User from "../models/user.schema.js";
import Transaction from "../models/transaction.schema.js";
import Paystack from "paystack-node";

// Initialize Paystack with your Secret Key
// Make sure process.env.PAYSTACK_SECRET_KEY is loaded from your .env file
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY, "live"); // Use "live" for production

const router = express.Router();

/**
 * Creates a Paystack Transfer Recipient.
 */
async function createPaystackRecipient({
  accountName,
  accountNumber,
  bankCode,
  userName,
}) {
  try {
    const recipientData = {
      type: "nuban",
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
      description: `Withdrawal for user ${userName}`,
    };

    const response = await paystack.recipient.create(recipientData);

    if (response.status && response.data) {
      return response.data; // This data contains the recipient_code
    } else {
      throw new new Error(
        response.message || "Failed to create Paystack recipient."
      );
    }
  } catch (error) {
    console.error("Paystack Recipient Creation Error:", error);
    throw new new Error(`Paystack Recipient Creation Failed: ${error.message}`);
  }
}

/**
 * Initiates the actual fund transfer using the recipient code.
 * NOTE: The 'amount' parameter must be the value in NGN (Naira).
 */
async function initiatePaystackTransfer({ recipientCode, amount, reason }) {
  try {
    // Paystack amount must be in Kobo, so multiply the Naira amount by 100
    const amountInKobo = amount * 100;

    const transferData = {
      source: "balance", // Transfer from your Paystack balance
      reason: reason,
      amount: amountInKobo,
      recipient: recipientCode,
    };

    const response = await paystack.transfer.initiate(transferData);

    if (response.status && response.data) {
      return response.data;
    } else {
      throw new new Error(
        response.message || "Failed to initiate Paystack transfer."
      );
    }
  } catch (error) {
    console.error("Paystack Transfer Initiation Error:", error);
    throw new new Error(`Paystack Transfer Failed: ${error.message}`);
  }
}

router.post("/", async (req, res) => {
  // -------------------------------------------------------------
  // 💡 FIX APPLIED: Renamed 'amount' to 'coinAmount' and destructured 'conversionRate'
  // -------------------------------------------------------------
  const {
    userId,
    amount: coinAmount, // The amount in coins
    bankCode,
    bankName,
    accountNumber,
    accountName,
    conversionRate, // The rate (e.g., 100) sent from the frontend
  } = req.body;
  // -------------------------------------------------------------

  // --- Initial Validation and Deduct Balance ---
  if (
    !userId ||
    !coinAmount || // Use coinAmount for validation
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
  if (coinAmount <= 0) {
    return res.status(400).json({ error: "Invalid withdrawal amount" });
  }

  // Calculate the actual Naira amount to be paid out
  const nairaAmountToTransfer = coinAmount * conversionRate;

  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.balance < coinAmount) {
      // Check user balance against the coin amount
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct the **coin amount** immediately to reserve the funds
    user.balance -= coinAmount;
    await user.save();
  } catch (dbError) {
    return res.status(500).json({
      error: "Database error during balance check/deduction",
      details: dbError.message,
    });
  }
  // --- End Initial Validation and Deduct Balance ---

  // --- Paystack Automation ---
  let transaction;
  let paystackRecipient;

  try {
    // 1. Create a Transfer Recipient
    paystackRecipient = await createPaystackRecipient({
      accountName,
      accountNumber,
      bankCode,
      userName: user.userName, // Assuming user.userName exists
    });

    // 2. Initiate the Transfer
    const reason = `Withdrawal payout to ${user.userName}`;
    const paystackTransfer = await initiatePaystackTransfer({
      recipientCode: paystackRecipient.recipient_code,
      // 💡 FIX APPLIED: Pass the calculated Naira amount
      amount: nairaAmountToTransfer,
      reason: reason,
    });

    // 3. Create a new withdrawal transaction
    const transferStatus = paystackTransfer.status;

    transaction = new Transaction({
      user: userId,
      type: "withdrawal",
      amount: coinAmount, // Store the withdrawn coin amount
      status: transferStatus,
      details: {
        userName: user.userName,
        bankCode,
        bankName,
        accountNumber,
        accountName,
        conversionRate, // Store the rate used
        nairaAmountSent: nairaAmountToTransfer, // Store the Naira value sent
        paystackRecipientCode: paystackRecipient.recipient_code,
        paystackTransferCode: paystackTransfer.transfer_code,
      },
      date: new Date(),
    });

    await transaction.save();
    user.transactions.push(transaction._id);
    await user.save(); // Save user again with the new transaction ID

    res.status(200).json({
      status: "ok",
      message: `Withdrawal initiated successfully for ${nairaAmountToTransfer} NGN. Status: ${transferStatus}.`,
      transfer_code: paystackTransfer.transfer_code,
      newBalance: user.balance,
    });
  } catch (paystackError) {
    // --- ROLLBACK LOGIC ---
    try {
      // Roll back the coin amount deduction
      user.balance += coinAmount;
      await user.save();
      console.warn(
        `Balance rolled back for user ${userId} due to Paystack failure. Coins: ${coinAmount}`
      );
    } catch (rollbackError) {
      console.error(
        `CRITICAL: Failed to rollback balance for user ${userId}. Manual intervention required.`,
        rollbackError
      );
    }
    // -----------------------

    // Create a failed transaction log entry for the record
    const failedTransaction = new Transaction({
      user: userId,
      type: "withdrawal",
      amount: coinAmount,
      status: "failed",
      details: {
        ...req.body,
        errorMessage: paystackError.message,
        paystackRecipientCode: paystackRecipient
          ? paystackRecipient.recipient_code
          : "N/A",
      },
      date: new Date(),
    });
    await failedTransaction.save();
    user.transactions.push(failedTransaction._id);
    await user.save();

    res.status(500).json({
      error: "Paystack withdrawal failed. Funds credited back to user balance.",
      details: paystackError.message,
    });
  }
});

export default router;