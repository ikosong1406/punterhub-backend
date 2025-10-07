import mongoose from "mongoose";

const { Schema, model } = mongoose;

// New Schema for a single pricing plan
const pricingSchema = new Schema(
  {
    price: { type: Number },
    offers: [{ type: String }],
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
    isPromoted: { type: Boolean, default: false },
    isMessageable: { type: Boolean, default: false },
    primaryCategory: { type: String },
    secondaryCategory: { type: String },
    username: { type: String },
    bio: { type: String },
    promoCode: { type: String },
    signals: [{ type: Schema.Types.ObjectId, ref: "Signal" }],
    subscribers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dailyPosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tip",
      },
    ],
    dailyBought: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tip",
      },
    ],
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    promoBalance: { type: Number, default: 0 },
    transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
    chat: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    subscribedPunters: [
      {
        punterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        plan: String,
        price: Number,
        subscriptionDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    pricingPlans: {
      silver: pricingSchema,
      gold: pricingSchema,
      diamond: pricingSchema,
    },
    resetCode: {
      type: Number,
      required: false,
    },
    resetCodeExpires: {
      type: Date,
      required: false,
    },
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
