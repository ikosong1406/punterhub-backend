import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "subscription", "payment","redeemed"],
      required: true,
    },
    amount: { 
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "reversed"], 
      default: "pending",
    },
    paymentMethod: { type: String },
    // Use this for the Paystack reference/transaction ID
    reference: { type: String, index: true }, 
    description: { type: String },
    
    // --- UPDATED DETAILS SUB-SCHEMA ---
    details: {
      type: new Schema({
        // Provided by User (for record-keeping)
        userName: { type: String },
        bankCode: { type: String },
        bankName: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },

        // Paystack Automation Fields
        // Paystack's unique identifier for the bank account
        paystackRecipientCode: { type: String }, 
        // Paystack's unique transfer tracking ID
        paystackTransferCode: { type: String },
        // (Optional) The specific Paystack response message on failure
        errorMessage: { type: String }, 
      }, { _id: false }),
      required: function() {
        return this.type === "withdrawal";
      },
    },
  },
  { timestamps: true }
);

export default model("Transaction", transactionSchema);