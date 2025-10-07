import { Router } from 'express';
import mongoose from 'mongoose';
import Tip from '../models/tip.schema.js';   // Adjust path as needed
import User from '../models/user.schema.js'; // Adjust path as needed

const router = Router();

// --- POST /api/tips/buy ---
router.post('/', async (req, res) => {
    const { userId, tipId } = req.body;

    if (!userId || !tipId) {
        return res.status(400).json({ 
            message: 'Both userId and tipId are required in the request body.' 
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // --- 1. FIND TIP AND USER (Pre-flight checks) ---
        // We use .select() to only fetch necessary fields for efficiency
        const tip = await Tip.findById(tipId).select('price sales status').session(session);
        const user = await User.findById(userId).select('balance dailyBought').session(session);

        if (!tip) {
            await session.abortTransaction();
            return res.status(404).json({ message: `Tip with ID ${tipId} not found.` });
        }
        
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: `User with ID ${userId} not found.` });
        }

        // --- 2. VALIDATION CHECKS ---

        // 2.1. Check if Tip is currently active
        if (tip.status !== 'active') {
            await session.abortTransaction();
            return res.status(400).json({ message: 'This tip is not available for purchase (status is not active).' });
        }

        // 2.2. Check if the tip is already bought
        // We convert ObjectIds to strings for safe comparison within the array
        const tipAlreadyBought = user.dailyBought.some(
            boughtTipId => boughtTipId.toString() === tipId.toString()
        );

        if (tipAlreadyBought) {
            await session.abortTransaction();
            return res.status(409).json({ // 409 Conflict is appropriate here
                message: 'You have already bought this tip. Please check your "My Tips" page.',
                tipId: tipId
            });
        }
        
        // 2.3. Check if user can afford the tip
        if (user.balance < tip.price) {
            await session.abortTransaction();
            return res.status(402).json({ // 402 Payment Required
                message: `Insufficient balance. Tip price is $${tip.price}, but your current balance is $${user.balance}.`,
                requiredPrice: tip.price,
                currentBalance: user.balance
            });
        }
        
        // --- 3. PERFORM TRANSACTION (If all checks pass) ---

        // 3.1. Deduct price from user balance
        user.balance -= tip.price;
        await user.save({ session });

        // 3.2. Add tipId to user.dailyBought
        user.dailyBought.push(tipId);
        await user.save({ session }); // Saving again to persist dailyBought array update

        // 3.3. Increment tip sales count
        tip.sales += 1;
        await tip.save({ session });

        // --- 4. COMMIT TRANSACTION and Send Response ---
        await session.commitTransaction();
        res.status(200).json({ 
            message: 'Tip purchase successful! Details have been added to your account.',
            newBalance: user.balance,
            tipSalesCount: tip.sales
        });

    } catch (error) {
        // --- 5. ABORT TRANSACTION and Handle Error ---
        await session.abortTransaction();
        console.error('Tip Purchase Transaction Error:', error);
        
        if (error.name === 'CastError') {
             return res.status(400).json({
                message: 'Invalid ID format provided.',
                error: error.message
            });
        }

        res.status(500).json({ 
            message: 'Server error during tip purchase transaction.', 
            error: error.message 
        });
    } finally {
        session.endSession();
    }
});

export default router;