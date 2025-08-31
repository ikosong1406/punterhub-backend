import express from 'express';
import UserReaction from '../models/reaction.schema.js';
import Signal from '../models/signal.schema.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { userId, signalId, type } = req.body;

    if (!userId || !signalId || !type || !['up', 'down'].includes(type)) {
        return res.status(400).json({ error: 'User ID, Signal ID, and a valid reaction type are required.' });
    }

    try {
        const signal = await Signal.findById(signalId);
        if (!signal) {
            return res.status(404).json({ error: 'Signal not found.' });
        }

        const existingReaction = await UserReaction.findOne({ userId, signalId });

        if (existingReaction) {
            if (existingReaction.reactionType === type) {
                await UserReaction.deleteOne({ _id: existingReaction._id });
                if (type === 'up') {
                    signal.thumbsUp = Math.max(0, signal.thumbsUp - 1);
                } else {
                    signal.thumbsDown = Math.max(0, signal.thumbsDown - 1);
                }
            } else {
                existingReaction.reactionType = type;
                await existingReaction.save();
                if (type === 'up') {
                    signal.thumbsUp += 1;
                    signal.thumbsDown = Math.max(0, signal.thumbsDown - 1);
                } else {
                    signal.thumbsDown += 1;
                    signal.thumbsUp = Math.max(0, signal.thumbsUp - 1);
                }
            }
        } else {
            const newReaction = new UserReaction({ userId, signalId, reactionType: type });
            await newReaction.save();
            if (type === 'up') {
                signal.thumbsUp += 1;
            } else {
                signal.thumbsDown += 1;
            }
        }
        
        await signal.save();
        res.status(200).json({ success: true, newCounts: { thumbsUp: signal.thumbsUp, thumbsDown: signal.thumbsDown } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating reaction.' });
    }
});

export default router;