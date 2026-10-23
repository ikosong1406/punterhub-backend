import express from "express";
import User from "../models/user.schema.js";
import Notification from "../models/notification.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, plan, price } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add new subscription to the user's subscribedPunters array
    user.subscription.push({
      plan,
      price,
      subscriptionDate: new Date(),
    });

    // Save changes to both documents
    await user.save();

    res.status(200).json({
      message: "Subscription successful!",
    });
  } catch (error) {
    console.error("Error during subscription:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;