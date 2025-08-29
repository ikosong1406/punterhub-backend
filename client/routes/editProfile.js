import express from "express";
import User from "../models/user.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { userId, username, phonenumber, isMessageable } = req.body;

    // Basic Validation
    if (!username || !phonenumber || isMessageable === undefined) {
        return res.status(400).json({ message: 'Missing required profile fields.' });
    }

    try {
        // Find the user by the ID attached from the protect middleware
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update the user's fields
        user.username = username;
        user.phonenumber = phonenumber;
        user.isMessageable = isMessageable;

        // Save the updated user document
        const updatedUser = await user.save();

        // Return a successful response with the updated user data (optional)
        res.status(200).json({
            message: 'Profile updated successfully!',
            updatedUser: {
                _id: updatedUser._id,
                username: updatedUser.username,
                phonenumber: updatedUser.phonenumber,
                isMessageable: updatedUser.isMessageable,
            }
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error. Could not update profile.' });
    }
});

export default router;
