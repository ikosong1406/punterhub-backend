import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $match: { isPunter: true },
      },
      {
        $project: {
           _id: "$_id", // Exclude the default _id field
          username: "$username",
          primaryCategory: "$primaryCategory",
          subscribers: { $size: "$subscribers" }, // Count the number of elements in the subscribers array
        },
      },
      {
        $sort: { subscribers: -1 },
      },
      {
        $limit: 50,
      },
    ]);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;