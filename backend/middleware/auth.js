// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Extract Bearer token
const getToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

// Verify JWT
const verify = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// ✔ USER authentication
export const verifyUserToken = (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  req.user = payload;
  next();
};

// ✔ ADMIN authentication
export const verifyAdminToken = (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  if (payload.role !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }

  req.user = payload;
  next();
};

// ✔ Also export aliases for compatibility
export const requireAuth = verifyUserToken;
export const adminAuth = verifyAdminToken;