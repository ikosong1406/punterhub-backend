import express from "express";
import User from "../models/user.schema.js"; // Assuming this path is correct

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, punterId } = req.body;

    // --- 1. Input Validation ---
    if (!userId || !punterId) {
      return res.status(400).json({ 
        message: "Missing required parameters: userId and punterId are required." 
      });
    }

    // --- 2. Fetch User Data ---
    // Select the necessary array field only.
    const user = await User.findOne({ _id: userId }).select("subscribedPunters"); 

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Define the subscription duration (7 days)
    const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;

    // --- 3. Check for Active Subscription ---
    const activeSubscription = user.subscribedPunters.find(
      (sub) =>
        sub.punterId.toString() === punterId.toString() && // Use toString() on punterId for robustness
        new Date(sub.subscriptionDate).getTime() + sevenDaysInMilliseconds > Date.now()
    );

    // If an active subscription is found, return the status and the plan details.
    if (activeSubscription) {
      return res.status(200).json({
        isSubscribed: true,
        plan: activeSubscription.plan, // Explicitly return the plan
        subscription: activeSubscription, // Return the full object for more details
      });
    }

    // --- 4. Check for and Remove Expired Subscription ---
    // If an active subscription was not found, check if an *expired* one exists.
    const expiredSubscription = user.subscribedPunters.find(
      (sub) =>
        sub.punterId.toString() === punterId.toString() && // Use toString() on punterId for robustness
        new Date(sub.subscriptionDate).getTime() + sevenDaysInMilliseconds <= Date.now()
    );

    if (expiredSubscription) {
      // Remove the expired subscription from the user's array in the database.
      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            subscribedPunters: {
              punterId: expiredSubscription.punterId, // Use the ID from the found sub-document for precise removal
            },
          },
        }
      );
      // After removal, the user is not subscribed.
      return res.status(200).json({ 
        isSubscribed: false,
        message: "Expired subscription found and removed."
      });
    }

    // --- 5. No Subscription Found ---
    // If no subscription (active or expired) was found for the given punterId.
    return res.status(200).json({
      isSubscribed: false,
      message: "No subscription found for this punter."
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

export default router;