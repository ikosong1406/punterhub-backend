import express from "express";
import Identification from "../models/identification.schema.js";

const router = express.Router();

// POST /api/identification
router.post("/", async (req, res) => {
  try {
    const { userId, userFullname,idType, idPhotoFront, idPhotoBack } = req.body;

    if (!idPhotoFront) {
      return res.status(400).json({ message: "Front ID photo is required" });
    }

    // Save to MongoDB
    const identification = new Identification({
      userId,
      userFullname,
      idType,
      idPhotos: {
        front: idPhotoFront,
        back: idPhotoBack || null,
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
});

export default router;
