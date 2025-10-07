import { Router } from 'express';
import mongoose from 'mongoose';
import Tip from '../models/tip.schema.js';   // Adjust path as needed
import User from '../models/user.schema.js'; // Adjust path as needed

const router = Router();

// Define the commission rate as a constant (20% commission means 80% goes to punter)
const PUNTER_SHARE = 0.8;

router.post('/', async (req, res) => {
    const { tipId, punterId, status } = req.body;

    if (!tipId || !punterId || !status) {
        return res.status(400).json({ 
            message: 'tipId, punterId, and status are all required in the request body.' 
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // --- 1. FIND TIP AND PUNTER (Pre-flight checks) ---
        const tip = await Tip.findById(tipId).session(session);
        const punter = await User.findById(punterId).session(session);

        if (!tip) {
            await session.abortTransaction();
            return res.status(404).json({ message: `Tip with ID ${tipId} not found.` });
        }
        
        if (!punter) {
            await session.abortTransaction();
            return res.status(404).json({ message: `Punter with ID ${punterId} not found.` });
        }

        // Enforce that the punterId in the request body matches the punterId on the tip document
        if (tip.punterId.toString() !== punterId.toString()) {
            await session.abortTransaction();
            return res.status(403).json({ 
                message: 'Punter ID mismatch. You are not authorized to update this tip.' 
            });
        }
        
        // --- 2. HANDLE STATUS CHANGE ---
        let message = '';
        let updatedTip = null;

        if (status === 'closed') {
            // A. Handle 'closed' status: Simple update
            tip.status = 'closed';
            updatedTip = await tip.save({ session });
            message = 'Tip status updated to closed.';

        } else if (status === 'redeemed') {
            // B. Handle 'redeemed' status: Update status AND perform financial transaction
            if (tip.status === 'redeemed') {
                 await session.abortTransaction();
                 return res.status(400).json({ message: 'Tip is already redeemed.' });
            }

            // Calculate the amount to credit the punter
            const salesRevenue = tip.sales * tip.price;
            const punterCreditAmount = salesRevenue * PUNTER_SHARE; // 80% share

            // 2.1. Update Tip Status
            tip.status = 'redeemed';
            updatedTip = await tip.save({ session });
            
            // 2.2. Update Punter Balance
            // Assumes the User model has a 'balance' field (type: Number, default: 0)
            punter.balance = (punter.balance || 0) + punterCreditAmount;
            await punter.save({ session });

            message = `Tip redeemed successfully. Punter credited: $${punterCreditAmount.toFixed(2)}`;

        } else {
            // C. Invalid Status
            await session.abortTransaction();
            return res.status(400).json({ 
                message: 'Invalid status provided. Must be "closed" or "redeemed".' 
            });
        }

        // --- 3. COMMIT TRANSACTION and Send Response ---
        await session.commitTransaction();
        res.status(200).json({ 
            message: message, 
            tip: updatedTip,
            punterBalance: punter.balance // Include the new balance for confirmation
        });

    } catch (error) {
        // --- 4. ABORT TRANSACTION and Handle Error ---
        await session.abortTransaction();
        console.error('Transaction Error:', error);
        
        // Handle CastError for invalid ObjectIds
        if (error.name === 'CastError') {
             return res.status(400).json({
                message: 'Invalid ID format provided.',
                error: error.message
            });
        }

        res.status(500).json({ 
            message: 'Server error during status update/redemption.', 
            error: error.message 
        });
    } finally {
        session.endSession();
    }
});

export default router;