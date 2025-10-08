import { Router } from 'express';
import Tip from '../models/tip.schema.js';   // Adjust path as needed
import User from '../models/user.schema.js'; // Adjust path as needed

const router = Router();

// --- GET /api/tips/bought/:userId ---
// This route is for fetching all tips a user has purchased.
router.post('/', async (req, res) => {
    // 1. Get the userId from the request body
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required in the request body.' });
    }

    try {
        // 2. Find the User and populate the dailyBought field
        // Mongoose's .populate() is the most efficient way to fetch related documents.
        const user = await User.findById(userId)
            .select('dailyBought') // Only retrieve the dailyBought array
            .populate({
                path: 'dailyBought',
                model: 'Tip', // Use the Tip model
                // Optional: You can select which fields of the Tip to retrieve
                // select: 'description price primaryCategory status' 
            })
            .lean(); // Convert result to plain JS object

        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found.` });
        }
        
        const boughtTips = user.dailyBought;

        // 3. Check if the user has bought any tips
        if (!boughtTips || boughtTips.length === 0) {
            return res.status(200).json({ 
                message: 'You have not purchased any tips yet.',
                data: []
            });
        }
        
        // 4. Success Response
        // The boughtTips array already contains the fully fetched Tip objects due to .populate()
        res.status(200).json({
            message: `Successfully retrieved ${boughtTips.length} purchased tips.`,
            count: boughtTips.length,
            data: boughtTips
        });

    } catch (error) {
        // Handle Mongoose casting errors (if userId is invalid) or other DB errors
        if (error.name === 'CastError') {
             return res.status(400).json({
                message: 'Invalid user ID format provided.',
                error: error.message
            });
        }
        
        console.error('Error fetching purchased tips:', error);
        res.status(500).json({ 
            message: 'Server error while fetching purchased tips.', 
            error: error.message 
        });
    }
});

export default router;