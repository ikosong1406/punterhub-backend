// paystack.router.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import axios from "axios";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const router = express.Router();

router.post("/", async (req, res) => {
  const { accountNumber, bankCode } = req.body;

  if (!accountNumber || !bankCode) {
    return res
      .status(400)
      .json({
        error: "Account number and bank code are required for verification.",
      });
  }

  if (!PAYSTACK_SECRET_KEY) {
    // This is a safety check. Ensure the key is loaded from your environment.
    return res
      .status(500)
      .json({
        error: "Server configuration error: Paystack Secret Key is missing.",
      });
  }

  try {
    const paystackUrl = `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;

    // SECURELY CALLING PAYSTACK WITH THE SECRET KEY
    const response = await axios.get(paystackUrl, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (response.data.status) {
      // Success: Return only the necessary data to the client
      return res.status(200).json({
        status: "ok",
        message: "Account resolved successfully",
        data: {
          account_name: response.data.data.account_name,
          account_number: response.data.data.account_number,
          bank_id: response.data.data.bank_id,
        },
      });
    } else {
      // Paystack returned status: false
      return res.status(400).json({ error: response.data.message });
    }
  } catch (error) {
    console.error("Paystack API Error:", error.response?.data || error.message);

    // Handle common Paystack error status (e.g., 400 for invalid bank/account)
    const errorMessage =
      error.response?.data?.message ||
      "Failed to resolve account. Please check the details.";

    res.status(error.response?.status || 500).json({
      error: errorMessage,
      details: error.response?.data,
    });
  }
});

export default router;
