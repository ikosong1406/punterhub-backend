import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const punters = await User.find(
      { isPunter: true }, // Filter for punters
      {
        _id: 1,
        profilePicture: 1,
        username: 1,
        primaryCategory: 1,
        secondaryCategory: 1,
        rating: 1,
        win: 1,
        loss: 1,
        price: 1,
      }
    );

    res.status(200).json({
      status: "ok",
      count: punters.length,
      data: punters,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
