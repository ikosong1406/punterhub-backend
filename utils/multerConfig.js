// multer-config.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinaryConfig.js"; // Adjust this if your config file path is different

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sharperly", // Change folder name as needed
    allowed_formats: ["jpeg", "jpg", "png"],
  },
});

const upload = multer({ storage });

export default upload;
