import express from "express";
import mongoose from "mongoose";
import User from "../models/user.schema.js";
import Signal from "../models/signal.schema.js";

const router = express.Router();

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

    const user = await User.findById(userId).select("subscribedPunters");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.subscribedPunters?.length)
      return res.status(200).json({ status: "ok", data: [] });

    const now = new Date();
    const validPunterIds = [];
    const planMap = new Map();

    user.subscribedPunters.forEach((sub) => {
      if (!sub.punterId) return;
      const subDate = new Date(sub.subscriptionDate);
      const expiry = new Date(subDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (now <= expiry) {
        validPunterIds.push(sub.punterId);
        planMap.set(sub.punterId.toString(), sub.plan);
      }
    });

    if (!validPunterIds.length)
      return res.status(200).json({ status: "ok", data: [] });

    const punters = await User.find({ _id: { $in: validPunterIds } }).select("_id username");

    // ✅ direct fetch by punterId instead of User.signals[]
    const signals = await Signal.find({ punterId: { $in: validPunterIds } })
    const allSignals = [];

    signals.forEach((sig) => {
      const plan = planMap.get(sig.punterId.toString());
      const allowed = getAllowedTipTypes(plan);

      if (allowed.includes(sig.tipType?.trim().toLowerCase())) {
        const punter = punters.find(
          (p) => p._id.toString() === sig.punterId.toString()
        );
        allSignals.push({
          ...sig.toObject(),
          punterUsername: punter?.username,
          subscribedPlan: plan,
        });
      }
    });

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