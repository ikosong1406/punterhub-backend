// routes/user.routes.js
import { Router } from "express";
import Tip from "../../client/models/tip.schema.js"

const router = Router();

// Route to get all user details
router.get("/", async (req, res) => {
  try {
    const Tips = await Tip.find({}); // Fetch all Tips from the database
    res.json({ success: true, data: Tips });
  } catch (error) {
    console.error("Error fetching Tips:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch Tip data" });
  }
});

export default router;
