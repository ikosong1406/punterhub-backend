import { Router } from "express";
import Tip from "../models/tip.schema.js"; // Adjust path as needed

const router = Router();

router.post("/", async (req, res) => {
  // 1. Get the userId from the request body
  const { userId } = req.body;

  // Basic validation
  if (!userId) {
    return res
      .status(400)
      .json({ message: "userId is required in the request body." });
  }

  try {
    // 2. Find all tips where the punterId matches the provided userId
    const userTips = await Tip.find({ punterId: userId })
      .sort({ createdAt: -1 }) // Sort by newest tips first
      .lean(); // Use .lean() for faster read performance

    // NEW CODE (Preferred solution):
    // 3. Check if any tips were found
    if (userTips.length === 0) {
      // A 200 OK status with empty data is standard for a successful search with no results.
      return res.status(200).json({
        message: `No tips found for user ID.`,
        count: 0, // Explicitly set count to 0
        data: [], // Explicitly set data to an empty array
      });
    }

    // 4. Success Response
    res.status(200).json({
      count: userTips.length,
      data: userTips,
    });
  } catch (error) {
    // Handle potential Mongoose casting errors (if userId is invalid) or other DB errors
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid userId format provided.",
        error: error.message,
      });
    }

    console.error("Error fetching user-specific tips:", error);
    res.status(500).json({
      message: "Server error while searching for tips.",
      error: error.message,
    });
  }
});

// Export the router
export default router;
