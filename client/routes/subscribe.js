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

    // Check if the user has enough balance
    if (user.balance < price) {
      return res.status(402).json({ message: "Insufficient balance to subscribe." });
    }

    // Calculate the punter's share (80% of the price)
    const punterEarnings = price * 0.80;

    // Deduct the full price from the user's balance
    user.balance -= price;

    // Add the punter's earnings to their balance
    punter.balance += punterEarnings;

    // Create a transaction for the user's payment
    const userTransaction = await Transaction.create({
      user: userId,
      type: "subscription",
      amount: -price, // Negative amount to represent a debit
      status: "completed",
      description: `Subscription to ${punter.username} (${plan} plan)`,
    });
    
    // Create a transaction for the punter's earnings
    const punterTransaction = await Transaction.create({
      user: punterId,
      type: "payment",
      amount: punterEarnings,
      status: "completed",
      description: `Earnings from new subscriber: ${user.username}`,
    });

    // Create a notification for the punter
    const notification = await Notification.create({
      title: "New Subscriber",
      description: `${user.username} has subscribed to your signals.`,
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
    });
  } catch (error) {
    console.error("Error during subscription:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;