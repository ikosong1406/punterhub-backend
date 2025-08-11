import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.schema.js";
import Signal from "../models/signal.schema.js"; // Make sure your signal schema file name matches

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Get the logged-in user
    const user = await User.findById(decoded.id).select("subscribedPunters");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.subscribedPunters || user.subscribedPunters.length === 0) {
      return res.status(200).json({ status: "ok", data: [] });
    }

    // Get signals from all subscribed punters
    const punters = await User.find({ _id: { $in: user.subscribedPunters } }).select("signals");

    // Collect all signal IDs into a single array
    const allSignalIds = punters.flatMap(punter => punter.signals);

    if (allSignalIds.length === 0) {
      return res.status(200).json({ status: "ok", data: [] });
    }

    // Fetch full signal details sorted by newest
    const signals = await Signal.find({ _id: { $in: allSignalIds } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "ok",
      count: signals.length,
      data: signals,
    });

  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
