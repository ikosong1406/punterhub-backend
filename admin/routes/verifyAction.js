// routes/identification.routes.js
import { Router } from "express";
import Identification from "../../client/models/identification.schema.js";
import User from "../../client/models/user.schema.js"; // Assuming you have a User model
import { sendMail } from "../../utils/mail.js";

const router = Router();

// Route to handle identification status update
router.post("/", async (req, res) => {
  const { id, userId, status } = req.body;

  if (!id || !userId || !status) {
    return res.status(400).json({ success: false, message: "Missing required fields: id, userId, or status" });
  }

  try {
    const identification = await Identification.findById(id);

    if (!identification) {
      return res.status(404).json({ success: false, message: "Identification not found" });
    }

    if (status === "approved") {
      // Update identification status to 'approved'
      identification.status = "approved";
      await identification.save();

      // Find user and update 'isverified' to true
      await User.findByIdAndUpdate(userId, { isVerified: true });

      res.json({ success: true, message: "Identification approved and user verified successfully" });
    } else if (status === "rejected") {
      // Update identification status to 'rejected'
      identification.status = "rejected";
      await identification.save();

      // Find user to get their email and send a rejection email
      const user = await User.findById(userId);
      if (user) {
        const subject = "Your Identification Status at The Punter Hub";
        const html = `
          <p>Hello ${user.firstname},</p>
          <p>We regret to inform you that your identification submission has been rejected. Please review our guidelines and try again.</p>
          <p>Thank you,</p>
          <p>The Punter Hub Team</p>
        `; // Placeholder for a rejection email template

        await sendMail(user.email, subject, null, html);
      }

      res.json({ success: true, message: "Identification rejected and rejection email sent" });
    } else {
      res.status(400).json({ success: false, message: "Invalid status provided. Must be 'approved' or 'rejected'" });
    }
  } catch (error) {
    console.error("Error updating identification status:", error);
    res.status(500).json({ success: false, message: "Failed to update identification status" });
  }
});

export default router;