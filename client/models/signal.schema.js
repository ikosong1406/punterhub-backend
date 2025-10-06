import mongoose from "mongoose";

const { Schema, model } = mongoose;

// --- Sub-schema for individual matches within a betting signal ---
const matchSchema = new Schema({
  teams: { type: String },
  prediction: { type: String },
});

// --- New sub-schema for user comments ---
const commentSchema = new Schema(
  {
    user: {
      type: String,
      required: true,
      trim: true, // Store the username of the commenter
    },
    comment: {
      type: String,
      required: true,
    },
    // Mongoose's timestamps option will automatically handle the comment time
  },
  {
    timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
  }
);

// --- Main schema for a betting signal or tip ---
const signalSchema = new Schema(
  {
    // General Signal/Tip Fields
    primaryCategory: { type: String },
    secondaryCategory: { type: String },
    tipType: { type: String },

    // Sports Betting Fields
    bettingSite: { type: String },
    bettingCode: { type: String },
    matches: [matchSchema], // Array of individual matches

    // Forex/Crypto Trading Fields
    pair: { type: String }, // e.g., "EUR/USD"
    direction: { type: String, enum: ["buy", "sell", "long", "short"] },
    entryPrice: { type: Number },
    takeProfit: { type: Number },
    stopLoss: { type: Number },
    timeFrame: { type: String }, // e.g., "1h", "4h", "1d"

    // Common Fields
    startTime: { type: Date }, // Match or signal start time
    totalOdd: { type: Number },
    confidenceLevel: { type: Number, min: 0, max: 100 }, // % confidence
    status: {
      type: String,
      enum: ["active", "win", "loss"],
      default: "active",
    },

    // User Engagement Fields
    thumbsUp: { type: Number, default: 0 },
    thumbsDown: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },

    // --- Added Field for Comments ---
    comments: [commentSchema], // Array of user comments
    punterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds 'createdAt' and 'updatedAt' to the Signal document
  }
);

// Note: Removed the redundant 'createdAt' field from signalSchema
// because 'timestamps: true' handles it more cleanly.

export default model("Signal", signalSchema);
