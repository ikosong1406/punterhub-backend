import dotenv from "dotenv";
dotenv.config();
import express from "express";
import User from "../models/user.schema.js";
import Transaction from "../models/transaction.schema.js";
import Paystack from "paystack-node"; // Import the Paystack library (assuming paystack-node)

// Initialize Paystack with your Secret Key
// Make sure process.env.PAYSTACK_SECRET_KEY is loaded from your .env file
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY, "development"); // Use "live" for production

const router = express.Router();

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
      currency: "NGN", // Assuming NGN, change if necessary
      description: `Withdrawal for user ${userName}`,
    };

    const response = await paystack.recipient.create(recipientData);

    if (response.status && response.data) {
      return response.data; // This data contains the recipient_code
    } else {
      throw new Error(
        response.message || "Failed to create Paystack recipient."
      );
    }
  } catch (error) {
    console.error("Paystack Recipient Creation Error:", error);
    throw new Error(`Paystack Recipient Creation Failed: ${error.message}`);
  }
}

/**
 * Initiates the actual fund transfer using the recipient code.
 */
async function initiatePaystackTransfer({ recipientCode, amount, reason }) {
  try {
    // Paystack amount must be in Kobo, so multiply by 100
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
      throw new Error(
        response.message || "Failed to initiate Paystack transfer."
      );
    }
  } catch (error) {
    console.error("Paystack Transfer Initiation Error:", error);
    throw new Error(`Paystack Transfer Failed: ${error.message}`);
  }
}

router.post("/", async (req, res) => {
  // --- Initial Validation and Deduct Balance ---
  const {
    userId,
    amount,
    bankCode,
    bankName,
    accountNumber,
    accountName,
  } = req.body;

  if (
    !userId ||
    !amount ||
    !bankCode ||
    !bankName ||
    !accountNumber ||
    !accountName
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided" });
  }
  if (amount <= 0) {
    return res.status(400).json({ error: "Invalid withdrawal amount" });
  }

  // Use a transaction/lock mechanism here for better atomicity in a production app.
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct the balance immediately to reserve the funds
    user.balance -= amount;
    await user.save();
  } catch (dbError) {
    return res
      .status(500)
      .json({
        error: "Database error during balance check/deduction",
        details: dbError.message,
      });
  }
  // --- End Initial Validation and Deduct Balance ---

  // --- Paystack Automation ---
  let transaction; // Declare outside try block for scope
  let paystackRecipient;

  try {
    // 1. Create a Transfer Recipient
    paystackRecipient = await createPaystackRecipient({
      accountName,
      accountNumber,
      bankCode,
      userName,
    });

    // 2. Initiate the Transfer
    const reason = `Withdrawal payout to ${userName}`;
    const paystackTransfer = await initiatePaystackTransfer({
      recipientCode: paystackRecipient.recipient_code,
      amount: amount,
      reason: reason,
    });

    // 3. Create a new withdrawal transaction (Status will reflect the immediate outcome)
    // Paystack transfer status can be 'pending', 'success', or 'failed' immediately.
    // For 'pending', you should rely on webhooks for the final status.
    const transferStatus = paystackTransfer.status; // e.g., 'pending', 'success'

    transaction = new Transaction({
      user: userId,
      type: "withdrawal",
      amount,
      status: transferStatus, // Use Paystack status
      details: {
        userName,
        bankCode,
        bankName,
        accountNumber,
        accountName,
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
      message: `Withdrawal initiated successfully. Status: ${transferStatus}.`,
      transfer_code: paystackTransfer.transfer_code,
      newBalance: user.balance,
    });
  } catch (paystackError) {
    // --- ROLLBACK LOGIC ---
    // If Paystack failed, the user should be credited back the amount deducted
    try {
      user.balance += amount; // Roll back the balance deduction
      await user.save();
      console.warn(
        `Balance rolled back for user ${userId} due to Paystack failure.`
      );
    } catch (rollbackError) {
      console.error(
        `CRITICAL: Failed to rollback balance for user ${userId}. Manual intervention required.`,
        rollbackError
      );
      // Consider logging this failure to a dedicated error tracking system
    }
    // -----------------------

    // Create a failed transaction log entry for the record
    const failedTransaction = new Transaction({
      user: userId,
      type: "withdrawal",
      amount,
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
