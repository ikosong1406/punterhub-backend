// server/routes/transaction.routes.js
import express from "express";
import Transaction from "../../client/models/transaction.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { id, status } = req.body;

    // Define the valid statuses based on your schema enum
    const allowedStatuses = ["pending", "success", "failed"];
    
    // Validate the provided status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid transaction status provided." });
    }

    // Find the transaction by ID and update its status
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true } // 'new: true' returns the updated document
    );

    // Handle case where transaction is not found
    if (!updatedTransaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // You can add more logic here, such as sending an email
    // or triggering a webhook based on the status change.
    // For example, if status is 'approved', you might trigger
    // a payment to the driver.

    res.status(200).json({
      status: "ok",
      message: "Transaction status updated successfully.",
    });
  } catch (error) {
    console.error("Error updating transaction status:", error);
    res.status(500).json({ error: "Server error.", details: error.message });
  }
});

export default router;