import mongoose from "mongoose";

const { Schema, model } = mongoose;

// --- Sub-schema for individual matches within a betting signal ---
const matchSchema = new Schema({
  teams: { type: String },
  prediction: { type: String },
});

// --- Main schema for a betting signal or tip ---
const tipSchema = new Schema(
  {
    // General Signal/Tip Fields
    primaryCategory: { type: String },

    // Sports Betting Fields
    bettingSite: { type: String },
    bettingCode: { type: String },
    matches: [matchSchema], // Array of individual matches

    // Common Fields
    startTime: { type: Date }, // Match or signal start time
    totalOdd: { type: Number },
    confidenceLevel: { type: Number, min: 0, max: 100 }, // % confidence
    status: {
      type: String,
      enum: ["active", "win", "loss"],
      default: "active",
    },
  },
  {
    timestamps: true, // Adds 'createdAt' and 'updatedAt' to the Signal document
  }
);


export default model("Tip", tipSchema);
