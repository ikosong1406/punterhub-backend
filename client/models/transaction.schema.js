import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "subscription", "payment"],
    },
    amount: { 
      type: Number, 
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String },
    // The 'unique: true' constraint has been removed
    reference: { type: String }, 
    description: { type: String },
    details: {
      type: new Schema({
        bankCode: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },
      }, { _id: false }),
      required: function() {
        return this.type === "withdrawal";
      },
    },
  },
  { timestamps: true }
);

export default model("Transaction", transactionSchema);