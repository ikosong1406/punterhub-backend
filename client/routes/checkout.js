
import express from "express";
import Stripe from "stripe";
import User from "../models/user.schema.js";
import Payment from "../models/payment.schema.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_LIVE_SECRET_KEY);

const REGIONAL_COUNTRIES = ["NG", "GH", "KE"];

const PLANS = {
  premium: {
    name: "Premium",
    regionalAmount: 999,
    standardAmount: 1999,
    currency: "gbp",
    durationDays: 30,
  },
};

router.post("/", async (req, res) => {
  let payment;

  try {
    const { userId, plan, countryCode } = req.body;

    if (!userId || typeof plan !== "string" || !countryCode) {
      return res.status(400).json({
        error: "User ID, plan, and country code are required.",
      });
    }

    const normalizedPlan = plan.trim().toLowerCase();
    const normalizedCountry = String(countryCode).trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(normalizedCountry)) {
      return res.status(400).json({
        error: "Invalid country code.",
      });
    }

    const selectedPlan = PLANS[normalizedPlan];

    if (!selectedPlan) {
      return res.status(400).json({
        error: "Invalid subscription plan.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    // Calculate the one-time payment amount.
    const isRegional = REGIONAL_COUNTRIES.includes(normalizedCountry);
    const amount = isRegional
      ? selectedPlan.regionalAmount
      : selectedPlan.standardAmount;

    // Save a pending payment before creating the Checkout Session.
    payment = await Payment.create({
      userId: user._id,
      plan: normalizedPlan,
      amount,
      currency: selectedPlan.currency,
      status: "pending",
    });

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",

        line_items: [
          {
            price_data: {
              currency: selectedPlan.currency,
              unit_amount: amount,
              product_data: {
                name: `${selectedPlan.name} — 30 Days Access`,
                description:
                  "Payment for 30 days of Premium access.",
              },
            },
            quantity: 1,
          },
        ],

        customer_email: user.email,

        client_reference_id: payment._id.toString(),

        metadata: {
          paymentId: payment._id.toString(),
          userId: user._id.toString(),
          plan: normalizedPlan,
          countryCode: normalizedCountry,
          durationDays: String(selectedPlan.durationDays),
        },

        payment_intent_data: {
          metadata: {
            paymentId: payment._id.toString(),
            userId: user._id.toString(),
            plan: normalizedPlan,
            countryCode: normalizedCountry,
            durationDays: String(selectedPlan.durationDays),
          },
        },

        success_url:
          `${process.env.CLIENT_URL}/success` +
          "?session_id={CHECKOUT_SESSION_ID}",

        cancel_url: `${process.env.CLIENT_URL}/cancel`,
      },
      {
        idempotencyKey: `payment-${payment._id}`,
      }
    );

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL.");
    }

    payment.stripeSessionId = session.id;
    await payment.save();

    return res.status(200).json({
      message: "Checkout session created.",
      url: session.url,
      checkoutUrl: session.url,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error creating one-time Checkout Session:", error);

    if (payment) {
      await Payment.updateOne(
        { _id: payment._id, status: "pending" },
        { $set: { status: "failed" } }
      ).catch((updateError) => {
        console.error("Failed to update payment status:", updateError);
      });
    }

    return res.status(500).json({
      error: "Unable to start your payment. Please try again.",
    });
  }
});

export default router;
