import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const getToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

const verify = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

export const requireAuth = (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  req.user = payload;
  next();
};

export const adminAuth = (req, res, next) => {
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

export const verifyAdminToken = adminAuth; // 👈 REQUIRED EXPORT