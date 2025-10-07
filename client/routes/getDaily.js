import { Router } from 'express';
import Tip from '../models/tip.schema.js';

const router = Router();

// --- NEW GET /api/tips Route ---
router.get('/', async (req, res) => {
    try {
        const tips = await Tip.find({}).lean(); 

        if (tips.length === 0) {
            return res.status(404).json({ message: 'No tips found in the database.' });
        }
        
        // Send the array of tips as a JSON response
        res.status(200).json({
            message: 'Successfully retrieved all tips.',
            count: tips.length,
            data: tips
        });

    } catch (error) {
        // Handle database errors or server issues
        console.error('Error fetching tips:', error);
        res.status(500).json({ 
            message: 'Server error while fetching tips.', 
            error: error.message 
        });
    }
});

export default router;