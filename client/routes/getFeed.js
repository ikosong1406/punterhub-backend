import express from "express";
import User from "../models/user.schema.js";
import Signal from "../models/signal.schema.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    // Get the user and their subscribed punters, and also populate the punter details
    let user = await User.findById(userId).select("subscribedPunters");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.subscribedPunters || user.subscribedPunters.length === 0) {
      return res.status(200).json({ status: "ok", data: [] });
    }

    const now = new Date();
    const validSubscriptions = [];
    const subscriptionsToDelete = [];

    // Filter out expired subscriptions and build a map of valid punter IDs and their data
    const punterMap = new Map();
    user.subscribedPunters.forEach(subscription => {
      const subscriptionDate = new Date(subscription.subscriptionDate);
      const expiryDate = new Date(subscriptionDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

      if (now <= expiryDate) {
        validSubscriptions.push(subscription.punterId);
      } else {
        subscriptionsToDelete.push(subscription.punterId);
      }
    });

    // If there are expired subscriptions, remove them
    if (subscriptionsToDelete.length > 0) {
      user.subscribedPunters = user.subscribedPunters.filter(
        subscription => !subscriptionsToDelete.includes(subscription.punterId)
      );
      await user.save();
    }

    // If no valid subscriptions are left after filtering, return an empty array
    if (validSubscriptions.length === 0) {
      return res.status(200).json({ status: "ok", data: [] });
    }

    // Get signals from all valid subscribed punters, populating the signals
    const punters = await User.find({ _id: { $in: validSubscriptions } })
      .select("username signals")
      .populate("signals");

    // Collect all signals into a single array and add punter details
    const allSignals = punters.flatMap(punter =>
      punter.signals.map(signal => ({
        ...signal.toObject(),
        punterId: punter._id,
        punterUsername: punter.username,
      }))
    );
    
    // Sort signals by newest first
    allSignals.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      status: "ok",
      count: allSignals.length,
      data: allSignals,
    });
  } catch (error) {
    console.error("Error fetching signals:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;