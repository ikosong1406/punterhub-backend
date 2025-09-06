// models/Identification.js
import mongoose from "mongoose";

const IdentificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // If linked to User
    ref: "User",
    required: true,
  },
  userFullname: {
    type: String,
    required: true,
  },
  idPhotos: {
    front: { type: String, required: true }, // URL of front photo
    back: { type: String }, // optional
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Identification", IdentificationSchema);
