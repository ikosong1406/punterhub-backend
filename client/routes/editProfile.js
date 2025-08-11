import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

/**
 * PUT /api/edit-profile
 * Body: {
 *   userId: "",
 *   firstname?: "",
 *   lastname?: "",
 *   email?: "",
 *   phoneCode?: "",
 *   phoneNumber?: "",
 *   profilePicture?: "",
 *   primaryCategory?: "",
 *   secondaryCategory?: ""
 * }
 */
router.put("/", async (req, res) => {
  try {
    const { userId, ...updateFields } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Remove fields that are undefined or empty string
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined || updateFields[key] === "") {
        delete updateFields[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true } // return updated document
    ).select("-password -confirmPassword"); // exclude sensitive fields

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      status: "ok",
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
