import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Find a user with the given username (case-insensitive)
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } });

    // isAvailable is true if no user is found, false otherwise
    const isAvailable = !user;

    res.status(200).json({
      isAvailable: isAvailable,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;