import express from "express";
import Stripe from "stripe";
import User from "../models/user.schema.js";
import Payment from "../models/payment.schema.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY);

// Use your actual plans and prices.
const PLANS = {
  basic: {
    name: "Basic",
    amount: 999,
    currency: "gbp",
  },
  premium: {
    name: "Premium",
    amount: 1999,
    currency: "gbp",
  },
};

router.post("/", async (req, res) => {
  try {
    const { userId, plan } = req.body;

    if (!userId || typeof plan !== "string") {
      return res.status(400).json({
        message: "User ID and plan are required.",
      });
    }

    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        message: "Invalid subscription plan.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Create a pending payment before redirecting to Stripe.
    const payment = await Payment.create({
      userId: user._id,
      plan,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      status: "pending",
    });

    try {
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          payment_method_types: ["card"],

          line_items: [
            {
              price_data: {
                currency: selectedPlan.currency,
                unit_amount: selectedPlan.amount,
                product_data: {
                  name: `${selectedPlan.name} Plan`,
                },
              },
              quantity: 1,
            },
          ],

          // Connect the Stripe transaction to our payment record.
          client_reference_id: payment._id.toString(),

          metadata: {
            paymentId: payment._id.toString(),
            userId: user._id.toString(),
            plan,
          },

          payment_intent_data: {
            metadata: {
              paymentId: payment._id.toString(),
              userId: user._id.toString(),
              plan,
            },
          },

          success_url:
            `${process.env.CLIENT_URL}/payment/success` +
            "?session_id={CHECKOUT_SESSION_ID}",

          cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
        },
        {
          idempotencyKey: `payment-${payment._id}`,
        },
      );

      if (!session.url) {
        throw new Error("Stripe Checkout URL was not returned.");
      }

      payment.stripeSessionId = session.id;
      await payment.save();

      return res.status(200).json({
        message: "Checkout session created.",
        checkoutUrl: session.url,
        paymentId: payment._id,
      });
    } catch (error) {
      await Payment.updateOne(
        { _id: payment._id, status: "pending" },
        { $set: { status: "failed" } },
      );

      throw error;
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);

    return res.status(500).json({
      message: "Unable to start payment.",
    });
  }
});

export default router;
