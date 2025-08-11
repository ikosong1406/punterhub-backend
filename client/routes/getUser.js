import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.schema.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email; // Assuming you encoded the email in the token payload

    User.findOne({ email: userEmail })
      .then((data) => {
        if (!data) {
          return res.status(404).send({ error: "User not found" });
        }
        return res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        console.error("Error finding user:", error);
        return res.status(500).send({ error: "Server error" });
      });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).send({ error: "Invalid or expired token" });
  }
});

export default router;
