// routes/user.routes.js
import { Router } from "express";
import Transaction from "../../client/models/transaction.schema.js"; // Import the Transaction model

const router = Router();

// Route to get all user details
router.get("/", async (req, res) => {
  try {
    const list = await Transaction.find({}); // Fetch all users from the database
    res.json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching list:", error);
    res.status(500).json({ success: false, message: "Failed to fetch list" });
  }
});

export default router;
