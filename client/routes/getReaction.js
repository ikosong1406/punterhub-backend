import express from 'express';
import UserReaction from '../models/reaction.schema.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { userId, signalIds } = req.body;

    if (!userId || !signalIds || !Array.isArray(signalIds)) {
        return res.status(400).json({ error: 'User ID and a list of signal IDs are required.' });
    }

    try {
        const reactions = await UserReaction.find({ userId, signalId: { $in: signalIds } });
        const likedSignals = {};
        const dislikedSignals = {};
        
        reactions.forEach(reaction => {
            if (reaction.reactionType === 'up') {
                likedSignals[reaction.signalId] = true;
            } else {
                dislikedSignals[reaction.signalId] = true;
            }
        });

        res.status(200).json({ likedSignals, dislikedSignals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching user reactions.' });
    }
});

export default router;