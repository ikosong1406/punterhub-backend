import { Router } from 'express';
import Tip from '../models/tip.schema.js'; // Adjust path as needed
import User from '../models/user.schema.js'; // Adjust path as needed

const router = Router();

router.post('/', async (req, res) => {
    // Destructure punterId first, as it's key to the initial check
    const {
        punterId, 
        punterName, 
        description, 
        price, 
        primaryCategory, 
        secondaryCategory, 
        bookingCode, 
        assets 
    } = req.body;

    // Basic validation to ensure punterId is present
    if (!punterId) {
        return res.status(400).json({ message: 'A valid punterId is required.' });
    }

    try {
        // --- 1. CHECK FOR USER EXISTENCE ---
        const user = await User.findById(punterId).select('_id dailyPosted');

        if (!user) {
            // If the user is NOT found, stop here and return an error.
            return res.status(404).json({ 
                message: `User with ID ${punterId} not found. Tip creation aborted.`
            });
        }
        
        // --- 2. CALCULATE EXPIRY TIME (24 hours from creation) ---
        // Get the current time
        const now = new Date();
        // Calculate expiry time (current time + 24 hours in milliseconds)
        const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
        const expiryTime = new Date(now.getTime() + ONE_DAY_IN_MS);


        // --- 3. Create the new Tip (ONLY if user is found) ---
          const newTip = new Tip({
              punterId,
              punterName,
              description,
              price,
              primaryCategory,
              secondaryCategory,
              // Use the calculated expiry time
              expiryTime, 
              bookingCode,
              assets,
          });

        // Save the new tip to the database
        const savedTip = await newTip.save();

        // --- 4. Update User's dailyPosted Array ---
        user.dailyPosted.push(savedTip._id);
        const updatedUser = await user.save();
        
        // --- 5. Success Response ---
        res.status(201).json({ 
            message: 'Tip created and linked to user successfully!', 
            tipId: savedTip._id, // Optionally return the new tip ID
        });

    } catch (error) {
        // Handle Mongoose validation errors or database connection errors
        console.error('Error creating tip or linking user:', error);
        
        // Check for common Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation failed for Tip creation.', 
                errors: error.errors 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error during transaction.', 
            error: error.message 
        });
    }
});

export default router;