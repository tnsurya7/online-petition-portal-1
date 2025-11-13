import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import petitionRoutes from "./routes/petitionRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Determine directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend build from ../dist
app.use(express.static(path.join(__dirname, "../dist")));

app.use("/api/users", userRoutes);
app.use("/api/petitions", petitionRoutes);

// Serve index.html for all other routes (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ✅ Use a dynamic port to avoid "EADDRINUSE"
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});