
import express from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import User from "../models/user.schema.js";
import Payment from "../models/payment.schema.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_LIVE_SECRET_KEY);

const ACCESS_DAYS = 30;
const ACCESS_MS = ACCESS_DAYS * 24 * 60 * 60 * 1000;

router.post("/", async (req, res) => {
  let payment;
  let claimedPayment = false;
  let userUpdated = false;

  try {
    const { sessionId } = req.body;

    if (
      typeof sessionId !== "string" ||
      !sessionId.startsWith("cs_")
    ) {
      return res.status(400).json({
        success: false,
        error: "A valid Checkout Session ID is required.",
      });
    }

    // Verify the Checkout Session directly with Stripe.
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.mode !== "payment" ||
      session.payment_status !== "paid"
    ) {
      return res.status(400).json({
        success: false,
        error: "Payment has not been confirmed by Stripe.",
      });
    }

    const paymentId = session.metadata?.paymentId;
    const userId = session.metadata?.userId;

    if (
      !paymentId ||
      !userId ||
      !mongoose.isValidObjectId(paymentId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        error: "The Checkout Session is missing valid payment details.",
      });
    }

    // Match the Stripe session to the original database payment.
    payment = await Payment.findOne({
      _id: paymentId,
      userId,
      stripeSessionId: session.id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "We couldn't match this session to a payment record.",
      });
    }

    // Verify the paid amount and currency match the saved order.
    if (
      session.amount_total !== payment.amount ||
      String(session.currency).toLowerCase() !==
        String(payment.currency).toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        error: "The payment amount or currency does not match the order.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "The account associated with this payment was not found.",
      });
    }

    // An already activated session must never add another 30 days.
    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Your Premium access is already active.",
        expiresAt: user.subscription?.expiresAt || null,
      });
    }

    // Claim the pending payment so concurrent requests cannot activate
    // the same payment more than once. Add "processing" to your Payment
    // schema's status enum if your schema uses an enum.
    const claimed = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: "pending",
      },
      {
        $set: { status: "processing" },
      },
      { new: true }
    );

    if (!claimed) {
      const latestPayment = await Payment.findById(payment._id);

      if (latestPayment?.status === "paid") {
        const latestUser = await User.findById(userId);

        return res.status(200).json({
          success: true,
          message: "Your Premium access is already active.",
          expiresAt: latestUser?.subscription?.expiresAt || null,
        });
      }

      return res.status(409).json({
        success: false,
        error:
          "This payment is already being processed. Please try again shortly.",
      });
    }

    claimedPayment = true;

    // Preserve any remaining access when the user renews early.
    const now = new Date();
    const existingExpiry = user.subscription?.expiresAt
      ? new Date(user.subscription.expiresAt)
      : now;

    const accessStartsAt =
      existingExpiry > now ? existingExpiry : now;

    const expiresAt = new Date(
      accessStartsAt.getTime() + ACCESS_MS
    );

    user.subscription.plan = "premium";
    user.subscription.expiresAt = expiresAt;

    await user.save();
    userUpdated = true;

    payment.status = "paid";
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment confirmed. Your Premium access is active.",
      plan: "premium",
      expiresAt,
    });
  } catch (error) {
    console.error("Premium activation error:", error);
    return res.status(500).json({
      success: false,
      error: "We couldn't activate Premium right now. Please try again.",
    });
  }
});

export default router;
