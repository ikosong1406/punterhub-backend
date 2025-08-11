import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deposit", "withdrawal", "subscription", "payment"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    paymentMethod: { type: String }, // e.g., "bank transfer", "crypto", "card"
    reference: { type: String, unique: true }, // Transaction reference ID
    description: { type: String },
  },
  { timestamps: true }
);

export default model("Transaction", transactionSchema);
