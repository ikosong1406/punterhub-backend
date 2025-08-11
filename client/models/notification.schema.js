import mongoose from "mongoose";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "success", "error", "payment"], default: "info" },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("Notification", notificationSchema);
