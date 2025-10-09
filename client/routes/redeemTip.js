import { Router } from "express";
import mongoose from "mongoose";
import Tip from "../models/tip.schema.js"; // Adjust path as needed
import User from "../models/user.schema.js"; // Adjust path as needed
import Transaction from "../models/transaction.schema.js"; // 🌟 NEW: Import Transaction Model
import Notification from "../models/notification.schema.js"; // 🌟 NEW: Import Notification Model

const router = Router();

// Define the commission rate as a constant (20% commission means 80% goes to punter)
const PUNTER_SHARE = 0.8;

router.post("/", async (req, res) => {
  const { tipId, punterId, status } = req.body;

  if (!tipId || !punterId || !status) {
    return res.status(400).json({
      message:
        "tipId, punterId, and status are all required in the request body.",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // --- 1. FIND TIP AND PUNTER (Pre-flight checks) ---
    const tip = await Tip.findById(tipId).session(session);
    // Use select('+transactions +notifications') if these fields are set to select: false
    const punter = await User.findById(punterId).session(session);

    if (!tip) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: `Tip with ID ${tipId} not found.` });
    }

    if (!punter) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: `Punter with ID ${punterId} not found.` });
    }

    // Enforce that the punterId in the request body matches the punterId on the tip document
    if (tip.punterId.toString() !== punterId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        message:
          "Punter ID mismatch. You are not authorized to update this tip.",
      });
    }

    // --- 2. HANDLE STATUS CHANGE ---
    let message = "";
    let updatedTip = null;

    if (status === "closed") {
      // A. Handle 'closed' status: Simple update
      tip.status = "closed";
      updatedTip = await tip.save({ session });
      message = "Tip status updated to closed.";
    } else if (status === "active") {
      // ⭐ NEW: Handle 'active' status: Simple update
      if (tip.status === "active") {
        await session.abortTransaction();
        return res.status(400).json({ message: "Tip is already active." });
      }
      tip.status = "active";
      updatedTip = await tip.save({ session });
      message = "Tip status updated to active.";
    } else if (status === "redeemed") {
      // B. Handle 'redeemed' status: Update status AND perform financial transaction
      if (tip.status === "redeemed") {
        await session.abortTransaction();
        return res.status(400).json({ message: "Tip is already redeemed." });
      }

      // Calculate the amount to credit the punter
      const salesRevenue = tip.sales * tip.price;
      const punterCreditAmount = salesRevenue * PUNTER_SHARE; // 80% share

      // 2.1. Update Tip Status
      tip.status = "redeemed";
      updatedTip = await tip.save({ session });

      // 2.2. Create Transaction (MUST use { session } option)
      const punterTransaction = await Transaction.create(
        [
          {
            user: punterId,
            type: "redeemed",
            amount: punterCreditAmount,
            status: "success",
            description: `Earnings from daily redemption`,
          },
        ],
        { session }
      );
      const transactionId = punterTransaction[0]._id; // Transaction.create returns an array

      // 2.3. Create Notification (MUST use { session } option)
      const notification = await Notification.create(
        [
          {
            user: punterId,
            title: "Tip Redeemed Successfully",
            description: `You've earned from the redemption of daily bread.`,
            type: "success",
            amount: punterCreditAmount,
          },
        ],
        { session }
      );
      const notificationId = notification[0]._id; // Notification.create returns an array

      // 2.4. Update Punter Balance, Transactions, and Notifications
      // Assumes the User model has 'balance', 'transactions', and 'notifications' fields
      punter.balance = (punter.balance || 0) + punterCreditAmount;
      // Ensure transactions and notifications arrays are initialized if not already
      if (!punter.transactions) punter.transactions = [];
      if (!punter.notifications) punter.notifications = [];

      punter.transactions.push(transactionId);
      punter.notifications.push(notificationId);

      await punter.save({ session });

      message = `Tip redeemed successfully. Punter credited: $${punterCreditAmount.toFixed(
        2
      )}`;
    } else {
      // C. Invalid Status
      await session.abortTransaction();
      return res.status(400).json({
        message: 'Invalid status provided. Must be "closed", "active", or "redeemed".',
      });
    }

    // --- 3. COMMIT TRANSACTION and Send Response ---
    await session.commitTransaction();
    res.status(200).json({
      message: message,
      tip: updatedTip
    });
  } catch (error) {
    // --- 4. ABORT TRANSACTION and Handle Error ---
    await session.abortTransaction();
    console.error("Transaction Error:", error);

    // Handle CastError for invalid ObjectIds
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format provided.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error during status update/redemption.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

export default router;