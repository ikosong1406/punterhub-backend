// routes/user.routes.js
import { Router } from "express";
import Identification from "../../client/models/identification.schema.js"

const router = Router();

// Route to get all user details
router.get("/", async (req, res) => {
  try {
    const list = await Identification.find({}); // Fetch all users from the database
    res.json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching list:", error);
    res.status(500).json({ success: false, message: "Failed to fetch list" });
  }
});

export default router;
