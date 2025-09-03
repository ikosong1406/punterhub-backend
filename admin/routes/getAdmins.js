// routes/user.routes.js
import { Router } from "express";
import Admin from "../models/admin.schema.js";

const router = Router();

// Route to get all user details
router.get("/", async (req, res) => {
  try {
    const users = await Admin.find({}); // Fetch all users from the database
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user data" });
  }
});

export default router;
