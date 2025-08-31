import mongoose from 'mongoose';

const userReactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  signalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signal', required: true },
  reactionType: { type: String, enum: ['up', 'down'], required: true },
}, {
    timestamps: true
});

userReactionSchema.index({ userId: 1, signalId: 1 }, { unique: true });

export default mongoose.model('UserReaction', userReactionSchema);