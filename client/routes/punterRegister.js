// user.routes.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.schema.js";
import { sendMail } from "../../utils/mail.js"; // Your mail sender config
import { welcomeTemplate } from "../templates/welcome.js"; // Your HTML email template

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const BONUS_AMOUNT = 1; // Amount given when someone's promo code is used

// Helper to generate unique promo codes
const generatePromoCode = (firstname) => {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `${firstname.toUpperCase()}${randomNum}`;
};

router.post("/", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phoneCode,
      phoneNumber,
      password,
      promoCode,
      username,
      primaryCategory,
      secondaryCategory,
      price,
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required." });
    }

    // Check password match and length
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    // Check if user already exists (email or phone)
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneCode, phonenumber: phoneNumber }],
    });

    if (existingUser) {
      // Differentiate between email and phone number conflict
      if (existingUser.email === email) {
        return res
          .status(409)
          .json({ message: "An account with this email already exists." });
      }
      if (
        existingUser.phonenumber === phoneNumber &&
        existingUser.phoneCode === phoneCode
      ) {
        return res.status(409).json({
          message: "An account with this phone number already exists.",
        });
      }
      // Fallback for general conflict
      return res.status(409).json({
        message: "An account with this email or phone number already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique promo code for new user
    let newPromoCode = generatePromoCode(firstname);
    while (await User.findOne({ promoCode: newPromoCode })) {
      newPromoCode = generatePromoCode(firstname);
    }

    // Create new user
    const newUser = new User({
      firstname,
      lastname,
      email,
      countryCode: phoneCode,
      phonenumber: phoneNumber,
      password: hashedPassword,
      promoCode: newPromoCode,
      balance: 0,
      isPunter: true,
      role: "punter",
      username: username,
      primaryCategory: primaryCategory,
      secondaryCategory: secondaryCategory,
      price: price,
    });

    await newUser.save();

    // If promoCode provided, give bonus to its owner
    if (promoCode) {
      const referrer = await User.findOne({ promoCode });
      if (referrer) {
        referrer.balance += BONUS_AMOUNT;
        await referrer.save();
      }
    }

    // Send welcome email (optional, but good practice)
    try {
      const subject = "Welcome to The Punter Hub 🎉";
      const html = welcomeTemplate(newUser.firstname, newUser.promoCode);

      await sendMail(newUser.email, subject, null, html);
    } catch (emailErr) {
      console.error("Error sending welcome email:", emailErr.message);
    }

    res.status(201).json({
      status: "ok",
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error("Server error during registration:", error);
    // Generic server error response
    res
      .status(500)
      .json({ message: "A server error occurred. Please try again later." });
  }
});

export default router;
