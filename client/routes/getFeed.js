import express from "express";
import mongoose from "mongoose";
import User from "../models/user.schema.js";
import Signal from "../models/signal.schema.js";

const router = express.Router();

// Helper: what tipTypes are allowed by plan
const getAllowedTipTypes = (plan) => {
  if (!plan) return [];
  const lower = plan.toLowerCase();
  if (lower === "silver") return ["silver"];
  if (lower === "gold") return ["silver", "gold"];
  if (lower === "diamond") return ["silver", "gold", "diamond"];
  return [];
};

router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "UserId is required" });

    // 1. Get user with subscribed punters
    const user = await User.findById(userId).select("subscribedPunters");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.subscribedPunters?.length)
      return res.status(200).json({ status: "ok", data: [] });

    const now = new Date();
    const validPunterIds = [];
    const planMap = new Map();

    // 2. Filter out expired subscriptions
    user.subscribedPunters.forEach((sub) => {
      if (!sub.punterId) return;
      const expiry = new Date(sub.subscriptionDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (now <= expiry) {
        validPunterIds.push(sub.punterId);
        planMap.set(sub.punterId.toString(), sub.plan);
      }
    });

    // 3. Get punters and populate their signals
    const punters = await User.find({ _id: { $in: validPunterIds } })
      .select("_id username signals")
      .populate({
        path: "signals",
        model: Signal,
        select: "tipType description createdAt", // select the fields you want
      });

    // 4. Filter and collect signals
    const allSignals = [];

    punters.forEach((punter) => {
      const plan = planMap.get(punter._id.toString());
      const allowed = getAllowedTipTypes(plan);

      punter.signals.forEach((sig) => {
        if (allowed.includes(sig.tipType?.toLowerCase())) {
          allSignals.push({
            ...sig.toObject(),
            punterId: punter._id,
            punterUsername: punter.username,
            subscribedPlan: plan,
          });
        }
      });
    });

    // 5. Sort by newest first
    allSignals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      status: "ok",
      count: allSignals.length,
      data: allSignals,
    });
  } catch (err) {
    console.error("Error fetching signals:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
