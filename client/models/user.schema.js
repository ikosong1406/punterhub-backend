import mongoose from "mongoose";

const { Schema, model } = mongoose;

const subscribedPunterSchema = new Schema(
  {
     punterId: { type: Schema.Types.ObjectId, ref: "User" },
    planType: { type: String, enum: ["weekly", "monthly"] },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    profilePicture: { type: String }, // URL to image
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    countryCode: { type: String },
    phonenumber: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "punter"], default: "user" },
    isPunter: { type: Boolean, default: false },
    primaryCategory: { type: String },
    secondaryCategory: { type: String },
    username: { type: String, unique: true },
    win: { type: Number, default: 0 },
    loss: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    price: {
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },
    bio: { type: String },
    promoCode: { type: String },
    signals: [{ type: Schema.Types.ObjectId, ref: "Signal" }],
    subscribers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
    
    // Updated: Store subscription type with punter ID
    subscribedPunters: [subscribedPunterSchema],

    bankdetails: {
      accountname: { type: String },
      accountnumber: { type: String },
      bank: { type: String },
    },
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  { timestamps: true }
);

export default model("User", userSchema);
