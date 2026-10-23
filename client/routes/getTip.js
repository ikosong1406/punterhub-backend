// routes/user.routes.js
import { Router } from "express";
import Tip from "../../client/models/tip.schema.js";

const router = Router();

// Route to get all user details
router.get("/", async (req, res) => {
  try {
    const tips = await Tip.find({});
    res.json({ success: true, data: tips });
  } catch (error) {
    console.error("Error fetching tips:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tip data" });
  }
});

export default router;
