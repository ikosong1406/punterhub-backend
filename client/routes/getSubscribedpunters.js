import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

// Get details of punters a user is subscribed to
router.get("/", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user and only fetch subscribedPunters
    const user = await User.findById(userId).select("subscribedPunters");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.subscribedPunters || user.subscribedPunters.length === 0) {
      return res.status(200).json({ message: "No subscriptions found", punters: [] });
    }

    // Extract punterIds from subscriptions
    const punterIds = user.subscribedPunters.map(sub => sub.punterId);

    // Fetch full punter details
    const punters = await User.find({ _id: { $in: punterIds } })
      .select("_id name username email profilePicture stats rating subscriptionPrice");

    res.status(200).json({
      message: "Subscribed punters retrieved successfully",
      punters
    });

  } catch (error) {
    console.error("Error fetching subscribed punters:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
