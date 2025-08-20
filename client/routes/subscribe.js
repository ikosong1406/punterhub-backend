import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

// Subscribe to a punter
router.post("/", async (req, res) => {
  try {
    const { userId, punterId } = req.body;

    if (!userId || !punterId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find both users
    const user = await User.findById(userId);
    const punter = await User.findById(punterId);

    if (!user || !punter) {
      return res.status(404).json({ message: "User or punter not found" });
    }

    // Check if already subscribed
    const alreadySubscribed = user.subscribedPunters.some(
      sub => sub.punterId.toString() === punterId
    );

    if (alreadySubscribed) {
      return res.status(400).json({ message: "Already subscribed to this punter" });
    }

    // Get the punter's subscription price
    const subscriptionPrice = punter.price; 

    if (!subscriptionPrice || subscriptionPrice <= 0) {
      return res.status(400).json({ message: "Punter's subscription price not set or invalid" });
    }
    
    // Check if user has sufficient balance
    if (user.balance < subscriptionPrice) {
      return res.status(402).json({ message: "Insufficient balance" });
    }
    
    // Deduct subscription price from user's balance
    user.balance -= subscriptionPrice;
    
    // Add subscription price to punter's balance
    punter.balance += subscriptionPrice;

    // Calculate subscription dates (weekly only)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    // Add subscription to the subscriber
    user.subscribedPunters.push({
      punterId,
      startDate,
      endDate
    });
    
    // Add subscriber to the punter
    punter.subscribers.push(userId);

    await user.save();
    await punter.save();

    res.status(200).json({
      message: "Subscription successful",
      subscription: { punterId, startDate, endDate }
    });

  } catch (error) {
    console.error("Error subscribing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;