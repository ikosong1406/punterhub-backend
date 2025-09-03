// routes/user.routes.js
import { Router } from "express";
import Signal from "../../client/models/signal.schema.js"

const router = Router();

// Route to get all user details
router.get("/", async (req, res) => {
  try {
    const signals = await Signal.find({}); // Fetch all signals from the database
    res.json({ success: true, data: signals });
  } catch (error) {
    console.error("Error fetching signals:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch signal data" });
  }
});

export default router;
