import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, username, primaryCategory, secondaryCategory } = req.body;

    // Validate required fields
    if (!userId || !username || !primaryCategory || !secondaryCategory) {
      return res.status(400).json({ 
        error: "User ID, username, primary category, and secondary category are required" 
      });
    }

    // Validate primary category
    const validPrimaryCategories = ["sports", "trading"];
    if (!validPrimaryCategories.includes(primaryCategory)) {
      return res.status(400).json({ 
        error: "Invalid primary category. Must be either 'sports' or 'trading'" 
      });
    }

    // Validate secondary category based on primary category
    const validSportsSubcategories = ["football", "basketball", "tennis", "cricket", "baseball"];
    const validTradingSubcategories = ["forex", "crypto", "stocks", "commodities", "indices"];
    
    if (primaryCategory === "sports" && !validSportsSubcategories.includes(secondaryCategory)) {
      return res.status(400).json({ 
        error: "Invalid sports subcategory" 
      });
    }
    
    if (primaryCategory === "trading" && !validTradingSubcategories.includes(secondaryCategory)) {
      return res.status(400).json({ 
        error: "Invalid trading subcategory" 
      });
    }

    // Find and update the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user to punter status with categories
    user.isPunter = true;
    user.role = "punter";
    user.username = username;
    user.primaryCategory = primaryCategory;
    user.secondaryCategory = secondaryCategory;

    await user.save();

    res.status(200).json({
      status: "ok",
      message: "User is now a punter",
    });
  } catch (error) {
    console.error("Error in becomePunter route:", error);
    res.status(500).json({ 
      error: "Server error", 
      details: error.message 
    });
  }
});

export default router;