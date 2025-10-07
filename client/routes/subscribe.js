import express from "express";
import User from "../models/user.schema.js";
import Transaction from "../models/transaction.schema.js";
import Notification from "../models/notification.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, punterId, plan, price } = req.body;

    const user = await User.findById(userId);
    const punter = await User.findById(punterId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!punter) {
      return res.status(404).json({ message: "Punter not found." });
    }

    // Check if the user is already subscribed
    const isAlreadySubscribed = user.subscribedPunters.some(
      (sub) => sub.punterId.toString() === punterId
    );

    if (isAlreadySubscribed) {
      return res.status(400).json({ message: "You are already subscribed to this punter." });
    }

    // Calculate total available balance
    const totalBalance = user.balance + user.promoBalance;

    // Check if the user has enough combined balance
    if (totalBalance < price) {
      return res.status(402).json({ message: "Insufficient balance to subscribe." });
    }

    // --- New Payment Logic ---
    let remainingPrice = price;
    
    // Deduct from promoBalance first
    if (user.promoBalance >= remainingPrice) {
      user.promoBalance -= remainingPrice;
      remainingPrice = 0;
    } else {
      remainingPrice -= user.promoBalance;
      user.promoBalance = 0;
    }
    
    // Deduct remaining from main balance
    if (remainingPrice > 0) {
      user.balance -= remainingPrice;
    }
    // --- End of New Payment Logic ---

    // Calculate the punter's share (80% of the price)
    const punterEarnings = price * 0.80;

    // Add the punter's earnings to their balance
    punter.balance += punterEarnings;

    // Create a transaction for the user's payment
    const userTransaction = await Transaction.create({
      user: userId,
      type: "subscription",
      amount: -price, // Negative amount to represent a debit
      status: "success",
      description: `Subscription to ${punter.username} (${plan} plan)`,
    });
    
    // Create a transaction for the punter's earnings
    const punterTransaction = await Transaction.create({
      user: punterId,
      type: "payment",
      amount: punterEarnings,
      status: "success",
      description: `Earnings from new subscriber`,
    });

    // Create a notification for the punter
    const notification = await Notification.create({
      title: "New Subscriber",
      description: `Earnings from new subscriber`,
      type: "success",
      amount: punterEarnings,
    });

    // Add new subscription to the user's subscribedPunters array
    user.subscribedPunters.push({
      punterId,
      plan,
      price,
      subscriptionDate: new Date(),
    });
    
    // Add the user's ID to the punter's subscribers array
    punter.subscribers.push(userId);

    // Add transaction IDs to both user and punter
    user.transactions.push(userTransaction._id);
    punter.transactions.push(punterTransaction._id);

    // Add the notification ID to the punter's notifications array
    punter.notifications.push(notification._id);

    // Save changes to both documents
    await user.save();
    await punter.save();

    res.status(200).json({
      message: "Subscription successful! Your balance has been updated.",
      subscription: user.subscribedPunters.find(
        (sub) => sub.punterId.toString() === punterId
      ),
      newBalance: user.balance,
      newPromoBalance: user.promoBalance,
    });
  } catch (error) {
    console.error("Error during subscription:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;