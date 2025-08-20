import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "subscription", "payment"],
      required: true, // Type is required
    },
    amount: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      required: true,
    },
    paymentMethod: { type: String }, // e.g., "bank transfer", "crypto", "card"
    reference: { type: String, unique: true }, // Transaction reference ID
    description: { type: String },
    details: {
      // New field to store withdrawal or other transaction-specific data
      type: new Schema({
        bankCode: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },
        // Add other relevant fields for different transaction types
        // e.g., for deposits, you could store a 'receiptUrl'
      }, { _id: false }), // Set _id: false to prevent Mongoose from creating an _id for the nested document
      required: function() {
        // This makes the 'details' field required only for 'withdrawal' transactions
        return this.type === "withdrawal";
      },
    },
  },
  { timestamps: true }
);

export default model("Transaction", transactionSchema);