import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    profilePicture: { type: String },
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    countryCode: { type: String },
    phonenumber: { type: String, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["user", "punter"],
      default: "user",
    },
    promoCode: { type: String },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: 0,
    },
    passwordReset: {
      code: {
        type: String,
        default: undefined,
      },
      expiresAt: {
        type: Date,
        default: undefined,
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "premium"],
        default: "free",
      },

      expiresAt: {
        type: Date,
        default: null,
      },
    },

    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  { timestamps: true },
);

export default model("User", userSchema);
