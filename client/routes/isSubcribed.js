import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

// Check if a user is subscribed to a specific punter
router.post("/", async (req, res) => {
  try {
    const { userId, punterId } = req.body;

    // Find user with only subscribedPunters
    const user = await User.findById(userId).select("subscribedPunters");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check subscription existence
    const subscription = user.subscribedPunters.find(
      sub => sub.punterId.toString() === punterId
    );

    if (subscription) {
      return res.status(200).json({
        isSubscribed: true,
        subscription
      });
    } else {
      return res.status(200).json({
        isSubscribed: false
      });
    }

  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
