import express from "express";
import mongoose from "mongoose";
import Stripe from "stripe";

import User from "../client/models/user.schema.js";
import Payment from "../client/models/payment.schema.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_LIVE_SECRET_KEY);

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      const signature = req.headers["stripe-signature"];

      if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).send("Missing webhook signature.");
      }

      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.error("Stripe signature verification failed:", error);
      return res.status(400).send("Invalid Stripe signature.");
    }

    // Handle successful card payments. For delayed payment methods,
    // Stripe can also emit async_payment_succeeded.
    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded"
    ) {
      return res.status(200).json({ received: true });
    }

    const checkout = event.data.object;

    try {
      // Do not activate access until Stripe reports that funds are paid.
      if (checkout.payment_status !== "paid") {
        return res.status(200).json({ received: true });
      }

      const paymentId = checkout.metadata?.paymentId;
      const userId = checkout.metadata?.userId;
      const plan = checkout.metadata?.plan;

      if (!paymentId || !userId || !plan) {
        console.error("Missing payment metadata:", checkout.id);
        return res.status(400).send("Missing payment metadata.");
      }

      const mongoSession = await mongoose.startSession();

      try {
        await mongoSession.withTransaction(async () => {
          const payment = await Payment.findOne({
            _id: paymentId,
            userId,
            plan,
            stripeSessionId: checkout.id,
          }).session(mongoSession);

          if (!payment) {
            throw new Error("Matching payment record not found.");
          }

          // Idempotency: a repeated webhook must not grant access twice.
          if (payment.status === "paid") {
            return;
          }

          if (
            payment.status !== "pending" ||
            checkout.amount_total !== payment.amount ||
            checkout.currency !== payment.currency
          ) {
            throw new Error("Payment details do not match the order.");
          }

          const user = await User.findById(userId).session(mongoSession);

          if (!user) {
            throw new Error("User associated with payment not found.");
          }

          // Keep your existing subscription structure.
          user.subscription.push({
            plan: payment.plan,
            price: payment.amount / 100,
            subscriptionDate: new Date(),
          });

          await user.save({ session: mongoSession });

          payment.status = "paid";
          payment.stripePaymentIntentId =
            typeof checkout.payment_intent === "string"
              ? checkout.payment_intent
              : null;
          payment.paidAt = new Date();

          await payment.save({ session: mongoSession });
        });
      } finally {
        await mongoSession.endSession();
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Stripe webhook processing failed:", error);

      // Return 5xx so Stripe can retry transient failures.
      return res.status(500).send("Webhook processing failed.");
    }
  },
);

export default router;
