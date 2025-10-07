// server/routes/transaction.routes.js
import express from "express";
import Transaction from "../../client/models/transaction.schema.js";
import User from "../../client/models/user.schema.js"; // Import the User model

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // 1. Destructure all necessary fields from the request body
    const { id, status, userId, amount } = req.body; 

    // Define the valid statuses
    const allowedStatuses = ["success", "failed"];

    // Validate the provided status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid transaction status provided." });
    }
    
    // --- 2. Transaction Update Logic ---

    // Find the transaction by ID and update its status
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    // Handle case where transaction is not found
    if (!updatedTransaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // --- 3. Refund Logic for 'failed' status (Simplified for Admin) ---
    let refundProcessed = false;
    
    if (status === "failed") {
      // Validate user and amount data from the request body
      if (!userId || typeof amount !== 'number' || amount <= 0) {
        console.warn(`Admin requested 'failed' status for transaction ${id}, but missing required data (userId: ${userId}, amount: ${amount}) for refund.`);
        // Send a response but include a warning about the missing refund
        return res.status(202).json({
          status: "warning",
          message: "Transaction status updated to 'failed', but refund data (userId/amount) was invalid or missing.",
        });
      }

      // Find the user and credit the amount back to their balance using $inc
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount } }, // Use $inc to safely increment the balance
        { new: true }
      );

      if (!updatedUser) {
        // Log a critical error: Transaction failed, but user not found for refund.
        console.error(`CRITICAL: Transaction ${id} failed, but user ${userId} not found for refund of ${amount}.`);
        return res.status(202).json({
          status: "warning",
          message: "Transaction status updated to 'failed', but user for refund was not found.",
        });
      }
      
      refundProcessed = true;
    }

    // --- 4. Final Response ---
    let message = "Transaction status updated successfully.";
    if (refundProcessed) {
        message += " User balance credited.";
    }

    res.status(200).json({
      status: "ok",
      message: message,
    });
  } catch (error) {
    console.error("Error updating transaction status and/or crediting user:", error);
    res.status(500).json({ error: "Server error.", details: error.message });
  }
});

export default router;