import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

// Subscribe to a punter
router.post("/", async (req, res) => {
  try {
    const { userId, punterId, planType } = req.body;

    if (!userId || !punterId || !planType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["weekly", "monthly"].includes(planType)) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (planType === "weekly") {
      endDate.setDate(endDate.getDate() + 7);
    } else if (planType === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
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

    // Add subscription to the subscriber
    user.subscribedPunters.push({
      punterId,
      planType,
      startDate,
      endDate
    });

    // Add subscriber to the punter
    punter.subscribers.push(userId);

    await user.save();
    await punter.save();

    res.status(200).json({
      message: "Subscription successful",
      subscription: { punterId, planType, startDate, endDate }
    });

  } catch (error) {
    console.error("Error subscribing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
