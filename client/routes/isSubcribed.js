import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, punterId } = req.body;

    // Use findOne to get the user and check subscription status in a single pass.
    const user = await User.findOne({ _id: userId }).select("subscribedPunters");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const activeSubscription = user.subscribedPunters.find(
      (sub) =>
        sub.punterId.toString() === punterId &&
        new Date(sub.subscriptionDate).getTime() + sevenDaysInMilliseconds > Date.now()
    );

    // If an active subscription is found, return it immediately.
    if (activeSubscription) {
      return res.status(200).json({
        isSubscribed: true,
        subscription: activeSubscription,
      });
    }

    // If an active subscription was not found, check if an expired one exists and remove it.
    const expiredSubscription = user.subscribedPunters.find(
      (sub) =>
        sub.punterId.toString() === punterId &&
        new Date(sub.subscriptionDate).getTime() + sevenDaysInMilliseconds <= Date.now()
    );

    if (expiredSubscription) {
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            subscribedPunters: {
              punterId: punterId,
            },
          },
        }
      );
      // After removing the expired subscription, we can confidently return isSubscribed: false.
      return res.status(200).json({ isSubscribed: false });
    }

    // If no subscription (active or expired) was found for the given punterId.
    return res.status(200).json({
      isSubscribed: false,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;