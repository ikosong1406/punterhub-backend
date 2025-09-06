import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import http from "http"; // Add this import
import client from "./client/index.js"
import admin from "./admin/index.js"

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

if (typeof MONGO_URI !== "string") {
  console.error("❌ MONGO_URI is not a string:", MONGO_URI);
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch((e) => {
    console.error("❌ Database connection error:", e.message);
    process.exit(1);
  });

// // Create HTTP server
const server = http.createServer(app);

// // Routes
app.get("/", (_req, res) => {
  res.send("Welcome to PunterHub API");
});

app.use("/client", client);
app.use("/admin", admin);
app.use("/upload", express.static(path.join(process.cwd(), "public_html", "upload")));


// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
