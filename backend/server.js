import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/userRoutes.js";
import petitionRoutes from "./routes/petitionRoutes.js";

dotenv.config();
const app = express();

// ES MODULE dirname resolver
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------
// ⭐ CORS FIX — ALL VERCEL URLs ADDED
// -------------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://online-petition-portal.vercel.app",
      "https://online-petition-portal-git-main-surya-kumars-projects-d7755a57.vercel.app",
      "https://online-petition-portal-kb6r7z6n2-surya-kumars-projects-d7755a57.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Allow preflight
app.options("*", cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/petitions", petitionRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Backend OK", time: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});