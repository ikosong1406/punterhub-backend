import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Identification from "../models/identification.schema.js";

const router = express.Router();

// Set your host URL manually
const BASE_URL = "https://thepunterhub.com"; // change this to your actual domain

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "public_html", "upload");

    // ensure "upload" folder exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/identification
router.post(
  "/",
  upload.fields([
    { name: "idPhotoFront", maxCount: 1 },
    { name: "idPhotoBack", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { userId, userFullname } = req.body;

      if (!req.files["idPhotoFront"]) {
        return res.status(400).json({ message: "Front ID photo is required" });
      }

      // Build URLs using hardcoded BASE_URL
      const frontUrl = `${BASE_URL}/upload/${req.files["idPhotoFront"][0].filename}`;
      const backUrl = req.files["idPhotoBack"]
        ? `${BASE_URL}/upload/${req.files["idPhotoBack"][0].filename}`
        : null;

      // Save to MongoDB
      const identification = new Identification({
        userId,
        userFullname,
        idPhotos: {
          front: frontUrl,
          back: backUrl,
        },
      });

      await identification.save();

      res.status(201).json({
        message: "Identification uploaded successfully",
        data: identification,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

export default router;
