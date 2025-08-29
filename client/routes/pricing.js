import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

// PUT route to update a user's pricing plans
router.post('/', async (req, res) => {
  const { userId, plans } = req.body;

  try {
    // Find the user by ID and update the entire pricingPlans object
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { pricingPlans: plans } },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).select('pricingPlans');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Pricing plans updated successfully', 
      pricingPlans: updatedUser.pricingPlans 
    });
  } catch (error) {
    console.error("Error updating pricing plans:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;