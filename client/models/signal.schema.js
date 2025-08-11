import mongoose from "mongoose";

const { Schema, model } = mongoose;

const matchSchema = new Schema({
  team: { type: String, required: true },
  prediction: { type: String, required: true },
});

const signalSchema = new Schema(
  {
    primaryCategory: { type: String, required: true },
    secondaryCategory: { type: String },
    bettingSite: { type: String },
    bettingCode: { type: String },
    startTime: { type: Date }, // Match or signal start time
    totalOdd: { type: Number },
    confidenceLevel: { type: Number, min: 0, max: 100 }, // % confidence
    matches: [matchSchema],
    createdAt: { type: Date, default: Date.now }, // Auto-set creation date/time
    pair: { type: String }, // For Forex/Crypto e.g., "EUR/USD"
    direction: { type: String, enum: ["buy", "sell", "long", "short"] },
    entryPrice: { type: Number },
    takeProfit: { type: Number },
    stopLoss: { type: Number },
    timeFrame: { type: String }, // e.g., "1h", "4h", "1d"
    status: { type: String, enum: ["pending", "won", "lost", "cancelled"], default: "pending" },
    thumbsUp: { type: Number, default: 0 },
    thumbsDown: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("Signal", signalSchema);
