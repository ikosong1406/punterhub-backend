import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import client from "./client/index.js";
import admin from "./admin/index.js";

const app = express();
app.use(express.json());

// ------------------------------------------------------------------
// 💡 FIX APPLIED: Custom CORS Configuration
// ------------------------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://punterhub-backend.onrender.com", 
  "https://app.thepunterhub.com",
  "https://api.thepunterhub.com",
  "https://admin.thepunterhub.com",
  "https://thepunterhub.vercel.app",
  "https://punterhub-admin.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or if the origin is in the allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Important if you use cookies or sessions
};

app.use(cors(corsOptions)); // Apply the custom options
// ------------------------------------------------------------------

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

// Create HTTP server
const server = http.createServer(app);

// Routes
app.get("/", (_req, res) => {
  res.send("Welcome to PunterHub API");
});

app.use("/client", client);
app.use("/admin", admin);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
