import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn("⚠️ WARNING: JWT_SECRET is missing. Add it in Render environment!");
}

/** Extract JWT from Authorization header */
const getToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

/** Verify token and return payload */
const verify = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

/** USER AUTH — allows both user & admin */
export const requireAuth = (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired token" });

  req.user = payload;
  next();
};

/** ADMIN AUTH — only admins allowed */
export const adminAuth = (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired token" });

  if (payload.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }

  req.user = payload;
  next();
};

/** alias for backward compatibility (your routes use verifyAdminToken) */
export const verifyAdminToken = adminAuth;